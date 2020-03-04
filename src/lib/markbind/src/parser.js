const cheerio = require('cheerio');
const fs = require('fs');
const htmlparser = require('htmlparser2'); require('./patches/htmlparser2');
const nunjucks = require('nunjucks');
const path = require('path');
const Promise = require('bluebird');
const url = require('url');
const pathIsInside = require('path-is-inside');
const slugify = require('@sindresorhus/slugify');
const componentParser = require('./parsers/componentParser');

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

const {
  ATTRIB_INCLUDE_PATH,
  ATTRIB_CWF,
  BOILERPLATE_FOLDER_NAME,
  IMPORTED_VARIABLE_PREFIX,
} = require('./constants');

class Parser {
  constructor(options) {
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
   * Returns an object containing the imported variables for specified file
   * @param file file name to get the imported variables for
   */
  // eslint-disable-next-line class-methods-use-this
  getImportedVariableMap(file) {
    const innerVariables = {};
    Parser.FILE_ALIASES.get(file).forEach((actualPath, alias) => {
      innerVariables[alias] = {};
      const variables = Parser.VARIABLE_LOOKUP.get(actualPath);
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
  // eslint-disable-next-line class-methods-use-this
  extractPageVariables(fileName, data, userDefinedVariables, includedVariables) {
    const $ = cheerio.load(data);
    const pageVariables = {};
    Parser.VARIABLE_LOOKUP.set(fileName, new Map());
    /**
     * <import>ed variables have not been processed yet, we replace such variables with itself first.
     */
    const importedVariables = {};
    $('import[from]').each((index, node) => {
      const variableNames = Object.keys(node.attribs)
        .filter(name => name !== 'from' && name !== 'as');
      // If no namespace is provided, we use the smallest name as one...
      const largestName = variableNames.sort()[0];
      // ... and prepend it with $__MARKBIND__ to reduce collisions.
      const generatedAlias = IMPORTED_VARIABLE_PREFIX + largestName;
      const hasAlias = _.hasIn(node.attribs, 'as');
      const alias = hasAlias ? node.attribs.as : generatedAlias;
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
        const variableValue = nunjucks.renderString(md.renderInline(variableElement.html()), {
          ...importedVariables, ...pageVariables, ...userDefinedVariables, ...includedVariables,
        });
        pageVariables[variableName] = variableValue;
        Parser.VARIABLE_LOOKUP.get(fileName).set(variableName, variableValue);
      }
    });
    return { ...importedVariables, ...pageVariables };
  }

  getDynamicIncludeSrc() {
    return _.clone(this.dynamicIncludeSrc);
  }

  getStaticIncludeSrc() {
    return _.clone(this.staticIncludeSrc);
  }

  getBoilerplateIncludeSrc() {
    return _.clone(this.boilerplateIncludeSrc);
  }

  getMissingIncludeSrc() {
    return _.clone(this.missingIncludeSrc);
  }

  static _preprocessThumbnails(node) {
    const isImage = _.hasIn(node.attribs, 'src') && node.attribs.src !== '';
    if (isImage) {
      return node;
    }
    const text = _.hasIn(node.attribs, 'text') ? node.attribs.text : '';
    if (text === '') {
      return node;
    }
    const renderedText = md.renderInline(text);
    // eslint-disable-next-line no-param-reassign
    node.children = cheerio.parseHTML(renderedText);
    return node;
  }

  _renderIncludeFile(filePath, node, context, config, asIfAt = filePath) {
    try {
      this._fileCache[filePath] = this._fileCache[filePath]
        ? this._fileCache[filePath] : fs.readFileSync(filePath, 'utf8');
    } catch (e) {
      // Read file fail
      const missingReferenceErrorMessage = `Missing reference in: ${node.attribs[ATTRIB_CWF]}`;
      e.message += `\n${missingReferenceErrorMessage}`;
      this._onError(e);
      return Parser.createErrorNode(node, e);
    }
    const fileContent = this._fileCache[filePath]; // cache the file contents to save some I/O
    const { parent, relative } = Parser.calculateNewBaseUrls(asIfAt, config.rootPath, config.baseUrlMap);
    const userDefinedVariables = config.userDefinedVariablesMap[path.resolve(parent, relative)];
    // Extract included variables from the PARENT file
    const includeVariables = Parser.extractIncludeVariables(node, context.variables);
    // Extract page variables from the CHILD file
    const pageVariables
      = this.extractPageVariables(asIfAt, fileContent, userDefinedVariables, includeVariables);
    const content
      = nunjucks.renderString(fileContent,
                              { ...pageVariables, ...includeVariables, ...userDefinedVariables },
                              { path: filePath });
    const childContext = _.cloneDeep(context);
    childContext.cwf = asIfAt;
    childContext.variables = includeVariables;
    return { content, childContext, userDefinedVariables };
  }

  _extractInnerVariables(content, context, config) {
    const { cwf } = context;
    const $ = cheerio.load(content, {
      xmlMode: false,
      decodeEntities: false,
    });
    const aliases = new Map();
    Parser.FILE_ALIASES.set(cwf, aliases);
    $('import[from]').each((index, node) => {
      const filePath = path.resolve(path.dirname(cwf), node.attribs.from);
      const variableNames = Object.keys(node.attribs)
        .filter(name => name !== 'from' && name !== 'as');
      // If no namespace is provided, we use the smallest name as one
      const largestName = variableNames.sort()[0];
      // ... and prepend it with $__MARKBIND__ to reduce collisions.
      const generatedAlias = IMPORTED_VARIABLE_PREFIX + largestName;
      const alias = _.hasIn(node.attribs, 'as')
        ? node.attribs.as
        : generatedAlias;
      aliases.set(alias, filePath);
      this.staticIncludeSrc.push({ from: context.cwf, to: filePath });
      // Render inner file content
      const { content: renderedContent, childContext, userDefinedVariables }
        = this._renderIncludeFile(filePath, node, context, config);
      if (!Parser.PROCESSED_INNER_VARIABLES.has(filePath)) {
        Parser.PROCESSED_INNER_VARIABLES.add(filePath);
        this._extractInnerVariables(renderedContent, childContext, config);
      }
      const innerVariables = this.getImportedVariableMap(filePath);
      Parser.VARIABLE_LOOKUP.get(filePath).forEach((value, variableName, map) => {
        map.set(variableName, nunjucks.renderString(value, { ...userDefinedVariables, ...innerVariables }));
      });
    });
  }

  _preprocess(node, context, config) {
    node.attribs = node.attribs || {};
    node.attribs[ATTRIB_CWF] = path.resolve(context.cwf);
    if (node.name === 'thumbnail') {
      return Parser._preprocessThumbnails(node);
    }
    const requiresSrc = ['include'].includes(node.name);
    if (requiresSrc && _.isEmpty(node.attribs.src)) {
      const error = new Error(`Empty src attribute in ${node.name} in: ${node.attribs[ATTRIB_CWF]}`);
      this._onError(error);
      return Parser.createErrorNode(node, error);
    }
    const shouldProcessSrc = ['include', 'panel'].includes(node.name);
    const hasSrc = _.hasIn(node.attribs, 'src');
    let isUrl;
    let includeSrc;
    let filePath;
    let actualFilePath;
    if (hasSrc && shouldProcessSrc) {
      isUrl = utils.isUrl(node.attribs.src);
      includeSrc = url.parse(node.attribs.src);
      filePath = isUrl
        ? node.attribs.src
        : path.resolve(path.dirname(context.cwf), decodeURIComponent(includeSrc.path));
      actualFilePath = filePath;
      const isBoilerplate = _.hasIn(node.attribs, 'boilerplate');
      if (isBoilerplate) {
        node.attribs.boilerplate = node.attribs.boilerplate || path.basename(filePath);
        actualFilePath
          = Parser.calculateBoilerplateFilePath(node.attribs.boilerplate, filePath, config);
        this.boilerplateIncludeSrc.push({ from: context.cwf, to: actualFilePath });
      }
      const isOptional = node.name === 'include' && _.hasIn(node.attribs, 'optional');
      if (!utils.fileExists(actualFilePath)) {
        if (isOptional) {
          return Parser.createEmptyNode();
        }
        this.missingIncludeSrc.push({ from: context.cwf, to: actualFilePath });
        const error
        = new Error(`No such file: ${actualFilePath}\nMissing reference in ${node.attribs[ATTRIB_CWF]}`);
        this._onError(error);
        return Parser.createErrorNode(node, error);
      }
    }
    if (node.name === 'include') {
      const isInline = _.hasIn(node.attribs, 'inline');
      const isDynamic = _.hasIn(node.attribs, 'dynamic');
      const isOptional = _.hasIn(node.attribs, 'optional');
      const isTrim = _.hasIn(node.attribs, 'trim');
      node.name = isInline ? 'span' : 'div';
      node.attribs[ATTRIB_INCLUDE_PATH] = filePath;
      if (isOptional && !includeSrc.hash) {
        // optional includes of whole files have been handled, but segments still need to be processed
        delete node.attribs.optional;
      }
      if (isDynamic) {
        node.name = 'panel';
        node.attribs.src = filePath;
        node.attribs['no-close'] = true;
        node.attribs['no-switch'] = true;
        if (includeSrc.hash) {
          node.attribs.fragment = includeSrc.hash.substring(1);
        }
        node.attribs.header = node.attribs.name || '';
        delete node.attribs.dynamic;
        this.dynamicIncludeSrc.push({ from: context.cwf, to: actualFilePath, asIfTo: node.attribs.src });
        return node;
      }
      if (isUrl) {
        return node; // only keep url path for dynamic
      }
      this.staticIncludeSrc.push({ from: context.cwf, to: actualFilePath });
      const isIncludeSrcMd = utils.isMarkdownFileExt(utils.getExt(filePath));
      if (isIncludeSrcMd && context.source === 'html') {
        // HTML include markdown, use special tag to indicate markdown code.
        node.name = 'markdown';
      }
      const { content, childContext, userDefinedVariables }
      = this._renderIncludeFile(actualFilePath, node, context, config, filePath);
      childContext.source = isIncludeSrcMd ? 'md' : 'html';
      childContext.callStack.push(context.cwf);
      if (!Parser.PROCESSED_INNER_VARIABLES.has(filePath)) {
        Parser.PROCESSED_INNER_VARIABLES.add(filePath);
        this._extractInnerVariables(content, childContext, config);
      }
      const innerVariables = this.getImportedVariableMap(filePath);
      const fileContent = nunjucks.renderString(content, { ...userDefinedVariables, ...innerVariables });
      // Delete variable attributes in include
      Object.keys(node.attribs).forEach((attribute) => {
        if (attribute.startsWith('var-')) {
          delete node.attribs[attribute];
        }
      });
      delete node.attribs.boilerplate;
      delete node.attribs.src;
      delete node.attribs.inline;
      delete node.attribs.trim;
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
            const error
              = new Error(`No such segment '${includeSrc.hash.substring(1)}' in file: ${actualFilePath}`
              + `\nMissing reference in ${node.attribs[ATTRIB_CWF]}`);
            this._onError(error);
            return Parser.createErrorNode(node, error);
          }
        }
        if (isOptional) {
          // optional includes of segments have now been handled, so delete the attribute
          delete node.attribs.optional;
        }
        if (isIncludeSrcMd) {
          if (context.mode === 'include') {
            actualContent = isInline ? actualContent : utils.wrapContent(actualContent, '\n\n', '\n');
          } else {
            actualContent = md.render(actualContent);
          }
          actualContent = Parser._rebaseReferenceForStaticIncludes(actualContent, node, config);
        }
        const wrapperType = isInline ? 'span' : 'div';
        node.children
          = cheerio.parseHTML(
            `<${wrapperType} data-included-from="${filePath}">${actualContent}</${wrapperType}>`,
            true);
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
        node.children
          = cheerio.parseHTML(
            `<${wrapperType} data-included-from="${filePath}">${actualContent}</${wrapperType}>`,
            true);
      }
      if (node.children && node.children.length > 0) {
        if (childContext.callStack.length > CyclicReferenceError.MAX_RECURSIVE_DEPTH) {
          const error = new CyclicReferenceError(childContext.callStack);
          this._onError(error);
          return Parser.createErrorNode(node, error);
        }
        node.children = node.children.map(e => this._preprocess(e, childContext, config));
      }
    } else if ((node.name === 'panel') && hasSrc) {
      if (!isUrl && includeSrc.hash) {
        node.attribs.fragment = includeSrc.hash.substring(1); // save hash to fragment attribute
      }
      node.attribs.src = filePath;
      this.dynamicIncludeSrc.push({ from: context.cwf, to: actualFilePath, asIfTo: filePath });
      return node;
    } else if (node.name === 'variable' || node.name === 'import') {
      return Parser.createEmptyNode();
    } else {
      if (node.name === 'body') {
        // eslint-disable-next-line no-console
        console.warn(`<body> tag found in ${node.attribs[ATTRIB_CWF]}. This may cause formatting errors.`);
      }
      if (node.children && node.children.length > 0) {
        node.children = node.children.map(e => this._preprocess(e, context, config));
      }
    }
    return node;
  }

