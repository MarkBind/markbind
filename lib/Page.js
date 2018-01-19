const htmlBeautify = require('js-beautify').html;
const nunjucks = require('nunjucks');
const fs = require('fs-extra-promise');
const path = require('path');
const Promise = require('bluebird');
const logger = require('./util/logger');
const FsUtil = require('./util/fsUtil');
const pathIsInside = require('path-is-inside');

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
  this.baseUrl = pageConfig.baseUrl;
  this.asset = pageConfig.asset;
  this.baseUrlMap = pageConfig.baseUrlMap;
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
        return this.markbinder.resolveBaseUrl(result, {
          baseUrlMap: this.baseUrlMap,
          rootPath: this.rootPath
        });
      })
      .then((result) => {
        return fs.outputFileAsync(this.tempPath, result);
      })
      .then(() => {
        return this.markbinder.renderFile(this.tempPath)
      })
      .then((result) => {
        this.content = htmlBeautify(result, {indent_size: 2});

        let newBaseUrl = baseUrlFromRoot(this.sourcePath, this.rootPath, this.baseUrlMap);
        let baseUrl = newBaseUrl ? `${this.baseUrl}/${newBaseUrl}` : this.baseUrl;
        let hostBaseUrl = this.baseUrl;

        this.content = nunjucks.renderString(this.content, {baseUrl: baseUrl, hostBaseUrl: hostBaseUrl});
        return fs.outputFileAsync(this.resultPath, this.template(this.prepareTemplateData()));
      })
      .then(() => {
        let cleaningUpFiles = [];
        unique(this.markbinder.getDynamicIncludeSrc()).forEach((source) => {
          if (!FsUtil.isUrl(source.to)) {
            cleaningUpFiles.push(this.cleanUpDependency(source.to));
          }
        });
        return Promise.all(cleaningUpFiles);
      })
      .then(() => {
        let resolvingFiles = [];
        unique(this.markbinder.getDynamicIncludeSrc()).forEach((source) => {
          if (!FsUtil.isUrl(source.to)) {
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
    let resultDir = path.dirname(path.resolve(this.resultPath, path.relative(this.sourcePath, file)));
    let resultPath = path.join(resultDir, FsUtil.setExtension(path.basename(file), '._include_.html'));
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
Page.prototype.resolveDependency = function (dependency) {
  let source = dependency.from;
  let file = dependency.to;
  return new Promise((resolve, reject) => {
    let markbinder = new MarkBind();
    let resultDir = path.dirname(path.resolve(this.resultPath, path.relative(this.sourcePath, file)));
    let resultPath = path.join(resultDir, FsUtil.setExtension(path.basename(file), '._include_.html'));
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
    markbinder.includeFile(file, {
        baseUrlMap: this.baseUrlMap,
        rootPath: this.rootPath
      })
      .then((result) => {
        return this.markbinder.resolveBaseUrl(result, {
          baseUrlMap: this.baseUrlMap,
          rootPath: this.rootPath,
          isDynamic: true,
          dynamicSource: source
        });
      })
      .then((result) => {
        return fs.outputFileAsync(tempPath, result);
      })
      .then(() => {
        return markbinder.renderFile(tempPath)
      })
      .then((result) => {
        // resolve the site base url here
        let newBaseUrl = baseUrlFromRoot(file, this.rootPath, this.baseUrlMap);
        let baseUrl = newBaseUrl ? `${this.baseUrl}/${newBaseUrl}` : this.baseUrl;
        let hostBaseUrl = this.baseUrl;

        let content = nunjucks.renderString(result, {baseUrl: baseUrl, hostBaseUrl: hostBaseUrl});
        return fs.outputFileAsync(resultPath, htmlBeautify(content, {indent_size: 2}));
      })
      .then(() => {
        // Recursion call to resolve nested dependency
        let resolvingFiles = [];
        unique(markbinder.getDynamicIncludeSrc()).forEach((source) => {
          !FsUtil.isUrl(source.to) && resolvingFiles.push(this.resolveDependency(source));
        });
        return Promise.all(resolvingFiles);
      })
      .then(resolve)
      .catch(reject);
  });
};

function baseUrlFromRoot(filePath, root, lookUp) {
  function calculate(file, result) {
    if (file === root || !pathIsInside(file, root)) {
      return void 0;
    }
    let parent = path.dirname(file);
    if (lookUp[parent] && result.length == 1) {
      return path.relative(root, result[0]);
    } else if (lookUp[parent]) {
      return calculate(parent, [parent]);
    }
    return calculate(parent, result);
  }

  return calculate(filePath, []);
}

function unique(array) {
  return array.filter(function (item, pos, self) {
    return self.indexOf(item) === pos;
  });
}

module.exports = Page;
