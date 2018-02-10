'use strict';

const htmlparser = require('htmlparser2');
const md = require('./markdown-it');

const _ = require('lodash');
const Promise = require('bluebird');

const cheerio = require('cheerio');
cheerio.prototype.options.xmlMode = true; // Enable xml mode for self-closing tag
cheerio.prototype.options.decodeEntities = false; // Don't escape HTML entities

const utils = require('./utils');

const fs = require('fs');
const path = require('path');
const url = require('url');
const nunjucks = require('nunjucks');

const ATTRIB_INCLUDE_PATH = 'include-path';
const ATTRIB_CWF = 'cwf';

const BOILERPLATE_DIRECTORY_NAME = '_boilerplates';

/*
 * Utils
 */
function isText(element) {
  return element.type === 'text' || element.type === 'comment';
}

function Parser(options) {
  this._options = options || {};
  this._onError = this._options.errorHandler || console.error;
  this._fileCache = {};
  this.dynamicIncludeSrc = [];
  this.staticIncludeSrc = [];
  this.boilerplateIncludeSrc = [];
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

Parser.prototype._preprocess = function (element, context, config) {
  let self = this;
  element.attribs = element.attribs || {};
  element.attribs[ATTRIB_CWF] = path.resolve(context.cwf);
  if (element.name === 'include') {
    let isInline = _.hasIn(element.attribs, 'inline');
    let isDynamic = _.hasIn(element.attribs, 'dynamic');
    let isUrl = utils.isUrl(element.attribs.src);
    let includeSrc = url.parse(element.attribs.src);
    let includeSrcPath = includeSrc.path;
    let filePath = isUrl ? element.attribs.src : path.resolve(path.dirname(context.cwf), includeSrcPath);
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
      this.dynamicIncludeSrc.push({from: context.cwf, to: element.attribs.src});
      return element;
    }

    if (isUrl) {
      return element; // only keep url path for dynamic
    }

    let isIncludeSrcMd = utils.getExtName(filePath) === 'md';

    let actualFilePath = filePath;
    if (utils.fileExists(filePath)) {
      this.staticIncludeSrc.push({from: context.cwf, to: actualFilePath});
    } else {
      let boilerplateFilePath = calculateBoilerplateFilePath(filePath, config);
      if (utils.fileExists(boilerplateFilePath)) {
        actualFilePath = boilerplateFilePath;
        this.boilerplateIncludeSrc.push({from: context.cwf, to: actualFilePath});
      }
    }

    try {
      self._fileCache[actualFilePath] = self._fileCache[actualFilePath] ?
        self._fileCache[actualFilePath] : fs.readFileSync(actualFilePath, 'utf8');
    } catch (e) {
      // Read file fail
      let missingReferenceErrorMessage = `Missing reference in: ${element.attribs[ATTRIB_CWF]}`;
      e.message += `\n${missingReferenceErrorMessage}`;
      this._onError(e);
      element.children = cheerio.parseHTML(utils.createErrorElement(e), true);
      return element;
    }


    if (isIncludeSrcMd && context.source === 'html') {
      // HTML include markdown, use special tag to indicate markdown code.
      element.name = 'markdown';
    }

    let fileContent = self._fileCache[actualFilePath]; // cache the file contents to save some I/O
    delete element.attribs.src;
    delete element.attribs.inline;

    if (includeSrc.hash) {
      // directly get segment from the src
      let segmentSrc = cheerio.parseHTML(fileContent, true);
      let $ = cheerio.load(segmentSrc);
      let htmlContent = $(includeSrc.hash).html();
      let actualContent = context.mode === 'include' ?
        (isInline ? utils.wrapContent(htmlContent) : utils.wrapContent(htmlContent, '\n\n', '\n'))
        : md.render(htmlContent);
      actualContent = self._rebaseReferenceForStaticIncludes(actualContent, element, config);
      if (!isIncludeSrcMd) {
        // Include HTML. Just let it be.
        actualContent = htmlContent;
      }
      element.children = cheerio.parseHTML(actualContent, true); // the needed content;
    } else {
      let actualContent = context.mode === 'include' ?
        (isInline ? utils.wrapContent(fileContent) : utils.wrapContent(fileContent, '\n\n', '\n'))
        : md.render(fileContent);
      if (!isIncludeSrcMd) {
        // Include HTML. Just let it be.
        actualContent = fileContent;
      }
      element.children = cheerio.parseHTML(actualContent, true);
    }

    // The element's children are in the new context
    // Process with new context
    let childContext = _.cloneDeep(context);
    childContext.cwf = filePath;
    childContext.source = isIncludeSrcMd ? 'md' : 'html';
    if (element.children && element.children.length > 0) {
      element.children = element.children.map((e) => {
        return self._preprocess(e, childContext, config);
      });
    }
  } else if (element.name === 'dynamic-panel') {
    let isUrl = utils.isUrl(element.attribs.src);
    let filePath;
    if (isUrl) {
      filePath = element.attribs.src;
    } else {
      let includeSrc = url.parse(element.attribs.src);
      let includeSrcPath = includeSrc.path;
      if (includeSrc.hash) {
        element.attribs.fragment = includeSrc.hash.substring(1); // save hash to fragment attribute
      }
      filePath = path.resolve(path.dirname(context.cwf), includeSrcPath); // updated path (no hash)
    }
    element.attribs.src = filePath;
    this.dynamicIncludeSrc.push({from: context.cwf, to: filePath});
    return element;
  } else if ((element.name === 'morph' || element.name === 'panel') && _.hasIn(element.attribs, 'src')) {
    let isUrl = utils.isUrl(element.attribs.src);
    let filePath;
    if (isUrl) {
      filePath = element.attribs.src;
    } else {
      let includeSrc = url.parse(element.attribs.src);
      let includeSrcPath = includeSrc.path;
      if (includeSrc.hash) {
        element.attribs.fragment = includeSrc.hash.substring(1); // save hash to fragment attribute
      }
      filePath = path.resolve(path.dirname(context.cwf), includeSrcPath); // updated path (no hash)
    }
    element.attribs.src = filePath;
    this.dynamicIncludeSrc.push({from: context.cwf, to: filePath});
    return element;
  } else {
    if (element.children && element.children.length > 0) {
      element.children = element.children.map((e) => {
        return self._preprocess(e, context, config);
      });
    }
  }

  return element;
};