  processDynamicResources(context, html) {
    const $ = cheerio.load(html, {
      xmlMode: false,
      decodeEntities: false,
    });

    const { rootPath } = this;
    function getAbsoluteResourcePath(elem, relativeResourcePath) {
      const firstParent = elem.closest('div[data-included-from], span[data-included-from]');
      const originalSrc = utils.ensurePosix(firstParent.attr('data-included-from') || context);
      const originalSrcFolder = path.posix.dirname(originalSrc);
      const fullResourcePath = path.posix.join(originalSrcFolder, relativeResourcePath);
      const resolvedResourcePath = path.posix.relative(utils.ensurePosix(rootPath), fullResourcePath);
      return path.posix.join('{{hostBaseUrl}}', resolvedResourcePath);
    }

    $('img, pic, thumbnail').each(function () {
      const elem = $(this);
      const resourcePath = utils.ensurePosix(elem.attr('src'));
      if (resourcePath === undefined || resourcePath === '') {
        // Found empty img/pic resource in resourcePath
        return;
      }
      if (utils.isAbsolutePath(resourcePath) || utils.isUrl(resourcePath)) {
        // Do not rewrite.
        return;
      }
      const absoluteResourcePath = getAbsoluteResourcePath(elem, resourcePath);
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
      const absoluteResourcePath = getAbsoluteResourcePath(elem, resourcePath);
      $(this).attr('href', absoluteResourcePath);
    });
    return $.html();
  }

