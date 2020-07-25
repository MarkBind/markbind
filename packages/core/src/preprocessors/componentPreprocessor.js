const cheerio = require('cheerio');
const path = require('path');
const url = require('url');
const logger = require('../utils/logger');

const { CyclicReferenceError } = require('../errors');

const utils = require('../utils');
const urlUtils = require('../utils/urls');

const _ = {};
_.has = require('lodash/has');
_.isEmpty = require('lodash/isEmpty');

const {
  ATTRIB_CWF,
} = require('../constants');

/*
 * All components
 */

function _preProcessAllComponents(node, context) {
  const element = node;

  // We do this since element.attribs is undefined if it does not exist
  element.attribs = element.attribs || {};

  element.attribs[ATTRIB_CWF] = path.resolve(context.cwf);
}

/*
 * Common panel and include helper functions
 */

function _getBoilerplateFilePath(node, config, filePath) {
  const element = node;

  const isBoilerplate = _.has(element.attribs, 'boilerplate');
  if (isBoilerplate) {
    element.attribs.boilerplate = element.attribs.boilerplate || path.basename(filePath);

    return urlUtils.calculateBoilerplateFilePath(element.attribs.boilerplate, filePath, config);
  }

  return undefined;
}

/**
 * Returns either an empty or error node depending on whether the file specified exists
 * and whether this file is optional if not.
 */
function _getFileExistsNode(element, context, config, parser, actualFilePath, isOptional = false) {
  if (!utils.fileExists(actualFilePath)) {
    if (isOptional) {
      return utils.createEmptyNode();
    }

    parser.missingIncludeSrc.push({ from: context.cwf, to: actualFilePath });
    const error = new Error(
      `No such file: ${actualFilePath}\nMissing reference in ${element.attribs[ATTRIB_CWF]}`);
    logger.error(error);

    return utils.createErrorNode(element, error);
  }

  return false;
}

/**
 * Retrieves several flags and file paths from the src attribute specified in the element.
 */
function _getSrcFlagsAndFilePaths(element, context, config) {
  const isUrl = utils.isUrl(element.attribs.src);

  // We do this even if the src is not a url to get the hash, if any
  const includeSrc = url.parse(element.attribs.src);

  let filePath;
  if (isUrl) {
    filePath = element.attribs.src;
  } else {
    const includePath = decodeURIComponent(includeSrc.path);

    if (path.posix.isAbsolute(includePath)) {
      /*
       If the src starts with the baseUrl (or simply '/' if there is no baseUrl specified),
       get the relative path from the rootPath first,
       then use it to resolve the absolute path of the referenced file on the filesystem.
       */
      const relativePathToFile = path.posix.relative(`${config.baseUrl}/`, includePath);
      filePath = path.resolve(config.rootPath, relativePathToFile);
    } else {
      filePath = path.resolve(path.dirname(context.cwf), includePath);
    }
  }

  const boilerplateFilePath = _getBoilerplateFilePath(element, config, filePath);
  const actualFilePath = boilerplateFilePath || filePath;

  return {
    isUrl,
    hash: includeSrc.hash,
    filePath,
    actualFilePath,
  };
}

/*
 * Panels
 */

/**
 * PreProcesses panels with a src attribute specified.
 * Replaces the panel with an error node if the src is invalid.
 * Otherwise, sets the fragment attribute of the panel as parsed from the src,
 * and adds the appropriate include.
 */
function _preProcessPanel(node, context, config, parser) {
  const hasSrc = _.has(node.attribs, 'src');
  if (!hasSrc) {
    if (node.children && node.children.length > 0) {
      // eslint-disable-next-line no-use-before-define
      node.children = node.children.map(e => preProcessComponent(e, context, config, parser));
    }

    return node;
  }

  const {
    isUrl,
    hash,
    filePath,
    actualFilePath,
  } = _getSrcFlagsAndFilePaths(node, context, config);

  const fileExistsNode = _getFileExistsNode(node, context, config, parser, actualFilePath);
  if (fileExistsNode) {
    return fileExistsNode;
  }

  if (!isUrl && hash) {
    node.attribs.fragment = hash.substring(1);
  }

  const { fragment } = node.attribs;
  const relativePath = utils.setExtension(path.relative(config.rootPath, filePath), '._include_.html');
  const fullResourcePath = path.posix.join(`${config.baseUrl}/`, utils.ensurePosix(relativePath));
  node.attribs.src = fragment ? `${fullResourcePath}#${fragment}` : fullResourcePath;

  delete node.attribs.boilerplate;

  parser.dynamicIncludeSrc.push({ from: context.cwf, to: actualFilePath, asIfTo: filePath });

  return node;
}

/*
 * Includes
 */

function _deleteIncludeAttributes(node) {
  const element = node;

  // Delete variable attributes in include tags as they are no longer needed
  // e.g. '<include var-title="..." var-xx="..." />'
  Object.keys(element.attribs).forEach((attribute) => {
    if (attribute.startsWith('var-')) {
      delete element.attribs[attribute];
    }
  });

  delete element.attribs.boilerplate;
  delete element.attribs.src;
  delete element.attribs.inline;
  delete element.attribs.trim;
}

/**
 * Check if the current working file's source type is a html file, but the include source is in markdown.
 * Use a special tag to indicate markdown code for parsing later if so,
 * as html files are not passed through markdown-it.
 * @return Whether the include source is in markdown
 */