Parser.prototype._parse = function (element, context, config) {
  let self = this;
  if (_.isArray(element)) {
    return element.map((el) => {
      return self._parse(el, context, config);
    });
  }

  if (isText(element)) {
    return element;
  } else {
    if (element.name) {
      element.name = element.name.toLowerCase();
    }

    switch (element.name) {
    case 'md':
    case 'markdown':
      element.name = 'div';
      cheerio.prototype.options.xmlMode = false;
      element.children = cheerio.parseHTML(md.render(cheerio.html(element.children)), true);
      cheerio.prototype.options.xmlMode = true;
      break;
    case 'dynamic-panel': {
      let hasIsOpen = _.hasIn(element.attribs, 'isOpen');
      element.attribs.isOpen = hasIsOpen ? hasIsOpen : false;
      let fileExists = utils.fileExists(element.attribs.src) || utils.fileExists(calculateBoilerplateFilePath(element.attribs.src, config));
      if (fileExists) {
        let resultDir = path.dirname(path.join('{{hostBaseUrl}}', path.relative(process.cwd(), element.attribs.src)));
        element.attribs.src = path.join(resultDir, utils.setExtension(path.basename(element.attribs.src), '._include_.html'));
        if (element.attribs.fragment) {
          element.attribs.src = `${element.attribs.src}#${element.attribs.fragment}`; // add hash back to path
        }
      }
      element.attribs['no-close'] = 'true';
      element.attribs['no-switch'] = 'true';
      element.name = 'panel';
      break;
    }
    case 'morph': {
      if (!_.hasIn(element.attribs, 'src')) {
        break;
      }
      let fileExists = utils.fileExists(element.attribs.src) || utils.fileExists(calculateBoilerplateFilePath(element.attribs.src, config));
      if (fileExists) {
        let resultDir = path.dirname(path.join('{{hostBaseUrl}}', path.relative(process.cwd(), element.attribs.src)));
        element.attribs.src = path.join(resultDir, utils.setExtension(path.basename(element.attribs.src), '._include_.html'));
        if (element.attribs.fragment) {
          element.attribs.src = `${element.attribs.src}#${element.attribs.fragment}`; // add hash back to path
        }
      }
      break;
    }
    case 'panel': {
      if (!_.hasIn(element.attribs, 'src')) { // dynamic panel
        break;
      }
      let fileExists = utils.fileExists(element.attribs.src) || utils.fileExists(calculateBoilerplateFilePath(element.attribs.src, config));
      if (fileExists) {
        let resultDir = path.dirname(path.join('{{hostBaseUrl}}', path.relative(process.cwd(), element.attribs.src)));
        element.attribs.src = path.join(resultDir, utils.setExtension(path.basename(element.attribs.src), '._include_.html'));
        if (element.attribs.fragment) {
          element.attribs.src = `${element.attribs.src}#${element.attribs.fragment}`; // add hash back to path
        }
      }
      break;
    }
    }

    if (element.children) {
      element.children.forEach(child => {
        self._parse(child, context, config);
      });
    }

    return element;
  }
};

