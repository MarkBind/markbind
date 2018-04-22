/* eslint-disable no-underscore-dangle */

const cheerio = require('cheerio');
const fs = require('fs');
const htmlparser = require('htmlparser2');
const nunjucks = require('nunjucks');
const path = require('path');
const pathIsInside = require('path-is-inside');
const Promise = require('bluebird');
const url = require('url');

const _ = {};
_.clone = require('lodash/clone');
_.cloneDeep = require('lodash/cloneDeep');
_.hasIn = require('lodash/hasIn');
_.isArray = require('lodash/isArray');
_.isEmpty = require('lodash/isEmpty');
_.pick = require('lodash/pick');

const md = require('./markdown-it');
const utils = require('./utils');

cheerio.prototype.options.xmlMode = true; // Enable xml mode for self-closing tag
cheerio.prototype.options.decodeEntities = false; // Don't escape HTML entities

const ATTRIB_INCLUDE_PATH = 'include-path';
const ATTRIB_CWF = 'cwf';

const BOILERPLATE_FOLDER_NAME = '_markbind/boilerplates';

/*
 * Utils
 */

/**
* @throws Will throw an error if a non-absolute path or path outside the root is given
*/
function calculateNewBaseUrl(filePath, root, lookUp) {
  if (!path.isAbsolute(filePath)) {
    throw new Error(`Non-absolute path given to calculateNewBaseUrl: '${filePath}'`);
  }
  if (!pathIsInside(filePath, root)) {
    throw new Error(`Path given '${filePath}' is not in root '${root}'`);
  }
  function calculate(file, result) {
    if (file === root) {
      return { relative: path.relative(root, root), parent: root };
    }
    const parent = path.dirname(file);
    if (lookUp[parent] && result.length === 1) {
      return { relative: path.relative(parent, result[0]), parent };
    } else if (lookUp[parent]) {
      return calculate(parent, [parent]);
    }
    return calculate(parent, result);
  }

  return calculate(filePath, []);
}

function calculateBoilerplateFilePath(pathInBoilerplates, asIfAt, config) {
  const fileBase = calculateNewBaseUrl(asIfAt, config.rootPath, config.baseUrlMap).relative;
  return path.resolve(fileBase, BOILERPLATE_FOLDER_NAME, pathInBoilerplates);
}

function createErrorNode(element, error) {
  const errorElement = cheerio.parseHTML(utils.createErrorElement(error), true)[0];
  return Object.assign(element, _.pick(errorElement, ['name', 'attribs', 'children']));
}

function isText(element) {
  return element.type === 'text' || element.type === 'comment';
}

function Parser(options) {
  this._options = options || {};
  // eslint-disable-next-line no-console
  this._onError = this._options.errorHandler || console.error;
  this._fileCache = {};
  this.dynamicIncludeSrc = [];
  this.staticIncludeSrc = [];
  this.boilerplateIncludeSrc = [];
  this.missingIncludeSrc = [];
}

Parser.prototype.getDynamicIncludeSrc = function () {
  return _.clone(this.dynamicIncludeSrc);
};

Parser.prototype.getStaticIncludeSrc = function () {
  return _.clone(this.staticIncludeSrc);
};

Parser.prototype.getBoilerplateIncludeSrc = function () {
  return _.clone(this.boilerplateIncludeSrc);
};

Parser.prototype.getMissingIncludeSrc = function () {
  return _.clone(this.missingIncludeSrc);
};

