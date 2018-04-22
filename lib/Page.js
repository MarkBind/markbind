const cheerio = require('cheerio');
const fm = require('fastmatter');
const fs = require('fs-extra-promise');
const htmlBeautify = require('js-beautify').html;
const nunjucks = require('nunjucks');
const path = require('path');
const pathIsInside = require('path-is-inside');
const Promise = require('bluebird');

const FsUtil = require('./util/fsUtil');
const logger = require('./util/logger');
const MarkBind = require('./markbind/lib/parser');

const FRONT_MATTER_FENCE = '---';
const TITLE_PREFIX_SEPARATOR = ' - ';

cheerio.prototype.options.xmlMode = true; // Enable xml mode for self-closing tag
cheerio.prototype.options.decodeEntities = false; // Don't escape HTML entities

function Page(pageConfig) {
  this.asset = pageConfig.asset;
  this.baseUrl = pageConfig.baseUrl;
  this.baseUrlMap = pageConfig.baseUrlMap;
  this.content = pageConfig.content || '';
  this.rootPath = pageConfig.rootPath;
  this.src = pageConfig.src;
  this.template = pageConfig.pageTemplate;
  this.title = pageConfig.title || '';
  this.titlePrefix = pageConfig.titlePrefix;
  this.userDefinedVariablesMap = pageConfig.userDefinedVariablesMap;

  // the source file for rendering this page
  this.sourcePath = pageConfig.sourcePath;
  // the temp path for writing intermediate result
  this.tempPath = pageConfig.tempPath;
  // the output path of this page
  this.resultPath = pageConfig.resultPath;

  this.frontMatter = {};
  this.includedFiles = {};
}

/**
 * Util Methods
 */

function calculateNewBaseUrl(filePath, root, lookUp) {
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
    asset: this.asset,
    baseUrl: this.baseUrl,
    content: this.content,
    title: this.title,
  };
};

/**
 * Records the dynamic or static included files into this.includedFiles
 * @param dependencies array of maps of the external dependency and where it is included
 */
Page.prototype.collectIncludedFiles = function (dependencies) {
  dependencies.forEach((dependency) => {
    this.includedFiles[dependency.to] = true;
  });
};

/**
 * Records the front matter into this.frontMatter
 * @param includedPage a page with its dependencies included
 */
Page.prototype.collectFrontMatter = function (includedPage) {
  const $ = cheerio.load(includedPage);
  const frontMatter = $('frontmatter');
  if (frontMatter.length) {
    // Retrieves the front matter from either the first frontmatter element
    // or from a frontmatter element that includes from another file
    // The latter case will result in the data being wrapped in a div
    const frontMatterData = frontMatter.find('div').length
      ? frontMatter.find('div')[0].children[0].data
      : frontMatter[0].children[0].data;
    const frontMatterWrapped = `${FRONT_MATTER_FENCE}\n${frontMatterData}${FRONT_MATTER_FENCE}`;
    // Parse front matter data
    const parsedData = fm(frontMatterWrapped);
    this.frontMatter = parsedData.attributes;
    this.frontMatter.src = this.src;
    // Title specified in site.json will override title specified in front matter
    this.frontMatter.title = (this.title || this.frontMatter.title || '');
    if (this.titlePrefix) {
      this.frontMatter.title = this.frontMatter.title
        ? this.titlePrefix + TITLE_PREFIX_SEPARATOR + this.frontMatter.title
        : this.titlePrefix;
    }
  } else {
    // Page is addressable but no front matter specified
    const formattedTitle = this.titlePrefix
      ? this.titlePrefix + (this.title ? TITLE_PREFIX_SEPARATOR + this.title : '')
      : this.title;
    this.frontMatter = {
      src: this.src,
      title: formattedTitle,
    };
  }
  this.title = this.frontMatter.title;
};

/**
 * Removes the front matter from an included page
 * @param includedPage a page with its dependencies included
 */
Page.prototype.removeFrontMatter = function (includedPage) {
  const $ = cheerio.load(includedPage);
  const frontMatter = $('frontmatter');
  frontMatter.remove();
  return $.html();
};