Parser.prototype._trimNodes = function (node) {
  let self = this;
  if (node.name === 'pre' || node.name === 'code') {
    return;
  }
  if (node.children) {
    for (let n = 0; n < node.children.length; n++) {
      let child = node.children[n];
      if (
        child.type === 'comment' ||
        (child.type === 'text' && n === node.children.length - 1 && !/\S/.test(child.data))
      ) {
        node.children.splice(n, 1);
        n--;
      } else if (child.type === 'tag') {
        self._trimNodes(child);
      }
    }
  }
};

Parser.prototype.includeFile = function (file, config) {
  let context = {};
  context.cwf = file; // current working file
  context.mode = 'include';

  return new Promise((resolve, reject) => {
    let handler = new htmlparser.DomHandler((error, dom) => {
      if (error) {
        reject(error);
        return;
      }
      let nodes = dom.map(d => {
        return this._preprocess(d, context, config);
      });
      resolve(cheerio.html(nodes));
    });

    let parser = new htmlparser.Parser(handler, {
      xmlMode: true,
      decodeEntities: true
    });

    let actualFilePath = file;
    if (!utils.fileExists(file)) {
      let boilerplateFilePath = calculateBoilerplateFilePath(file, config);
      if (utils.fileExists(boilerplateFilePath)) {
        actualFilePath = boilerplateFilePath;
        this.boilerplateIncludeSrc.push({from: context.cwf, to: boilerplateFilePath});
      }
    }

    // Read files
    fs.readFile(actualFilePath, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      let fileExt = utils.getExtName(file);
      if (fileExt === 'md') {
        context.source = 'md';
        parser.parseComplete(data.toString());
      } else if (fileExt === 'html') {
        context.source = 'html';
        parser.parseComplete(data);
      } else {
        let err = new Error(`Unsupported File Extension: '${fileExt}'`);
        reject(err);
      }
    });
  });
};

Parser.prototype.renderFile = function (file, config) {
  let context = {};
  context.cwf = file; // current working file
  context.mode = 'render';
  return new Promise((resolve, reject) => {
    let handler = new htmlparser.DomHandler((error, dom) => {
      if (error) {
        reject(error);
        return;
      }
      let nodes = dom.map(d => {
        return this._parse(d, context, config);
      });
      nodes.forEach(d => {
        this._trimNodes(d);
      });
      cheerio.prototype.options.xmlMode = false;
      resolve(cheerio.html(nodes));
      cheerio.prototype.options.xmlMode = true;
    });

    let parser = new htmlparser.Parser(handler, {
      xmlMode: true,
      decodeEntities: false
    });

    // Read files
    fs.readFile(file, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      let inputData = data;
      let fileExt = utils.getExtName(file);
      if (fileExt === 'md') {
        inputData = md.render(inputData.toString());
        context.source = 'md';
        parser.parseComplete(inputData);
      } else if (fileExt === 'html') {
        context.source = 'html';
        parser.parseComplete(data);
      } else {
        let err = new Error(`Unsupported File Extension: '${fileExt}'`);
        reject(err);
      }
    });
  });
};

