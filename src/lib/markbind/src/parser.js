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

const CyclicReferenceError = require('./handlers/cyclicReferenceError.js');
const md = require('./lib/markdown-it');
const utils = require('./utils');

cheerio.prototype.options.xmlMode = true; // Enable xml mode for self-closing tag
cheerio.prototype.options.decodeEntities = false; // Don't escape HTML entities

const ATTRIB_INCLUDE_PATH = 'include-path';
const ATTRIB_CWF = 'cwf';

const BOILERPLATE_FOLDER_NAME = '_markbind/boilerplates';

/* Imported global variables will be assigned a namespace.
 * A prefix is appended to reduce clashes with other variables in the page.
 */
const IMPORTED_VARIABLE_PREFIX = '$__MARKBIND__';
const VARIABLE_LOOKUP = new Map();
const FILE_ALIASES = new Map();
const PROCESSED_INNER_VARIABLES = new Set();

/*
 * Utils
 */

/**
* @throws Will throw an error if a non-absolute path or path outside the root is given
*/
function calculateNewBaseUrls(filePath, root, lookUp) {
  if (!path.isAbsolute(filePath)) {
    throw new Error(`Non-absolute path given to calculateNewBaseUrls: '${filePath}'`);
  }
  if (!pathIsInside(filePath, root)) {
    throw new Error(`Path given '${filePath}' is not in root '${root}'`);
  }
  function calculate(file, result) {
    if (file === root) {
      return { relative: path.relative(root, root), parent: root };
    }
    const parent = path.dirname(file);
    if (lookUp.has(parent) && result.length === 1) {
      return { relative: path.relative(parent, result[0]), parent };
    } else if (lookUp.has(parent)) {
      return calculate(parent, [parent]);
    }
    return calculate(parent, result);
  }

  return calculate(filePath, []);
}

function calculateBoilerplateFilePath(pathInBoilerplates, asIfAt, config) {
  const { parent, relative } = calculateNewBaseUrls(asIfAt, config.rootPath, config.baseUrlMap);
  return path.resolve(parent, relative, BOILERPLATE_FOLDER_NAME, pathInBoilerplates);
}

function createErrorNode(element, error) {
  const errorElement = cheerio.parseHTML(utils.createErrorElement(error), true)[0];
  return Object.assign(element, _.pick(errorElement, ['name', 'attribs', 'children']));
}

