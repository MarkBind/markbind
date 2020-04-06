const cheerio = require('cheerio');
const fs = require('fs');
const htmlparser = require('htmlparser2'); require('./patches/htmlparser2');
const nunjucks = require('nunjucks');
const path = require('path');
const Promise = require('bluebird');
const slugify = require('@sindresorhus/slugify');
const ensurePosix = require('ensure-posix-path');
const componentParser = require('./parsers/componentParser');
const componentPreprocessor = require('./preprocessors/componentPreprocessor');
const nunjuckUtils = require('./utils/nunjuckUtils');
const logger = require('../../../util/logger');

const _ = {};
_.clone = require('lodash/clone');
_.cloneDeep = require('lodash/cloneDeep');
_.hasIn = require('lodash/hasIn');
_.isArray = require('lodash/isArray');
_.isEmpty = require('lodash/isEmpty');

const md = require('./lib/markdown-it');
const utils = require('./utils');
const urlUtils = require('./utils/urls');

cheerio.prototype.options.xmlMode = true; // Enable xml mode for self-closing tag
cheerio.prototype.options.decodeEntities = false; // Don't escape HTML entities

const {
  ATTRIB_INCLUDE_PATH,
  ATTRIB_CWF,
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
    const fileDir = path.dirname(fileName);
    const $ = cheerio.load(data);
    const pageVariables = {};
    Parser.VARIABLE_LOOKUP.set(fileName, new Map());
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
    const setPageVariable = (variableName, rawVariableValue) => {
      const otherVariables = {
        ...importedVariables,
        ...pageVariables,
        ...userDefinedVariables,
        ...includedVariables,
      };
      const variableValue = nunjuckUtils.renderEscaped(nunjucks, rawVariableValue, otherVariables);
      if (!pageVariables[variableName]) {
        pageVariables[variableName] = variableValue;
        Parser.VARIABLE_LOOKUP.get(fileName).set(variableName, variableValue);
      }
    };
    $('variable').each(function () {
      const variableElement = $(this);
      const variableName = variableElement.attr('name');
      const variableSource = $(this).attr('from');
      if (variableSource !== undefined) {
        try {
          const variableFilePath = path.resolve(fileDir, variableSource);
          const jsonData = fs.readFileSync(variableFilePath);
          const varData = JSON.parse(jsonData);
          Object.entries(varData).forEach(([varName, varValue]) => {
            setPageVariable(varName, varValue);
          });
        } catch (err) {
          logger.warn(`Error ${err.message}`);
        }
      } else {
        if (!variableName) {
          // eslint-disable-next-line no-console
          console.warn(`Missing 'name' for variable in ${fileName}\n`);
          return;
        }
        setPageVariable(variableName, md.renderInline(variableElement.html()));
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

  _renderIncludeFile(filePath, node, context, config, asIfAt = filePath) {
    try {
      this._fileCache[filePath] = this._fileCache[filePath]
        ? this._fileCache[filePath] : fs.readFileSync(filePath, 'utf8');
    } catch (e) {
      // Read file fail
      const missingReferenceErrorMessage = `Missing reference in: ${node.attribs[ATTRIB_CWF]}`;
      e.message += `\n${missingReferenceErrorMessage}`;
      this._onError(e);
      return utils.createErrorNode(node, e);
    }
    const fileContent = this._fileCache[filePath]; // cache the file contents to save some I/O
    const parentSitePath = urlUtils.getParentSiteAbsolutePath(asIfAt, config.rootPath, config.baseUrlMap);
    const userDefinedVariables = config.userDefinedVariablesMap[parentSitePath];
    // Extract included variables from the PARENT file
    const includeVariables = Parser.extractIncludeVariables(node, context.variables);
    // Extract page variables from the CHILD file
    const pageVariables
      = this.extractPageVariables(asIfAt, fileContent, userDefinedVariables, includeVariables);
    const content = nunjuckUtils.renderEscaped(nunjucks, fileContent, {
      ...pageVariables,
      ...includeVariables,
      ...userDefinedVariables,
    }, {
      path: filePath,
    });
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
      this.extractInnerVariablesIfNotProcessed(renderedContent, childContext, config, filePath);
      const innerVariables = this.getImportedVariableMap(filePath);

      Parser.VARIABLE_LOOKUP.get(filePath).forEach((value, variableName, map) => {
        map.set(variableName, nunjuckUtils.renderEscaped(nunjucks, value, {
          ...userDefinedVariables, ...innerVariables,
        }));
      });
    });
  }

  extractInnerVariablesIfNotProcessed(content, childContext, config, filePathToExtract) {
    if (!Parser.PROCESSED_INNER_VARIABLES.has(filePathToExtract)) {
      Parser.PROCESSED_INNER_VARIABLES.add(filePathToExtract);
      this._extractInnerVariables(content, childContext, config);
    }
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
      if (!elem.attr('src')) {
        return;
      }
      const resourcePath = utils.ensurePosix(elem.attr('src'));
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

  _parse(node, config) {
    if (_.isArray(node)) {
      return node.map(el => this._parse(el, config));
    }
    if (Parser.isText(node)) {
      return node;
    }
    if (node.name) {
      node.name = node.name.toLowerCase();
    }

    if ((/^h[1-6]$/).test(node.name) && !node.attribs.id) {
      const textContent = utils.getTextContent(node);
      // remove the '&lt;' and '&gt;' symbols that markdown-it uses to escape '<' and '>'
      const cleanedContent = textContent.replace(/&lt;|&gt;/g, '');
      const slugifiedHeading = slugify(cleanedContent, { decamelize: false });

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
            urlUtils.calculateBoilerplateFilePath(
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
        this._parse(child, config);
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
      /* eslint-disable no-plusplus */
      for (let n = 0; n < node.children.length; n++) {
        const child = node.children[n];
        if (child.type === 'comment'
          || (child.type === 'text' && n === node.children.length - 1 && !/\S/.test(child.data))) {
          node.children.splice(n, 1);
          n--;
        } else if (child.type === 'tag') {
          this._trimNodes(child);
        }
      }
      /* eslint-enable no-plusplus */
    }
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
            processed = componentPreprocessor.preProcessComponent(d, context, config, this);
          } catch (err) {
            err.message += `\nError while preprocessing '${file}'`;
            this._onError(err);
            processed = utils.createErrorNode(d, err);
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
          = urlUtils.calculateBoilerplateFilePath(path.basename(file), file, config);
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
        const parentSitePath = urlUtils.getParentSiteAbsolutePath(file, config.rootPath, config.baseUrlMap);
        const userDefinedVariables = config.userDefinedVariablesMap[parentSitePath];
        const pageVariables = this.extractPageVariables(file, data, userDefinedVariables, {});
        let fileContent = nunjuckUtils.renderEscaped(nunjucks, data, {
          ...pageVariables,
          ...userDefinedVariables,
        }, {
          path: actualFilePath,
        });
        this._extractInnerVariables(fileContent, context, config);
        const innerVariables = this.getImportedVariableMap(context.cwf);
        fileContent = nunjuckUtils.renderEscaped(nunjucks, fileContent, {
          ...userDefinedVariables, ...innerVariables,
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
    });
  }

  includeData(file, pageData, config) {
    const context = {};
    context.cwf = config.cwf || file; // current working file

    return new Promise((resolve, reject) => {
      let actualFilePath = file;
      if (!utils.fileExists(file)) {
        const boilerplateFilePath = urlUtils.calculateBoilerplateFilePath(path.basename(file), file, config);
        if (utils.fileExists(boilerplateFilePath)) {
          actualFilePath = boilerplateFilePath;
        }
      }

      const currentContext = context;
      currentContext.mode = 'include';
      currentContext.callStack = [];

      const handler = new htmlparser.DomHandler((error, dom) => {
        if (error) {
          reject(error);
          return;
        }
        const nodes = dom.map((d) => {
          let processed;
          try {
            processed = componentPreprocessor.preProcessComponent(d, currentContext, config, this);
          } catch (err) {
            err.message += `\nError while preprocessing '${actualFilePath}'`;
            this._onError(err);
            processed = utils.createErrorNode(d, err);
          }
          return processed;
        });
        resolve(cheerio.html(nodes));
      });

      const parser = new htmlparser.Parser(handler, {
        xmlMode: true,
        decodeEntities: true,
      });

      const parentSitePath = urlUtils.getParentSiteAbsolutePath(file, config.rootPath, config.baseUrlMap);
      const userDefinedVariables = config.userDefinedVariablesMap[parentSitePath];
      const { additionalVariables } = config;
      const pageVariables = this.extractPageVariables(actualFilePath, pageData, userDefinedVariables, {});

      let fileContent = nunjuckUtils.renderEscaped(nunjucks, pageData, {
        ...pageVariables,
        ...userDefinedVariables,
        ...additionalVariables,
      }, {
        path: actualFilePath,
      });
      this._extractInnerVariables(fileContent, currentContext, config);
      const innerVariables = this.getImportedVariableMap(currentContext.cwf);
      fileContent = nunjuckUtils.renderEscaped(nunjucks, fileContent, {
        ...userDefinedVariables,
        ...additionalVariables,
        ...innerVariables,
      });
      const fileExt = utils.getExt(actualFilePath);
      if (utils.isMarkdownFileExt(fileExt)) {
        currentContext.source = 'md';
        parser.parseComplete(fileContent.toString());
      } else if (fileExt === 'html') {
        currentContext.source = 'html';
        parser.parseComplete(fileContent);
      } else {
        const error = new Error(`Unsupported File Extension: '${fileExt}'`);
        reject(error);
      }
    });
  }

  render(content, filePath, config) {
    return new Promise((resolve, reject) => {
      const handler = new htmlparser.DomHandler((error, dom) => {
        if (error) {
          reject(error);
          return;
        }
        const nodes = dom.map((d) => {
          let parsed;
          try {
            parsed = this._parse(d, config);
          } catch (err) {
            err.message += `\nError while rendering '${filePath}'`;
            this._onError(err);
            parsed = utils.createErrorNode(d, err);
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
      const fileExt = utils.getExt(filePath);
      if (utils.isMarkdownFileExt(fileExt)) {
        const renderedContent = md.render(content);
        parser.parseComplete(renderedContent);
      } else if (fileExt === 'html') {
        parser.parseComplete(content);
      } else {
        const error = new Error(`Unsupported File Extension: '${fileExt}'`);
        reject(error);
      }
    });
  }

  resolveBaseUrl(pageData, config) {
    const { baseUrlMap, rootPath } = config;
    this.baseUrlMap = baseUrlMap;
    this.rootPath = rootPath;

    return new Promise((resolve, reject) => {
      const handler = new htmlparser.DomHandler((error, dom) => {
        if (error) {
          reject(error);
          return;
        }
        const nodes = dom.map(d => this._rebaseReference(d));
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

  /**
   * Pre-renders the baseUrl of the provided node and its children according to
   * the site they belong to, such that the final call to render baseUrl correctly
   * resolves baseUrl according to the said site.
   */
  _rebaseReference(node) {
    if (_.isArray(node)) {
      return node.map(el => this._rebaseReference(el));
    }
    if (Parser.isText(node)) {
      return node;
    }

    // Rebase children elements
    node.children.forEach(el => this._rebaseReference(el));

    const includeSourceFile = node.attribs[ATTRIB_CWF];
    const includedSourceFile = node.attribs[ATTRIB_INCLUDE_PATH];
    delete node.attribs[ATTRIB_CWF];
    delete node.attribs[ATTRIB_INCLUDE_PATH];

    // Skip rebasing for non-includes
    if (!includedSourceFile || !node.children) {
      return node;
    }

    // The site at which the file with the include element was pre-processed
    const currentBase = urlUtils.getParentSiteAbsolutePath(includeSourceFile, this.rootPath, this.baseUrlMap);
    // The site of the included file
    const newBase = urlUtils.getParentSiteAbsoluteAndRelativePaths(includedSourceFile, this.rootPath,
                                                                   this.baseUrlMap);

    // Only re-render if include src and content are from different sites
    if (currentBase !== newBase.absolute) {
      cheerio.prototype.options.xmlMode = false;
      const rendered = nunjuckUtils.renderEscaped(nunjucks, cheerio.html(node.children), {
        // This is to prevent the nunjuck call from converting {{hostBaseUrl}} to an empty string
        // and let the hostBaseUrl value be injected later.
        hostBaseUrl: '{{hostBaseUrl}}',
        baseUrl: `{{hostBaseUrl}}/${ensurePosix(newBase.relative)}`,
      }, { path: includedSourceFile });
      node.children = cheerio.parseHTML(rendered, true);
      cheerio.prototype.options.xmlMode = true;
    }

    return node;
  }

  static resetVariables() {
    Parser.VARIABLE_LOOKUP.clear();
    Parser.FILE_ALIASES.clear();
    Parser.PROCESSED_INNER_VARIABLES.clear();
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