function _isHtmlIncludingMarkdown(node, context, filePath) {
  const element = node;
  const isIncludeSrcMd = utils.isMarkdownFileExt(utils.getExt(filePath));
  if (isIncludeSrcMd && context.source === 'html') {
    element.name = 'markdown';
  }

  return isIncludeSrcMd;
}

/**
 * PreProcesses includes.
 * Replaces it with an error node if the specified src is invalid,
 * or an empty node if the src is invalid but optional.
 */
function _preprocessInclude(node, context, config, parser) {
  const element = node;

  if (_.isEmpty(element.attribs.src)) {
    const error = new Error(`Empty src attribute in include in: ${element.attribs[ATTRIB_CWF]}`);
    logger.error(error);
    return utils.createErrorNode(element, error);
  }

  const {
    isUrl,
    hash,
    filePath,
    actualFilePath,
  } = _getSrcFlagsAndFilePaths(element, context, config);

  const isOptional = _.has(element.attribs, 'optional');
  const fileExistsNode = _getFileExistsNode(element, context, config, parser, actualFilePath, isOptional);
  if (fileExistsNode) return fileExistsNode;

  // optional includes of whole files have been handled,
  // but segments still need to be processed further down
  if (isOptional && !hash) {
    delete element.attribs.optional;
  }

  const isInline = _.has(element.attribs, 'inline');
  const isTrim = _.has(element.attribs, 'trim');

  element.name = isInline ? 'span' : 'div';

  // No need to process url contents
  if (isUrl) return element;

  parser.staticIncludeSrc.push({ from: context.cwf, to: actualFilePath });

  const isIncludeSrcMd = _isHtmlIncludingMarkdown(element, context, filePath);

  const { variableProcessor } = config;
  const {
    renderedContent,
    childContext,
  } = variableProcessor.renderIncludeFile(actualFilePath, element, context, filePath);

  _deleteIncludeAttributes(element);

  // Process sources with or without hash, retrieving and appending
  // the appropriate children to a wrapped include element

  let actualContent;

  if (hash) {
    // Keep scripts in the fileContent
    const src = cheerio.parseHTML(renderedContent, true);
    const $ = cheerio.load(src);
    const hashContent = $(hash).html();

    actualContent = (hashContent && isTrim) ? hashContent.trim() : hashContent;

    if (actualContent === null && isOptional) {
      // Use empty content if it is optional
      actualContent = '';
    } else if (actualContent === null) {
      const hashSrcWithoutHash = hash.substring(1);
      const error = new Error(`No such segment '${hashSrcWithoutHash}' in file: ${actualFilePath}\n`
          + `Missing reference in ${element.attribs[ATTRIB_CWF]}`);
      logger.error(error);

      return utils.createErrorNode(element, error);
    }

    // optional includes of segments have now been handled, so delete the attribute
    if (isOptional) delete element.attribs.optional;
  } else {
    actualContent = (renderedContent && isTrim) ? renderedContent.trim() : renderedContent;
  }

  if (isIncludeSrcMd) {
    actualContent = isInline ? actualContent : `\n\n${actualContent}\n`;
  }

  // Flag with a data-included-from flag with the source filePath for calculating
  // the file path of dynamic resources ( images, anchors, plugin sources, etc. ) later
  const wrapperType = isInline ? 'span' : 'div';
  const childrenHtml = `<${wrapperType} data-included-from="${filePath}">${actualContent}</${wrapperType}>`;
  element.children = cheerio.parseHTML(childrenHtml, true);

  if (element.children && element.children.length > 0) {
    childContext.source = isIncludeSrcMd ? 'md' : 'html';
    childContext.callStack.push(context.cwf);

    if (childContext.callStack.length > CyclicReferenceError.MAX_RECURSIVE_DEPTH) {
      const error = new CyclicReferenceError(childContext.callStack);
      logger.error(error);
      return utils.createErrorNode(element, error);
    }

    // eslint-disable-next-line no-use-before-define
    element.children = element.children.map(e => preProcessComponent(e, childContext, config, parser));
  }

  return element;
}

/*
 * Variable and imports
 */

function _preprocessVariables() {
  return utils.createEmptyNode();
}

function _preprocessImports(node, parser) {
  if (node.attribs.from) {
    parser.staticIncludeSrc.push({
      from: node.attribs.cwf,
      to: path.resolve(node.attribs.cwf, node.attribs.from),
    });
  }

  return utils.createEmptyNode();
}

/*
 * Body
 */

function _preprocessBody(node) {
  // eslint-disable-next-line no-console
  console.warn(`<body> tag found in ${node.attribs[ATTRIB_CWF]}. This may cause formatting errors.`);
}

/*
 * API
 */

function preProcessComponent(node, context, config, parser) {
  const element = node;

  _preProcessAllComponents(element, context);

  switch (element.name) {
  case 'panel':
    return _preProcessPanel(element, context, config, parser);
  case 'variable':
    return _preprocessVariables();
  case 'import':
    return _preprocessImports(node, parser);
  case 'include':
    return _preprocessInclude(element, context, config, parser);
  case 'body':
    _preprocessBody(element);
    // eslint-disable-next-line no-fallthrough
  default:
    // preprocess children
    if (element.children && element.children.length > 0) {
      element.children = element.children.map(e => preProcessComponent(e, context, config, parser));
    }
    return element;
  }
}

module.exports = {
  preProcessComponent,
};