Parser.prototype._preprocess = function (node, context, config) {
  const element = node;
  const self = this;
  element.attribs = element.attribs || {};
  element.attribs[ATTRIB_CWF] = path.resolve(context.cwf);

  const requiresSrc = ['include', 'dynamic-panel'].includes(element.name);
  if (requiresSrc && _.isEmpty(element.attribs.src)) {
    const error = new Error(`Empty src attribute in ${element.name} in: ${element.attribs[ATTRIB_CWF]}`);
    this._onError(error);
    return createErrorNode(element, error);
  }

  const shouldProcessSrc = ['include', 'dynamic-panel', 'panel', 'morph'].includes(element.name);
  const hasSrc = _.hasIn(element.attribs, 'src');
  let isUrl;
  let includeSrc;
  let filePath;
  let actualFilePath;
  if (hasSrc && shouldProcessSrc) {
    isUrl = utils.isUrl(element.attribs.src);
    includeSrc = url.parse(element.attribs.src);
    filePath = isUrl ? element.attribs.src : path.resolve(path.dirname(context.cwf), includeSrc.path);
    actualFilePath = filePath;
    const isBoilerplate = _.hasIn(element.attribs, 'boilerplate');
    if (isBoilerplate) {
      element.attribs.boilerplate = element.attribs.boilerplate || path.basename(filePath);
      actualFilePath = calculateBoilerplateFilePath(element.attribs.boilerplate, filePath, config);
      this.boilerplateIncludeSrc.push({ from: context.cwf, to: actualFilePath });
    }
    if (!utils.fileExists(actualFilePath)) {
      this.missingIncludeSrc.push({ from: context.cwf, to: actualFilePath });
      const error = new Error(
        `No such file: ${actualFilePath}\nMissing reference in ${element.attribs[ATTRIB_CWF]}`,
      );
      this._onError(error);
      return createErrorNode(element, error);
    }
  }

  if (element.name === 'include') {
    const isInline = _.hasIn(element.attribs, 'inline');
    const isDynamic = _.hasIn(element.attribs, 'dynamic');
    element.name = isInline ? 'span' : 'div';
    element.attribs[ATTRIB_INCLUDE_PATH] = filePath;

    if (isDynamic) {
      element.name = 'dynamic-panel';
      element.attribs.src = filePath;
      if (includeSrc.hash) {
        element.attribs.fragment = includeSrc.hash.substring(1);
      }

      element.attribs.header = element.attribs.name || '';
      delete element.attribs.dynamic;
      this.dynamicIncludeSrc.push({ from: context.cwf, to: actualFilePath, asIfTo: element.attribs.src });
      return element;
    }

    if (isUrl) {
      return element; // only keep url path for dynamic
    }

    this.staticIncludeSrc.push({ from: context.cwf, to: actualFilePath });

    try {
      self._fileCache[actualFilePath] = self._fileCache[actualFilePath]
        ? self._fileCache[actualFilePath] : fs.readFileSync(actualFilePath, 'utf8');
    } catch (e) {
      // Read file fail
      const missingReferenceErrorMessage = `Missing reference in: ${element.attribs[ATTRIB_CWF]}`;
      e.message += `\n${missingReferenceErrorMessage}`;
      this._onError(e);
      return createErrorNode(element, e);
    }

    const isIncludeSrcMd = utils.getExtName(filePath) === 'md';

    if (isIncludeSrcMd && context.source === 'html') {
      // HTML include markdown, use special tag to indicate markdown code.
      element.name = 'markdown';
    }

    let fileContent = self._fileCache[actualFilePath]; // cache the file contents to save some I/O
    const fileBase = path.resolve(calculateNewBaseUrl(filePath, config.rootPath, config.baseUrlMap).relative);
    const userDefinedVariables = config.userDefinedVariablesMap[fileBase];
    fileContent = nunjucks.renderString(fileContent, userDefinedVariables);
    delete element.attribs.boilerplate;
    delete element.attribs.src;
    delete element.attribs.inline;

    if (includeSrc.hash) {
      // directly get segment from the src
      const segmentSrc = cheerio.parseHTML(fileContent, true);
      const $ = cheerio.load(segmentSrc);
      const htmlContent = $(includeSrc.hash).html();
      let actualContent = htmlContent;
      if (isIncludeSrcMd) {
        if (context.mode === 'include') {
          actualContent = isInline ? actualContent : utils.wrapContent(actualContent, '\n\n', '\n');
        } else {
          actualContent = md.render(actualContent);
        }
        actualContent = self._rebaseReferenceForStaticIncludes(actualContent, element, config);
      }
      element.children = cheerio.parseHTML(actualContent, true); // the needed content;
    } else {
      let actualContent = fileContent;
      if (isIncludeSrcMd) {
        if (context.mode === 'include') {
          actualContent = isInline ? actualContent : utils.wrapContent(actualContent, '\n\n', '\n');
        } else {
          actualContent = md.render(actualContent);
        }
      }
      element.children = cheerio.parseHTML(actualContent, true);
    }

    // The element's children are in the new context
    // Process with new context
    const childContext = _.cloneDeep(context);
    childContext.cwf = filePath;
    childContext.source = isIncludeSrcMd ? 'md' : 'html';
    if (element.children && element.children.length > 0) {
      element.children = element.children.map(e => self._preprocess(e, childContext, config));
    }
  } else if (element.name === 'dynamic-panel') {
    if (!isUrl && includeSrc.hash) {
      element.attribs.fragment = includeSrc.hash.substring(1); // save hash to fragment attribute
    }
    element.attribs.src = filePath;
    this.dynamicIncludeSrc.push({ from: context.cwf, to: actualFilePath, asIfTo: filePath });
    return element;
  } else if ((element.name === 'morph' || element.name === 'panel') && hasSrc) {
    if (!isUrl && includeSrc.hash) {
      element.attribs.fragment = includeSrc.hash.substring(1); // save hash to fragment attribute
    }
    element.attribs.src = filePath;
    this.dynamicIncludeSrc.push({ from: context.cwf, to: actualFilePath, asIfTo: filePath });
    return element;
  } else if (element.children && element.children.length > 0) {
    element.children = element.children.map(e => self._preprocess(e, context, config));
  }

  return element;
};