  static unwrapIncludeSrc(html) {
    const $ = cheerio.load(html, {
      xmlMode: false,
      decodeEntities: false,
    });
    $('div[data-included-from], span[data-included-from]').each(function () {
      $(this).replaceWith($(this).contents());
    });
    return $.html();
  }

  _parse(node, context, config) {
    if (_.isArray(node)) {
      return node.map(el => this._parse(el, context, config));
    }
    if (Parser.isText(node)) {
      return node;
    }
    if (node.name) {
      node.name = node.name.toLowerCase();
    }

    if ((/^h[1-6]$/).test(node.name) && !node.attribs.id) {
      const textContent = utils.getTextContent(node);
      const slugifiedHeading = slugify(textContent, { decamelize: false });

      let headerId = slugifiedHeading;
      const { headerIdMap } = config;
      if (headerIdMap[slugifiedHeading]) {
        headerId = `${slugifiedHeading}-${headerIdMap[slugifiedHeading]}`;
        headerIdMap[slugifiedHeading] += 1;
      } else {
        headerIdMap[slugifiedHeading] = 2;
      }

      node.attribs.id = headerId;
    }

    switch (node.name) {
    case 'md':
      node.name = 'span';
      cheerio.prototype.options.xmlMode = false;
      node.children = cheerio.parseHTML(md.renderInline(cheerio.html(node.children)), true);
      cheerio.prototype.options.xmlMode = true;
      break;
    case 'markdown':
      node.name = 'div';
      cheerio.prototype.options.xmlMode = false;
      node.children = cheerio.parseHTML(md.render(cheerio.html(node.children)), true);
      cheerio.prototype.options.xmlMode = true;
      break;
    case 'panel': {
      if (!_.hasIn(node.attribs, 'src')) { // dynamic panel
        break;
      }
      const fileExists = utils.fileExists(node.attribs.src)
          || utils.fileExists(
            Parser.calculateBoilerplateFilePath(
              node.attribs.boilerplate,
              node.attribs.src, config));
      if (fileExists) {
        const { src, fragment } = node.attribs;
        const resultDir = path.dirname(path.join('{{hostBaseUrl}}', path.relative(config.rootPath, src)));
        const resultPath = path.join(resultDir, utils.setExtension(path.basename(src), '._include_.html'));
        node.attribs.src = utils.ensurePosix(fragment ? `${resultPath}#${fragment}` : resultPath);
      }
      delete node.attribs.boilerplate;
      break;
    }
    default:
      break;
    }

    componentParser.parseComponents(node, this._onError);

    if (node.children) {
      node.children.forEach((child) => {
        this._parse(child, context, config);
      });
    }

    componentParser.postParseComponents(node, this._onError);

    return node;
  }