function createEmptyNode() {
  const emptyElement = cheerio.parseHTML('<div></div>', true)[0];
  return emptyElement;
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

/**
 * Extract variables from an include element
 * @param includeElement include element to extract variables from
 * @param contextVariables variables defined by parent pages
 */
function extractIncludeVariables(includeElement, contextVariables) {
  const includedVariables = { ...contextVariables };
  Object.keys(includeElement.attribs).forEach((attribute) => {
    if (!attribute.startsWith('var-')) {
      return;
    }
    const variableName = attribute.replace(/^var-/, '');
    if (!includedVariables[variableName]) {
      includedVariables[variableName] = includeElement.attribs[attribute];
    }
  });
  if (includeElement.children) {
    includeElement.children.forEach((child) => {
      if (child.name !== 'variable' && child.name !== 'span') {
        return;
      }
      const variableName = child.attribs.name || child.attribs.id;
      if (!variableName) {
        // eslint-disable-next-line no-console
        console.warn(`Missing reference in ${includeElement.attribs[ATTRIB_CWF]}\n`
                   + `Missing 'name' or 'id' in variable for ${includeElement.attribs.src} include.`);
        return;
      }
      if (!includedVariables[variableName]) {
        includedVariables[variableName] = cheerio.html(child.children);
      }
    });
  }
  return includedVariables;
}

/**
 * Returns an object containing the imported variables for specified file
 * @param file file name to get the imported variables for
 */
function getImportedVariableMap(file) {
  const innerVariables = {};
  FILE_ALIASES.get(file).forEach((actualPath, alias) => {
    innerVariables[alias] = {};
    const variables = VARIABLE_LOOKUP.get(actualPath);
    variables.forEach((value, name) => {
      innerVariables[alias][name] = value;
    });
  });
  return innerVariables;
}

/**
 * Extract page variables from a page
 * @param filename for error printing
 * @param data to extract variables from
 * @param userDefinedVariables global variables
 * @param includedVariables variables from parent include
 */
function extractPageVariables(fileName, data, userDefinedVariables, includedVariables) {
  const $ = cheerio.load(data);
  const pageVariables = { };
  VARIABLE_LOOKUP.set(fileName, new Map());
  /**
   * <import>ed variables have not been processed yet, we replace such variables with itself first.
   */
  const importedVariables = {};
  $('import[from]').each((index, element) => {
    const variableNames = Object.keys(element.attribs)
      .filter(name => name !== 'from' && name !== 'as');
    // If no namespace is provided, we use the smallest name as one...
    const largestName = variableNames.sort()[0];
    // ... and prepend it with $__MARKBIND__ to reduce collisions.
    const generatedAlias = IMPORTED_VARIABLE_PREFIX + largestName;
    const hasAlias = _.hasIn(element.attribs, 'as');
    const alias = hasAlias ? element.attribs.as : generatedAlias;
    importedVariables[alias] = new Proxy({}, {
      get(obj, prop) {
        return `{{${alias}.${prop}}}`;
      },
    });
    variableNames.forEach((name) => {
      importedVariables[name] = `{{${alias}.${name}}}`;
    });
  });
  $('variable').each(function () {
    const variableElement = $(this);
    const variableName = variableElement.attr('name');
    if (!variableName) {
      // eslint-disable-next-line no-console
      console.warn(`Missing 'name' for variable in ${fileName}\n`);
      return;
    }
    if (!pageVariables[variableName]) {
      const variableValue
        = nunjucks.renderString(
          md.renderInline(variableElement.html()),
          {
            ...importedVariables, ...pageVariables, ...userDefinedVariables, ...includedVariables,
          },
        );
      pageVariables[variableName] = variableValue;
      VARIABLE_LOOKUP.get(fileName).set(variableName, variableValue);
    }
  });
  return { ...importedVariables, ...pageVariables };
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

Parser.prototype._preprocessThumbnails = function (element) {
  const isImage = _.hasIn(element.attribs, 'src') && element.attribs.src !== '';
  if (isImage) {
    return element;
  }
  const text = _.hasIn(element.attribs, 'text') ? element.attribs.text : '';
  if (text === '') {
    return element;
  }
  const renderedText = md.renderInline(text);
  // eslint-disable-next-line no-param-reassign
  element.children = cheerio.parseHTML(renderedText);
  return element;
};

Parser.prototype._renderIncludeFile = function (filePath, element, context, config, asIfAt = filePath) {
  try {
    this._fileCache[filePath] = this._fileCache[filePath]
      ? this._fileCache[filePath] : fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    // Read file fail
    const missingReferenceErrorMessage = `Missing reference in: ${element.attribs[ATTRIB_CWF]}`;
    e.message += `\n${missingReferenceErrorMessage}`;
    this._onError(e);
    return createErrorNode(element, e);
  }

  const fileContent = this._fileCache[filePath]; // cache the file contents to save some I/O
  const { parent, relative }
    = calculateNewBaseUrls(asIfAt, config.rootPath, config.baseUrlMap);
  const userDefinedVariables = config.userDefinedVariablesMap[path.resolve(parent, relative)];

  // Extract included variables from the PARENT file
  const includeVariables = extractIncludeVariables(element, context.variables);

  // Extract page variables from the CHILD file
  const pageVariables = extractPageVariables(asIfAt, fileContent,
                                             userDefinedVariables, includeVariables);

  const content = nunjucks.renderString(fileContent,
                                        { ...pageVariables, ...includeVariables, ...userDefinedVariables },
                                        { path: filePath });

  const childContext = _.cloneDeep(context);
  childContext.cwf = asIfAt;
  childContext.variables = includeVariables;

  return { content, childContext, userDefinedVariables };
};

Parser.prototype._extractInnerVariables = function (content, context, config) {
  const { cwf } = context;
  const $ = cheerio.load(content, {
    xmlMode: false,
    decodeEntities: false,
  });
  const aliases = new Map();
  FILE_ALIASES.set(cwf, aliases);
  $('import[from]').each((index, element) => {
    const filePath = path.resolve(path.dirname(cwf), element.attribs.from);
    const variableNames = Object.keys(element.attribs)
      .filter(name => name !== 'from' && name !== 'as');
    // If no namespace is provided, we use the smallest name as one
    const largestName = variableNames.sort()[0];
    // ... and prepend it with $__MARKBIND__ to reduce collisions.
    const generatedAlias = IMPORTED_VARIABLE_PREFIX + largestName;
    const alias = _.hasIn(element.attribs, 'as')
      ? element.attribs.as
      : generatedAlias;

    aliases.set(alias, filePath);

    // Render inner file content
    const { content: renderedContent, childContext, userDefinedVariables }
      = this._renderIncludeFile(filePath, element, context, config);

    if (!PROCESSED_INNER_VARIABLES.has(filePath)) {
      PROCESSED_INNER_VARIABLES.add(filePath);
      this._extractInnerVariables(renderedContent, childContext, config);
    }
    const innerVariables = getImportedVariableMap(filePath);
    VARIABLE_LOOKUP.get(filePath).forEach((value, variableName, map) => {
      map.set(variableName, nunjucks.renderString(value, { ...userDefinedVariables, ...innerVariables }));
    });
  });
};

Parser.prototype._preprocess = function (node, context, config) {
  const element = node;
  const self = this;
  element.attribs = element.attribs || {};
  element.attribs[ATTRIB_CWF] = path.resolve(context.cwf);

  if (element.name === 'thumbnail') {
    return this._preprocessThumbnails(element);
  }

  const requiresSrc = ['include'].includes(element.name);
  if (requiresSrc && _.isEmpty(element.attribs.src)) {
    const error = new Error(`Empty src attribute in ${element.name} in: ${element.attribs[ATTRIB_CWF]}`);
    this._onError(error);
    return createErrorNode(element, error);
  }
  const shouldProcessSrc = ['include', 'panel'].includes(element.name);
  const hasSrc = _.hasIn(element.attribs, 'src');
  let isUrl;
  let includeSrc;
  let filePath;
  let actualFilePath;
  if (hasSrc && shouldProcessSrc) {
    isUrl = utils.isUrl(element.attribs.src);
    includeSrc = url.parse(element.attribs.src);
    filePath = isUrl
      ? element.attribs.src
      : path.resolve(path.dirname(context.cwf), decodeURIComponent(includeSrc.path));
    actualFilePath = filePath;
    const isBoilerplate = _.hasIn(element.attribs, 'boilerplate');
    if (isBoilerplate) {
      element.attribs.boilerplate = element.attribs.boilerplate || path.basename(filePath);
      actualFilePath = calculateBoilerplateFilePath(element.attribs.boilerplate, filePath, config);
      this.boilerplateIncludeSrc.push({ from: context.cwf, to: actualFilePath });
    }
    const isOptional = element.name === 'include' && _.hasIn(element.attribs, 'optional');
    if (!utils.fileExists(actualFilePath)) {
      if (isOptional) {
        return createEmptyNode();
      }
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
    const isOptional = _.hasIn(element.attribs, 'optional');
    const isTrim = _.hasIn(element.attribs, 'trim');
    element.name = isInline ? 'span' : 'div';
    element.attribs[ATTRIB_INCLUDE_PATH] = filePath;

    if (isOptional && !includeSrc.hash) {
      // optional includes of whole files have been handled, but segments still need to be processed
      delete element.attribs.optional;
    }

    if (isDynamic) {
      element.name = 'panel';
      element.attribs.src = filePath;
      element.attribs['no-close'] = true;
      element.attribs['no-switch'] = true;
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

    const isIncludeSrcMd = utils.isMarkdownFileExt(utils.getExt(filePath));

    if (isIncludeSrcMd && context.source === 'html') {
      // HTML include markdown, use special tag to indicate markdown code.
      element.name = 'markdown';
    }
    const { content, childContext, userDefinedVariables }
      = this._renderIncludeFile(actualFilePath, element, context, config, filePath);
    childContext.source = isIncludeSrcMd ? 'md' : 'html';
    childContext.callStack.push(context.cwf);

    if (!PROCESSED_INNER_VARIABLES.has(filePath)) {
      PROCESSED_INNER_VARIABLES.add(filePath);
      this._extractInnerVariables(content, childContext, config);
    }
    const innerVariables = getImportedVariableMap(filePath);
    const fileContent = nunjucks.renderString(content, { ...userDefinedVariables, ...innerVariables });

    // Delete variable attributes in include
    Object.keys(element.attribs).forEach((attribute) => {
      if (attribute.startsWith('var-')) {
        delete element.attribs[attribute];
      }
    });

    delete element.attribs.boilerplate;
    delete element.attribs.src;
    delete element.attribs.inline;
    delete element.attribs.trim;

    if (includeSrc.hash) {
      // directly get segment from the src
      const segmentSrc = cheerio.parseHTML(fileContent, true);
      const $ = cheerio.load(segmentSrc);
      const hashContent = $(includeSrc.hash).html();
      let actualContent = (hashContent && isTrim) ? hashContent.trim() : hashContent;

      if (actualContent === null) {
        if (isOptional) {
          // set empty content for optional segment include that does not exist
          actualContent = '';
        } else {
          const error = new Error(
            `No such segment '${includeSrc.hash.substring(1)}' in file: ${actualFilePath}`
              + `\nMissing reference in ${element.attribs[ATTRIB_CWF]}`,
          );
          this._onError(error);
          return createErrorNode(element, error);
        }
      }

      if (isOptional) {
        // optional includes of segments have now been handled, so delete the attribute
        delete element.attribs.optional;
      }

      if (isIncludeSrcMd) {
        if (context.mode === 'include') {
          actualContent = isInline ? actualContent : utils.wrapContent(actualContent, '\n\n', '\n');
        } else {
          actualContent = md.render(actualContent);
        }
        actualContent = self._rebaseReferenceForStaticIncludes(actualContent, element, config);
      }
      const wrapperType = isInline ? 'span' : 'div';
      element.children = cheerio.parseHTML(
        `<${wrapperType} data-included-from="${filePath}">${actualContent}</${wrapperType}>`,
        true,
      );
    } else {
      let actualContent = (fileContent && isTrim) ? fileContent.trim() : fileContent;
      if (isIncludeSrcMd) {
        if (context.mode === 'include') {
          actualContent = isInline ? actualContent : utils.wrapContent(actualContent, '\n\n', '\n');
        } else {
          actualContent = md.render(actualContent);
        }
      }
      const wrapperType = isInline ? 'span' : 'div';
      element.children = cheerio.parseHTML(
        `<${wrapperType} data-included-from="${filePath}">${actualContent}</${wrapperType}>`,
        true,
      );
    }

    if (element.children && element.children.length > 0) {
      if (childContext.callStack.length > CyclicReferenceError.MAX_RECURSIVE_DEPTH) {
        const error = new CyclicReferenceError(childContext.callStack);
        this._onError(error);
        return createErrorNode(element, error);
      }
      element.children = element.children.map(e => self._preprocess(e, childContext, config));
    }
  } else if ((element.name === 'panel') && hasSrc) {
    if (!isUrl && includeSrc.hash) {
      element.attribs.fragment = includeSrc.hash.substring(1); // save hash to fragment attribute
    }
    element.attribs.src = filePath;
    this.dynamicIncludeSrc.push({ from: context.cwf, to: actualFilePath, asIfTo: filePath });
    return element;
  } else if (element.name === 'variable' || element.name === 'import') {
    return createEmptyNode();
  } else {
    if (element.name === 'body') {
      // eslint-disable-next-line no-console
      console.warn(`<body> tag found in ${element.attribs[ATTRIB_CWF]}. This may cause formatting errors.`);
    }
    if (element.children && element.children.length > 0) {
      element.children = element.children.map(e => self._preprocess(e, context, config));
    }
  }

  return element;
};

Parser.prototype.processDynamicResources = function (context, html) {
  const self = this;
  const $ = cheerio.load(html, {
    xmlMode: false,
    decodeEntities: false,
  });
  $('img, pic, thumbnail').each(function () {
    const elem = $(this);
    if (elem[0].name === 'thumbnail' && elem.attr('src') === undefined) {
      // Thumbnail tag without src
      return;
    }
    const resourcePath = utils.ensurePosix(elem.attr('src'));
    if (resourcePath === undefined || resourcePath === '') {
      // Found empty img/pic resource in resourcePath
      return;
    }
    if (utils.isAbsolutePath(resourcePath) || utils.isUrl(resourcePath)) {
      // Do not rewrite.
      return;
    }
    const firstParent = elem.closest('div[data-included-from], span[data-included-from]');
    const originalSrc = utils.ensurePosix(firstParent.attr('data-included-from') || context);

    const originalSrcFolder = path.posix.dirname(originalSrc);
    const fullResourcePath = path.posix.join(originalSrcFolder, resourcePath);
    const resolvedResourcePath = path.posix.relative(utils.ensurePosix(self.rootPath), fullResourcePath);
    const absoluteResourcePath = path.posix.join('{{hostBaseUrl}}', resolvedResourcePath);

    $(this).attr('src', absoluteResourcePath);
  });
  $('a, link').each(function () {
    const elem = $(this);
    const resourcePath = elem.attr('href');
    if (resourcePath === undefined || resourcePath === '') {
      // Found empty href resource in resourcePath
      return;
    }
    if (utils.isAbsolutePath(resourcePath) || utils.isUrl(resourcePath) || resourcePath.startsWith('#')) {
      // Do not rewrite.
      return;
    }

    const firstParent = elem.closest('div[data-included-from], span[data-included-from]');
    const originalSrc = utils.ensurePosix(firstParent.attr('data-included-from') || context);

    const originalSrcFolder = path.posix.dirname(originalSrc);
    const fullResourcePath = path.posix.join(originalSrcFolder, resourcePath);
    const resolvedResourcePath = path.posix.relative(utils.ensurePosix(self.rootPath), fullResourcePath);
    const absoluteResourcePath = path.posix.join('{{hostBaseUrl}}', resolvedResourcePath);

    $(this).attr('href', absoluteResourcePath);
  });
  return $.html();
};

Parser.prototype.unwrapIncludeSrc = function (html) {
  const $ = cheerio.load(html, {
    xmlMode: false,
    decodeEntities: false,
  });
  $('div[data-included-from], span[data-included-from]').each(function () {
    $(this).replaceWith($(this).contents());
  });
  return $.html();
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
  case 'panel': {
    if (!_.hasIn(element.attribs, 'src')) { // dynamic panel
      break;
    }
    const fileExists = utils.fileExists(element.attribs.src)
                    || utils.fileExists(calculateBoilerplateFilePath(element.attribs.boilerplate,
                                                                     element.attribs.src, config));
    if (fileExists) {
      const { src, fragment } = element.attribs;
      const resultDir = path.dirname(path.join('{{hostBaseUrl}}', path.relative(config.rootPath, src)));
      const resultPath = path.join(resultDir, utils.setExtension(path.basename(src), '._include_.html'));
      element.attribs.src = utils.ensurePosix(fragment ? `${resultPath}#${fragment}` : resultPath);
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
  context.callStack = [];

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
      const { parent, relative } = calculateNewBaseUrls(file, config.rootPath, config.baseUrlMap);
      const userDefinedVariables = config.userDefinedVariablesMap[path.resolve(parent, relative)];
      const pageVariables = extractPageVariables(file, data, userDefinedVariables, {});

      let fileContent = nunjucks.renderString(data,
                                              { ...pageVariables, ...userDefinedVariables },
                                              { path: actualFilePath });
      this._extractInnerVariables(fileContent, context, config);
      const innerVariables = getImportedVariableMap(context.cwf);
      fileContent = nunjucks.renderString(fileContent, { ...userDefinedVariables, ...innerVariables });
      const fileExt = utils.getExt(file);
      if (utils.isMarkdownFileExt(fileExt)) {
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
      const fileExt = utils.getExt(file);
      if (utils.isMarkdownFileExt(fileExt)) {
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
  if (element.attribs[ATTRIB_INCLUDE_PATH]) {
    const filePath = element.attribs[ATTRIB_INCLUDE_PATH];
    let newBase = calculateNewBaseUrls(filePath, this.rootPath, this.baseUrlMap);
    if (newBase) {
      const { relative, parent } = newBase;
      // eslint-disable-next-line no-param-reassign
      foundBase[parent] = relative;
    }

    const combinedBases = Object.assign({}, childrenBase, foundBase);
    const bases = Object.keys(combinedBases);
    if (bases.length !== 0) {
      // need to rebase
      newBase = combinedBases[bases[0]];
      const { children } = element;
      if (children) {
        const currentBase = calculateNewBaseUrls(element.attribs[ATTRIB_CWF], this.rootPath, this.baseUrlMap);
        if (currentBase) {
          if (currentBase.relative !== newBase) {
            cheerio.prototype.options.xmlMode = false;
            const newBaseUrl = `{{hostBaseUrl}}/${newBase}`;
            const rendered = nunjucks.renderString(cheerio.html(children), {
              // This is to prevent the nunjuck call from converting {{hostBaseUrl}} to an empty string
              // and let the hostBaseUrl value be injected later.
              hostBaseUrl: '{{hostBaseUrl}}',
              baseUrl: newBaseUrl,
            }, { path: filePath });
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
  const fileBase = calculateNewBaseUrls(filePath, config.rootPath, config.baseUrlMap);
  if (!fileBase.relative) {
    return pageData;
  }

  const currentPath = element.attribs[ATTRIB_CWF];
  const currentBase = calculateNewBaseUrls(currentPath, config.rootPath, config.baseUrlMap);
  if (currentBase.relative === fileBase.relative) {
    return pageData;
  }

  const newBase = fileBase.relative;
  const newBaseUrl = `{{hostBaseUrl}}/${newBase}`;
  return nunjucks.renderString(pageData, { baseUrl: newBaseUrl }, { path: filePath });
};

module.exports = Parser;