Parser.prototype._parse = function (node, context, config) {
  const element = node;
  const self = this;
  if (_.isArray(element)) {
    return element.map(el => self._parse(el, context, config));
  }

  if (isText(element)) {
    return element;
  }
  if (element.name) {
    element.name = element.name.toLowerCase();
  }

  switch (element.name) {
  case 'md':
    element.name = 'span';
    cheerio.prototype.options.xmlMode = false;
    element.children = cheerio.parseHTML(md.renderInline(cheerio.html(element.children)), true);
    cheerio.prototype.options.xmlMode = true;
    break;
  case 'markdown':
    element.name = 'div';
    cheerio.prototype.options.xmlMode = false;
    element.children = cheerio.parseHTML(md.render(cheerio.html(element.children)), true);
    cheerio.prototype.options.xmlMode = true;
    break;
  case 'dynamic-panel': {
    const hasIsOpen = _.hasIn(element.attribs, 'isOpen');
    element.attribs.isOpen = hasIsOpen || false;
    const fileExists = utils.fileExists(element.attribs.src)
                    || utils.fileExists(calculateBoilerplateFilePath(element.attribs.boilerplate,
                                                                     element.attribs.src, config));
    if (fileExists) {
      const { src, fragment } = element.attribs;
      const resultDir = path.dirname(path.join('{{hostBaseUrl}}', path.relative(process.cwd(), src)));
      const resultPath = path.join(resultDir, utils.setExtension(path.basename(src), '._include_.html'));
      element.attribs.src = fragment ? `${resultPath}#${fragment}` : resultPath;
    }
    element.attribs['no-close'] = 'true';
    element.attribs['no-switch'] = 'true';
    element.name = 'panel';
    delete element.attribs.boilerplate;
    break;
  }
  case 'morph': {
    // eslint-disable-next-line no-console
    console.warn('DeprecationWarning: morph is deprecated. Consider using panel instead.');
    if (!_.hasIn(element.attribs, 'src')) {
      break;
    }
    const fileExists = utils.fileExists(element.attribs.src)
                    || utils.fileExists(calculateBoilerplateFilePath(element.attribs.boilerplate,
                                                                     element.attribs.src, config));
    if (fileExists) {
      const { src, fragment } = element.attribs;
      const resultDir = path.dirname(path.join('{{hostBaseUrl}}', path.relative(process.cwd(), src)));
      const resultPath = path.join(resultDir, utils.setExtension(path.basename(src), '._include_.html'));
      element.attribs.src = fragment ? `${resultPath}#${fragment}` : resultPath;
    }
    delete element.attribs.boilerplate;
    break;
  }
  case 'panel': {
    if (!_.hasIn(element.attribs, 'src')) { // dynamic panel
      break;
    }
    const fileExists = utils.fileExists(element.attribs.src)
                    || utils.fileExists(calculateBoilerplateFilePath(element.attribs.boilerplate,
                                                                     element.attribs.src, config));
    if (fileExists) {
      const { src, fragment } = element.attribs;
      const resultDir = path.dirname(path.join('{{hostBaseUrl}}', path.relative(process.cwd(), src)));
      const resultPath = path.join(resultDir, utils.setExtension(path.basename(src), '._include_.html'));
      element.attribs.src = fragment ? `${resultPath}#${fragment}` : resultPath;
    }
    delete element.attribs.boilerplate;
    break;
  }
  default:
    break;
  }

  if (element.children) {
    element.children.forEach((child) => {
      self._parse(child, context, config);
    });
  }

  return element;
};

