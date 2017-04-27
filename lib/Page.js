const htmlBeautify = require('js-beautify').html;
const nunjucks = require('nunjucks');
const fs = require('fs-extra-promise');
const path = require('path');
const Promise = require('bluebird');
const logger = require('./util/logger');
const FsUtil = require('./util/fsUtil');

const MarkBind = require('markbind');

function Page(pageConfig) {
  this.content = pageConfig.content || '';
  this.title = pageConfig.title || '';
  this.rootPath = pageConfig.rootPath;
  // the source file for rendering this page
  this.sourcePath = pageConfig.sourcePath;
  // the temp path for writing intermediate result
  this.tempPath = pageConfig.tempPath;
  // the output path of this page
  this.resultPath = pageConfig.resultPath;
  this.template = pageConfig.pageTemplate;
  this.baseUrl = pageConfig.baseUrl || '/';
  this.asset = pageConfig.asset;
  this.markbinder = new MarkBind({
    errorHandler: logger.error
  });
}

Page.prototype.prepareTemplateData = function () {
  return {
    baseUrl: this.baseUrl,
    content: this.content,
    title: this.title,
    asset: this.asset
  }
};

Page.prototype.generate = function () {
  return new Promise((resolve, reject) => {
    this.markbinder.includeFile(this.sourcePath)
      .then((result) => {
        return fs.outputFileAsync(this.tempPath, result);
      })
      .then(() => {
        return this.markbinder.renderFile(this.tempPath)
      })
      .then((result) => {
        this.content = htmlBeautify(result, {indent_size: 2});
        // resolve the site base url here
        this.content = nunjucks.renderString(this.content, {baseUrl: this.baseUrl});
        return fs.outputFileAsync(this.resultPath, this.template(this.prepareTemplateData()));
      })
      .then(() => {
        let cleaningUpFiles = [];
        unique(this.markbinder.getDynamicIncludeSrc()).forEach((source) => {
          if (!FsUtil.isUrl(source)) {
            cleaningUpFiles.push(this.cleanUpDependency(source));
          }
        });
        return Promise.all(cleaningUpFiles);
      })
      .then(() => {
        let resolvingFiles = [];
        unique(this.markbinder.getDynamicIncludeSrc()).forEach((source) => {
          if (!FsUtil.isUrl(source)) {
            resolvingFiles.push(this.resolveDependency(source));
          }
        });
        return Promise.all(resolvingFiles);
      })
      .then(resolve)
      .catch(reject);
  });
};

/**
 * Clean up the existing included dynamic dependency files and render them again.
 * @param file
 */
Page.prototype.cleanUpDependency = function (file) {
  return new Promise((resolve, reject) => {
    let resultPath = path.join(path.dirname(this.resultPath), FsUtil.setExtension(path.basename(file), '._include_.html'));
    try {
      fs.statSync(resultPath).isFile();
      // File existed. Remove it.
      fs.removeAsync(resultPath)
        .then(resolve)
        .catch(reject);
    } catch (e) {
      resolve();
    }
  });
};

/**
 * Pre-render an external dynamic dependency to the same path as the current page
 * @param file
 */
Page.prototype.resolveDependency = function (file) {
  return new Promise((resolve, reject) => {
    let markbinder = new MarkBind();
    let resultPath = path.join(path.dirname(this.resultPath), FsUtil.setExtension(path.basename(file), '._include_.html'));
    let fileExists;
    try {
      fileExists = fs.statSync(resultPath).isFile();
    } catch (e) {
      fileExists = false;
    }
    // File exists, return.
    if (fileExists) {
      return resolve();
    }

    let tempPath;
    if (FsUtil.isInRoot(this.rootPath, file)) {
      tempPath = path.join(path.dirname(this.tempPath), path.relative(this.rootPath, file));
    } else {
      logger.info(`Converting dynamic external resource ${file} to ${resultPath}`);
      tempPath = path.join(path.dirname(this.tempPath), '.external', path.basename(file));
    }
    markbinder.includeFile(file)
      .then((result) => {
        return fs.outputFileAsync(tempPath, result);
      })
      .then(() => {
        return markbinder.renderFile(tempPath)
      })
      .then((result) => {
        return fs.outputFileAsync(resultPath, htmlBeautify(result, {indent_size: 2}));
      })
      .then(() => {
        // Recursion call to resolve nested dependency
        let resolvingFiles = [];
        unique(markbinder.getDynamicIncludeSrc()).forEach((source) => {
          !FsUtil.isUrl(source) && resolvingFiles.push(this.resolveDependency(source));
        });
        return Promise.all(resolvingFiles);
      })
      .then(resolve)
      .catch(reject);
  });
};

function unique(array) {
  return array.filter(function (item, pos, self) {
    return self.indexOf(item) === pos;
  });
}

module.exports = Page;
