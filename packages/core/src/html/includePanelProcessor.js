const cheerio = require('cheerio'); require('../patches/htmlparser2');
const path = require('path');
const url = require('url');
const logger = require('../utils/logger');

const { CyclicReferenceError } = require('../errors');

const utils = require('../utils');
const urlUtils = require('../utils/urls');

const _ = {};
_.has = require('lodash/has');
_.isEmpty = require('lodash/isEmpty');

/*
 * Common panel and include helper functions
 */

/**
 * Returns either an empty or error node depending on whether the file specified exists
 * and whether this file is optional if not.
 */
function _getFileExistsNode(element, context, actualFilePath, pageSources, isOptional = false) {
  if (!utils.fileExists(actualFilePath)) {
    if (isOptional) {
      return utils.createEmptyNode();
    }

    pageSources.missingIncludeSrc.push({
      from: context.cwf,
      to: actualFilePath,
    });
    const error = new Error(
      `No such file: ${actualFilePath}\nMissing reference in ${context.cwf}`);
    logger.error(error);

    return utils.createErrorNode(element, error);
  }

  return false;
}

function _getBoilerplateFilePath(node, filePath, config) {
  const element = node;

  const isBoilerplate = _.has(element.attribs, 'boilerplate');
  if (isBoilerplate) {
    element.attribs.boilerplate = element.attribs.boilerplate || path.basename(filePath);

    return urlUtils.calculateBoilerplateFilePath(element.attribs.boilerplate, filePath, config);
  }

  return undefined;
}

/**
 * Retrieves several flags and file paths from the src attribute specified in the element.
 */
function _getSrcFlagsAndFilePaths(element, config) {
  const isUrl = utils.isUrl(element.attribs.src);

  // We do this even if the src is not a url to get the hash, if any
  const includeSrc = url.parse(element.attribs.src);

  let filePath;
  if (isUrl) {
    filePath = element.attribs.src;
  } else {
    const includePath = decodeURIComponent(includeSrc.path);

    /*
     If the src starts with the baseUrl (or simply '/' if there is no baseUrl specified),
     get the relative path from the rootPath first,
     then use it to resolve the absolute path of the referenced file on the filesystem.
     */
    const relativePathToFile = path.posix.relative(`${config.baseUrl}/`, includePath);
    filePath = path.resolve(config.rootPath, relativePathToFile);
  }

  const boilerplateFilePath = _getBoilerplateFilePath(element, filePath, config);
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
function processPanelSrc(node, context, pageSources, config) {
  const hasSrc = _.has(node.attribs, 'src');
  if (!hasSrc) {
    return context;
  }

  const {
    isUrl,
    hash,
    filePath,
    actualFilePath,
  } = _getSrcFlagsAndFilePaths(node, config);

  const fileExistsNode = _getFileExistsNode(node, context, actualFilePath, pageSources);
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

  pageSources.dynamicIncludeSrc.push({
    from: context.cwf,
    to: actualFilePath,
    asIfTo: filePath,
  });

  return node;
}

/*
 * Includes
 */

function _deleteIncludeAttributes(node) {
  // Delete variable attributes in include tags as they are no longer needed
  // e.g. '<include var-title="..." var-xx="..." />'
  Object.keys(node.attribs).forEach((attribute) => {
    if (attribute.startsWith('var-')) {
      delete node.attribs[attribute];
    }
  });

  delete node.attribs.boilerplate;
  delete node.attribs.src;
  delete node.attribs.inline;
  delete node.attribs.trim;
  delete node.attribs.optional;
  delete node.attribs.omitFrontmatter;
}

/**
 * PreProcesses includes.
 * Replaces it with an error node if the specified src is invalid,
 * or an empty node if the src is invalid but optional.
 */
function processInclude(node, context, pageSources, variableProcessor, renderMd, renderMdInline, config) {
  if (_.isEmpty(node.attribs.src)) {
    const error = new Error(`Empty src attribute in include in: ${context.cwf}`);
    logger.error(error);
    cheerio(node).replaceWith(utils.createErrorNode(node, error));
  }

  const {
    isUrl,
    hash,
    filePath,
    actualFilePath,
  } = _getSrcFlagsAndFilePaths(node, config);

  const isOptional = _.has(node.attribs, 'optional');
  const fileExistsNode = _getFileExistsNode(node, context, actualFilePath, pageSources, isOptional);
  if (fileExistsNode) {
    return fileExistsNode;
  }

  const isInline = _.has(node.attribs, 'inline');
  const isTrim = _.has(node.attribs, 'trim');
  const shouldOmitFrontmatter = _.has(node.attribs, 'omitFrontmatter');

  node.name = isInline ? 'span' : 'div';

  // No need to process url contents
  if (isUrl) {
    _deleteIncludeAttributes(node);
    return node;
  }

  pageSources.staticIncludeSrc.push({
    from: context.cwf,
    to: actualFilePath,
  });

  const {
    nunjucksProcessed,
    childContext,
  } = variableProcessor.renderIncludeFile(actualFilePath, pageSources, node, context, filePath);

  let actualContent = nunjucksProcessed;
  if (utils.isMarkdownFileExt(utils.getExt(actualFilePath))) {
    actualContent = isInline
      ? renderMdInline(actualContent)
      : renderMd(actualContent);
  }

  // Process sources with or without hash, retrieving and appending
  // the appropriate children to a wrapped include element
  if (hash) {
    const $ = cheerio.load(actualContent);
    actualContent = $(hash).html();

    if (actualContent === null) {
      actualContent = '';

      if (!isOptional) {
        const error = new Error(`No such segment '${hash}' in file: ${actualFilePath}\n`
          + `Missing reference in ${context.cwf}`);
        logger.error(error);

        actualContent = cheerio.html(utils.createErrorNode(node, error));
      }
    }
  }

  if (isTrim) {
    actualContent = actualContent.trim();
  }

  const $includeEl = cheerio(node);
  $includeEl.empty();
  $includeEl.append(actualContent);

  if (node.children && node.children.length > 0) {
    childContext.addCwfToCallstack(context.cwf);
    childContext.processingOptions.omitFrontmatter = shouldOmitFrontmatter;

    if (childContext.hasExceededMaxCallstackSize()) {
      const error = new CyclicReferenceError(childContext.callStack);
      logger.error(error);
      cheerio(node).replaceWith(utils.createErrorNode(node, error));
    }
  }

  _deleteIncludeAttributes(node);

  return childContext;
}

module.exports = {
  processInclude,
  processPanelSrc,
};