Parser.prototype._trimNodes = function (node) {
  const self = this;
  if (node.name === 'pre' || node.name === 'code') {
    return;
  }
  if (node.children) {
    /* eslint-disable no-plusplus */
    for (let n = 0; n < node.children.length; n++) {
      const child = node.children[n];
      if (
        child.type === 'comment'
        || (child.type === 'text' && n === node.children.length - 1 && !/\S/.test(child.data))
      ) {
        node.children.splice(n, 1);
        n--;
      } else if (child.type === 'tag') {
        self._trimNodes(child);
      }
    }
    /* eslint-enable no-plusplus */
  }
};

Parser.prototype.includeFile = function (file, config) {
  const context = {};
  context.cwf = config.cwf || file; // current working file
  context.mode = 'include';

  return new Promise((resolve, reject) => {
    const handler = new htmlparser.DomHandler((error, dom) => {
      if (error) {
        reject(error);
        return;
      }
      const nodes = dom.map((d) => {
        let processed;
        try {
          processed = this._preprocess(d, context, config);
        } catch (err) {
          err.message += `\nError while preprocessing '${file}'`;
          this._onError(err);
          processed = createErrorNode(d, err);
        }
        return processed;
      });
      resolve(cheerio.html(nodes));
    });

    const parser = new htmlparser.Parser(handler, {
      xmlMode: true,
      decodeEntities: true,
    });

    let actualFilePath = file;
    if (!utils.fileExists(file)) {
      const boilerplateFilePath = calculateBoilerplateFilePath(path.basename(file), file, config);
      if (utils.fileExists(boilerplateFilePath)) {
        actualFilePath = boilerplateFilePath;
      }
    }

    // Read files
    fs.readFile(actualFilePath, 'utf-8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      const fileBase = path.resolve(calculateNewBaseUrl(file, config.rootPath, config.baseUrlMap).relative);
      const userDefinedVariables = config.userDefinedVariablesMap[fileBase];
      const fileContent = nunjucks.renderString(data, userDefinedVariables);
      const fileExt = utils.getExtName(file);
      if (fileExt === 'md') {
        context.source = 'md';
        parser.parseComplete(fileContent.toString());
      } else if (fileExt === 'html') {
        context.source = 'html';
        parser.parseComplete(fileContent);
      } else {
        const error = new Error(`Unsupported File Extension: '${fileExt}'`);
        reject(error);
      }
    });
  });
};

Parser.prototype.renderFile = function (file, config) {
  const context = {};
  context.cwf = file; // current working file
  context.mode = 'render';
  return new Promise((resolve, reject) => {
    const handler = new htmlparser.DomHandler((error, dom) => {
      if (error) {
        reject(error);
        return;
      }
      const nodes = dom.map((d) => {
        let parsed;
        try {
          parsed = this._parse(d, context, config);
        } catch (err) {
          err.message += `\nError while rendering '${file}'`;
          this._onError(err);
          parsed = createErrorNode(d, err);
        }
        return parsed;
      });
      nodes.forEach((d) => {
        this._trimNodes(d);
      });
      cheerio.prototype.options.xmlMode = false;
      resolve(cheerio.html(nodes));
      cheerio.prototype.options.xmlMode = true;
    });

    const parser = new htmlparser.Parser(handler, {
      xmlMode: true,
      decodeEntities: false,
    });

    // Read files
    fs.readFile(file, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      const fileExt = utils.getExtName(file);
      if (fileExt === 'md') {
        const inputData = md.render(data.toString());
        context.source = 'md';
        parser.parseComplete(inputData);
      } else if (fileExt === 'html') {
        context.source = 'html';
        parser.parseComplete(data);
      } else {
        const error = new Error(`Unsupported File Extension: '${fileExt}'`);
        reject(error);
      }
    });
  });
};