Parser.prototype.resolveBaseUrl = function (pageData, config) {
  let {baseUrlMap, rootPath, isDynamic} = config;
  this.baseUrlMap = baseUrlMap;
  this.rootPath = rootPath;
  this.isDynamic = isDynamic || false;
  if (this.isDynamic) {
    this.dynamicSource = config.dynamicSource;
  }
  return new Promise((resolve, reject) => {
    let handler = new htmlparser.DomHandler((error, dom) => {
      if (error) {
        reject(error);
        return;
      }
      dom.forEach(d => {
        let childrenBase = {};
        if (this.isDynamic) {
          // Change CWF for each top level element
          d.attribs && (d.attribs[ATTRIB_CWF] = this.dynamicSource);
        }
        this._rebaseReference(d, childrenBase);
      });
      cheerio.prototype.options.xmlMode = false;
      resolve(cheerio.html(dom));
      cheerio.prototype.options.xmlMode = true;
    });

    let parser = new htmlparser.Parser(handler, {
      xmlMode: true,
      decodeEntities: true
    });

    parser.parseComplete(pageData);
  });
};

Parser.prototype._rebaseReference = function(node, foundBase) {
  if (_.isArray(node)) {
    return node.forEach(el => {
      return this._rebaseReference(el, foundBase);
    });
  }

  if (isText(node)) {
    return node;
  } else {
    // Rebase children element
    let childrenBase = {};
    node.children.forEach(el => {
      this._rebaseReference(el, childrenBase);
    });

    // rebase current element
    if (node.attribs[ATTRIB_CWF]) {
      let path = node.attribs[ATTRIB_CWF];
      let newBase = calculateNewBaseUrl(path, this.rootPath, this.baseUrlMap);
      if (newBase) {
        let {relative, parent} = newBase;
        foundBase[parent] = relative;
      }

      let bases = Object.keys(childrenBase);
      if (bases.length !== 0) {
        // need to rebase
        let newBase = childrenBase[bases[0]];
        let children = node.children;
        if (children) {
          let currentBase = calculateNewBaseUrl(node.attribs[ATTRIB_CWF], this.rootPath, this.baseUrlMap);
          if (currentBase) {
            if (currentBase.relative !== newBase) {
              cheerio.prototype.options.xmlMode = false;
              let rendered = nunjucks.renderString(cheerio.html(children), {baseUrl: `{{hostBaseUrl}}/${newBase}`});
              node.children = cheerio.parseHTML(rendered, true);
              cheerio.prototype.options.xmlMode = true;
            }
          }
        }
      }
      delete node.attribs[ATTRIB_INCLUDE_PATH];
    }
    delete node.attribs[ATTRIB_CWF];
  }
};

Parser.prototype._rebaseReferenceForStaticIncludes = function (pageData, element, config) {
  if (!config) {
    return pageData;
  }

  if (!pageData.includes('{{baseUrl}}')) {
    return pageData;
  }

  let filePath = element.attribs[ATTRIB_INCLUDE_PATH];
  let fileBase = calculateNewBaseUrl(filePath, config.rootPath, config.baseUrlMap);
  if (!fileBase.relative) {
    return pageData;
  }

  let currentPath = element.attribs[ATTRIB_CWF];
  let currentBase = calculateNewBaseUrl(currentPath, config.rootPath, config.baseUrlMap);
  if (currentBase.relative === fileBase.relative) {
    return pageData;
  }

  let newBase = fileBase.relative;
  return nunjucks.renderString(pageData, { baseUrl: `{{hostBaseUrl}}/${newBase}` });
};

function calculateBoilerplateFilePath(filePath, config) {
  let base = calculateNewBaseUrl(filePath, config.rootPath, config.baseUrlMap).relative;
  return path.resolve(base, BOILERPLATE_DIRECTORY_NAME, path.basename(filePath));
}

function calculateNewBaseUrl(filePath, root, lookUp) {
  function calculate(file, result) {
    if (file === root) {
      return {relative: path.relative(root, root), parent: root};
    }
    let parent = path.dirname(file);
    if (lookUp[parent] && result.length == 1) {
      return {relative: path.relative(parent, result[0]), parent};
    } else if (lookUp[parent]) {
      return calculate(parent, [parent]);
    }
    return calculate(parent, result);
  }

  return calculate(filePath, []);
}

module.exports = Parser;
