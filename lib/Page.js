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
    errorHandler: logger.error,
  });
}

/**
 * Util Methods
 */

function baseUrlFromRoot(filePath, root, lookUp) {
  function calculate(file, result) {
    if (file === root || !pathIsInside(file, root)) {
      return undefined;
    }
    const parent = path.dirname(file);
    if (lookUp[parent] && result.length === 1) {
      return path.relative(root, result[0]);
    } else if (lookUp[parent]) {
      return calculate(parent, [parent]);
    }
    return calculate(parent, result);
  }

  return calculate(filePath, []);
}

function unique(array) {
  return array.filter((item, pos, self) => self.indexOf(item) === pos);
}

Page.prototype.prepareTemplateData = function () {
  return {
    baseUrl: this.baseUrl,
    content: this.content,
    title: this.title,
    asset: this.asset,
  };
};

Page.prototype.generate = function (builtFiles) {
  return new Promise((resolve, reject) => {
    this.markbinder.includeFile(this.sourcePath)
      .then(result => this.markbinder.resolveBaseUrl(result, {
        baseUrlMap: this.baseUrlMap,
        rootPath: this.rootPath,
      }))
      .then(result => fs.outputFileAsync(this.tempPath, result))
      .then(() => this.markbinder.renderFile(this.tempPath))
      .then((result) => {
        this.content = htmlBeautify(result, { indent_size: 2 });

        const newBaseUrl = baseUrlFromRoot(this.sourcePath, this.rootPath, this.baseUrlMap);
        const baseUrl = newBaseUrl ? `${this.baseUrl}/${newBaseUrl}` : this.baseUrl;
        const hostBaseUrl = this.baseUrl;

        this.content = nunjucks.renderString(this.content, { baseUrl, hostBaseUrl });
        return fs.outputFileAsync(this.resultPath, this.template(this.prepareTemplateData()));
      })
      .then(() => {
        const resolvingFiles = [];
        unique(this.markbinder.getDynamicIncludeSrc()).forEach((source) => {
          if (!FsUtil.isUrl(source.to)) {
            resolvingFiles.push(this.resolveDependency(source, builtFiles));
          }
        });
        return Promise.all(resolvingFiles);
      })
      .then(resolve)
      .catch(reject);
  });
};

/**
 * Pre-render an external dynamic dependency
 * Does not pre-render if file is already pre-rendered by another page during site generation
 * @param dependency a map of the external dependency and where it is included
 * @param builtFiles set of files already pre-rendered by another page
 */
Page.prototype.resolveDependency = function (dependency, builtFiles) {
  const source = dependency.from;
  const file = dependency.to;
  return new Promise((resolve, reject) => {
    const markbinder = new MarkBind();
    const resultDir = path.dirname(path.resolve(this.resultPath, path.relative(this.sourcePath, file)));
    const resultPath = path.join(resultDir, FsUtil.setExtension(path.basename(file), '._include_.html'));

    if (builtFiles[resultPath]) {
      return resolve();
    }

    // eslint-disable-next-line no-param-reassign
    builtFiles[resultPath] = true;

    let tempPath;
    if (FsUtil.isInRoot(this.rootPath, file)) {
      tempPath = path.join(path.dirname(this.tempPath), path.relative(this.rootPath, file));
    } else {
      logger.info(`Converting dynamic external resource ${file} to ${resultPath}`);
      tempPath = path.join(path.dirname(this.tempPath), '.external', path.basename(file));
    }
    return markbinder.includeFile(file, {
      baseUrlMap: this.baseUrlMap,
      rootPath: this.rootPath,
    })
      .then(result => this.markbinder.resolveBaseUrl(result, {
        baseUrlMap: this.baseUrlMap,
        rootPath: this.rootPath,
        isDynamic: true,
        dynamicSource: source,
      }))
      .then(result => fs.outputFileAsync(tempPath, result))
      .then(() => markbinder.renderFile(tempPath))
      .then((result) => {
        // resolve the site base url here
        const newBaseUrl = baseUrlFromRoot(file, this.rootPath, this.baseUrlMap);
        const baseUrl = newBaseUrl ? `${this.baseUrl}/${newBaseUrl}` : this.baseUrl;
        const hostBaseUrl = this.baseUrl;

        const content = nunjucks.renderString(result, { baseUrl, hostBaseUrl });
        return fs.outputFileAsync(resultPath, htmlBeautify(content, { indent_size: 2 }));
      })
      .then(() => {
        // Recursion call to resolve nested dependency
        const resolvingFiles = [];
        unique(markbinder.getDynamicIncludeSrc()).forEach((src) => {
          if (!FsUtil.isUrl(src.to)) resolvingFiles.push(this.resolveDependency(src, builtFiles));
        });
        return Promise.all(resolvingFiles);
      })
      .then(resolve)
      .catch(reject);
  });
};

module.exports = Page;