Parser.prototype.resolveBaseUrl = function (pageData, config) {
  const { baseUrlMap, rootPath, isDynamic } = config;
  this.baseUrlMap = baseUrlMap;
  this.rootPath = rootPath;
  this.isDynamic = isDynamic || false;
  if (this.isDynamic) {
    this.dynamicSource = config.dynamicSource;
  }
  return new Promise((resolve, reject) => {
    const handler = new htmlparser.DomHandler((error, dom) => {
      if (error) {
        reject(error);
        return;
      }
      const nodes = dom.map((d) => {
        const node = d;
        const childrenBase = {};
        if (this.isDynamic) {
          // Change CWF for each top level element
          if (node.attribs) {
            node.attribs[ATTRIB_CWF] = this.dynamicSource;
          }
        }
        return this._rebaseReference(node, childrenBase);
      });
      cheerio.prototype.options.xmlMode = false;
      resolve(cheerio.html(nodes));
      cheerio.prototype.options.xmlMode = true;
    });

    const parser = new htmlparser.Parser(handler, {
      xmlMode: true,
      decodeEntities: true,
    });

    parser.parseComplete(pageData);
  });
};

Parser.prototype._rebaseReference = function (node, foundBase) {
  const element = node;

  if (_.isArray(element)) {
    return element.map(el => this._rebaseReference(el, foundBase));
  }

  if (isText(element)) {
    return element;
  }
  // Rebase children element
  const childrenBase = {};
  element.children.forEach((el) => {
    this._rebaseReference(el, childrenBase);
  });

  // rebase current element
  if (element.attribs[ATTRIB_CWF]) {
    const filePath = element.attribs[ATTRIB_CWF];
    let newBase = calculateNewBaseUrl(filePath, this.rootPath, this.baseUrlMap);
    if (newBase) {
      const { relative, parent } = newBase;
      // eslint-disable-next-line no-param-reassign
      foundBase[parent] = relative;
    }

    const bases = Object.keys(childrenBase);
    if (bases.length !== 0) {
      // need to rebase
      newBase = childrenBase[bases[0]];
      const { children } = element;
      if (children) {
        const currentBase = calculateNewBaseUrl(element.attribs[ATTRIB_CWF], this.rootPath, this.baseUrlMap);
        if (currentBase) {
          if (currentBase.relative !== newBase) {
            cheerio.prototype.options.xmlMode = false;
            const newBaseUrl = `{{hostBaseUrl}}/${newBase}`;
            const rendered = nunjucks.renderString(cheerio.html(children), { baseUrl: newBaseUrl });
            element.children = cheerio.parseHTML(rendered, true);
            cheerio.prototype.options.xmlMode = true;
          }
        }
      }
    }
    delete element.attribs[ATTRIB_INCLUDE_PATH];
  }
  delete element.attribs[ATTRIB_CWF];
  return element;
};

Parser.prototype._rebaseReferenceForStaticIncludes = function (pageData, element, config) {
  if (!config) {
    return pageData;
  }

  if (!pageData.includes('{{baseUrl}}')) {
    return pageData;
  }

  const filePath = element.attribs[ATTRIB_INCLUDE_PATH];
  const fileBase = calculateNewBaseUrl(filePath, config.rootPath, config.baseUrlMap);
  if (!fileBase.relative) {
    return pageData;
  }

  const currentPath = element.attribs[ATTRIB_CWF];
  const currentBase = calculateNewBaseUrl(currentPath, config.rootPath, config.baseUrlMap);
  if (currentBase.relative === fileBase.relative) {
    return pageData;
  }

  const newBase = fileBase.relative;
  const newBaseUrl = `{{hostBaseUrl}}/${newBase}`;
  return nunjucks.renderString(pageData, { baseUrl: newBaseUrl });
};

module.exports = Parser;