Page.prototype.generate = function (builtFiles) {
  this.includedFiles = {};
  this.includedFiles[this.sourcePath] = true;

  const markbinder = new MarkBind({
    errorHandler: logger.error,
  });
  const fileConfig = {
    baseUrlMap: this.baseUrlMap,
    rootPath: this.rootPath,
    userDefinedVariablesMap: this.userDefinedVariablesMap,
  };
  return new Promise((resolve, reject) => {
    markbinder.includeFile(this.sourcePath, fileConfig)
      .then((result) => {
        this.collectFrontMatter(result);
        return this.removeFrontMatter(result);
      })
      .then(result => markbinder.resolveBaseUrl(result, fileConfig))
      .then(result => fs.outputFileAsync(this.tempPath, result))
      .then(() => markbinder.renderFile(this.tempPath, fileConfig))
      .then((result) => {
        this.content = htmlBeautify(result, { indent_size: 2 });

        const newBaseUrl = calculateNewBaseUrl(this.sourcePath, this.rootPath, this.baseUrlMap);
        const baseUrl = newBaseUrl ? `${this.baseUrl}/${newBaseUrl}` : this.baseUrl;
        const hostBaseUrl = this.baseUrl;

        this.content = nunjucks.renderString(this.content, { baseUrl, hostBaseUrl });
        return fs.outputFileAsync(this.resultPath, this.template(this.prepareTemplateData()));
      })
      .then(() => {
        const resolvingFiles = [];
        unique(markbinder.getDynamicIncludeSrc()).forEach((source) => {
          if (!FsUtil.isUrl(source.to)) {
            resolvingFiles.push(this.resolveDependency(source, builtFiles));
          }
        });
        return Promise.all(resolvingFiles);
      })
      .then(() => {
        this.collectIncludedFiles(markbinder.getDynamicIncludeSrc());
        this.collectIncludedFiles(markbinder.getStaticIncludeSrc());
        this.collectIncludedFiles(markbinder.getBoilerplateIncludeSrc());
        this.collectIncludedFiles(markbinder.getMissingIncludeSrc());
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
  const file = dependency.asIfTo;
  return new Promise((resolve, reject) => {
    const resultDir = path.dirname(path.resolve(this.resultPath, path.relative(this.sourcePath, file)));
    const resultPath = path.join(resultDir, FsUtil.setExtension(path.basename(file), '._include_.html'));

    if (builtFiles[resultPath]) {
      return resolve();
    }

    // eslint-disable-next-line no-param-reassign
    builtFiles[resultPath] = true;

    /*
     * We create a local instance of Markbind for an empty dynamicIncludeSrc
     * so that we only recursively rebuild the file's included content
     */
    const markbinder = new MarkBind({
      errorHandler: logger.error,
    });

    let tempPath;
    if (FsUtil.isInRoot(this.rootPath, file)) {
      tempPath = path.join(path.dirname(this.tempPath), path.relative(this.rootPath, file));
    } else {
      logger.info(`Converting dynamic external resource ${file} to ${resultPath}`);
      tempPath = path.join(path.dirname(this.tempPath), '.external', path.basename(file));
    }
    return markbinder.includeFile(dependency.to, {
      baseUrlMap: this.baseUrlMap,
      userDefinedVariablesMap: this.userDefinedVariablesMap,
      rootPath: this.rootPath,
      cwf: file,
    })
      .then(result => this.removeFrontMatter(result))
      .then(result => markbinder.resolveBaseUrl(result, {
        baseUrlMap: this.baseUrlMap,
        rootPath: this.rootPath,
        isDynamic: true,
        dynamicSource: source,
      }))
      .then(result => fs.outputFileAsync(tempPath, result))
      .then(() => markbinder.renderFile(tempPath, {
        baseUrlMap: this.baseUrlMap,
        rootPath: this.rootPath,
      }))
      .then((result) => {
        // resolve the site base url here
        const newBaseUrl = calculateNewBaseUrl(file, this.rootPath, this.baseUrlMap);
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
      .then(() => {
        this.collectIncludedFiles(markbinder.getDynamicIncludeSrc());
        this.collectIncludedFiles(markbinder.getStaticIncludeSrc());
        this.collectIncludedFiles(markbinder.getBoilerplateIncludeSrc());
        this.collectIncludedFiles(markbinder.getMissingIncludeSrc());
      })
      .then(resolve)
      .catch(reject);
  });
};

module.exports = Page;