  _trimNodes(node) {
    if (node.name === 'pre' || node.name === 'code') {
      return;
    }
    if (node.children) {
      node.children = node.children.filter((child) => {
        if (child.type === 'comment') {
          return false;
        } else if (child.type === 'tag') {
          this._trimNodes(child);
        }
        return true;
      });

      // IF the last child is an empty text node, pop it out.
      const lastChild = node.children[node.children.length - 1];
      if (lastChild && lastChild.type === 'text' && !/\S/.test(lastChild.data)) {
        node.children.pop();
      }
    }
  }

  preprocess(file, pageData, context, config) {
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
            processed = Parser.createErrorNode(d, err);
          }
          return processed;
        });
        resolve(cheerio.html(nodes));
      });

      const parser = new htmlparser.Parser(handler, {
        xmlMode: true,
        decodeEntities: true,
      });

      const { parent, relative } = Parser.calculateNewBaseUrls(file, config.rootPath, config.baseUrlMap);
      const userDefinedVariables = config.userDefinedVariablesMap[path.resolve(parent, relative)];
      const { additionalVariables } = config;
      const pageVariables = this.extractPageVariables(file, pageData, userDefinedVariables, {});

      let fileContent = nunjucks.renderString(pageData,
                                              {
                                                ...pageVariables,
                                                ...userDefinedVariables,
                                                ...additionalVariables,
                                              },
                                              { path: file });
      this._extractInnerVariables(fileContent, context, config);
      const innerVariables = this.getImportedVariableMap(context.cwf);
      fileContent = nunjucks.renderString(fileContent, {
        ...userDefinedVariables,
        ...additionalVariables,
        ...innerVariables,
      });
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
  }

  includeFile(file, config) {
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
            processed = Parser.createErrorNode(d, err);
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
        const boilerplateFilePath
          = Parser.calculateBoilerplateFilePath(path.basename(file), file, config);
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
        const { parent, relative }
          = Parser.calculateNewBaseUrls(file, config.rootPath, config.baseUrlMap);
        const userDefinedVariables = config.userDefinedVariablesMap[path.resolve(parent, relative)];
        const pageVariables = this.extractPageVariables(file, data, userDefinedVariables, {});
        let fileContent
          = nunjucks.renderString(
            data,
            { ...pageVariables, ...userDefinedVariables },
            { path: actualFilePath });
        this._extractInnerVariables(fileContent, context, config);
        const innerVariables = this.getImportedVariableMap(context.cwf);
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
  }

  includeData(file, pageData, config) {
    const context = {};
    context.cwf = config.cwf || file; // current working file

    return new Promise((resolve, reject) => {
      let actualFilePath = file;
      if (!utils.fileExists(file)) {
        const boilerplateFilePath = Parser.calculateBoilerplateFilePath(path.basename(file), file, config);
        if (utils.fileExists(boilerplateFilePath)) {
          actualFilePath = boilerplateFilePath;
        }
      }

      this.preprocess(actualFilePath, pageData, context, config)
        .then(resolve)
        .catch(reject);
    });
  }

  renderFile(file, config) {
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
            parsed = Parser.createErrorNode(d, err);
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
  }

  resolveBaseUrl(pageData, config) {
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
  }

  _rebaseReference(node, foundBase) {
    if (_.isArray(node)) {
      return node.map(el => this._rebaseReference(el, foundBase));
    }
    if (Parser.isText(node)) {
      return node;
    }
    // Rebase children element
    const childrenBase = {};
    node.children.forEach((el) => {
      this._rebaseReference(el, childrenBase);
    });
    // rebase current element
    if (node.attribs[ATTRIB_INCLUDE_PATH]) {
      const filePath = node.attribs[ATTRIB_INCLUDE_PATH];
      let newBase = Parser.calculateNewBaseUrls(filePath, this.rootPath, this.baseUrlMap);
      if (newBase) {
        const { relative, parent } = newBase;
        // eslint-disable-next-line no-param-reassign
        foundBase[parent] = relative;
      }
      const combinedBases = { ...childrenBase, ...foundBase };
      const bases = Object.keys(combinedBases);
      if (bases.length !== 0) {
        // need to rebase
        newBase = combinedBases[bases[0]];
        const { children } = node;
        if (children) {
          const currentBase
            = Parser.calculateNewBaseUrls(node.attribs[ATTRIB_CWF], this.rootPath, this.baseUrlMap);
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
              node.children = cheerio.parseHTML(rendered, true);
              cheerio.prototype.options.xmlMode = true;
            }
          }
        }
      }
      delete node.attribs[ATTRIB_INCLUDE_PATH];
    }
    delete node.attribs[ATTRIB_CWF];
    return node;
  }

  static _rebaseReferenceForStaticIncludes(pageData, node, config) {
    if (!config) {
      return pageData;
    }
    if (!pageData.includes('{{baseUrl}}')) {
      return pageData;
    }
    const filePath = node.attribs[ATTRIB_INCLUDE_PATH];
    const fileBase = Parser.calculateNewBaseUrls(filePath, config.rootPath, config.baseUrlMap);
    if (!fileBase.relative) {
      return pageData;
    }
    const currentPath = node.attribs[ATTRIB_CWF];
    const currentBase = Parser.calculateNewBaseUrls(currentPath, config.rootPath, config.baseUrlMap);
    if (currentBase.relative === fileBase.relative) {
      return pageData;
    }
    const newBase = fileBase.relative;
    const newBaseUrl = `{{hostBaseUrl}}/${newBase}`;
    return nunjucks.renderString(pageData, { baseUrl: newBaseUrl }, { path: filePath });
  }

  static resetVariables() {
    Parser.VARIABLE_LOOKUP.clear();
    Parser.FILE_ALIASES.clear();
    Parser.PROCESSED_INNER_VARIABLES.clear();
  }

  /**
   * @throws Will throw an error if a non-absolute path or path outside the root is given
   */
  static calculateNewBaseUrls(filePath, root, lookUp) {
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

  static calculateBoilerplateFilePath(pathInBoilerplates, asIfAt, config) {
    const { parent, relative } = Parser.calculateNewBaseUrls(asIfAt, config.rootPath, config.baseUrlMap);
    return path.resolve(parent, relative, BOILERPLATE_FOLDER_NAME, pathInBoilerplates);
  }

  static createErrorNode(node, error) {
    const errorElement = cheerio.parseHTML(utils.createErrorElement(error), true)[0];
    return Object.assign(node, _.pick(errorElement, ['name', 'attribs', 'children']));
  }

  static createEmptyNode() {
    const emptyElement = cheerio.parseHTML('<div></div>', true)[0];
    return emptyElement;
  }

  static isText(node) {
    return node.type === 'text' || node.type === 'comment';
  }

  /**
   * Extract variables from an include element
   * @param includeElement include element to extract variables from
   * @param contextVariables variables defined by parent pages
   */
  static extractIncludeVariables(includeElement, contextVariables) {
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
}

Parser.VARIABLE_LOOKUP = new Map();
Parser.FILE_ALIASES = new Map();
Parser.PROCESSED_INNER_VARIABLES = new Set();

module.exports = Parser;
