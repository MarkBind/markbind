import cheerio from 'cheerio';
import path from 'path';
import parse from 'url-parse';

import has from 'lodash/has';
import isEmpty from 'lodash/isEmpty';
import { createErrorNode, createSlotTemplateNode } from './elements';
import CyclicReferenceError from '../errors/CyclicReferenceError';

import * as fsUtil from '../utils/fsUtil';
import * as logger from '../utils/logger';
import * as urlUtil from '../utils/urlUtil';
import type { Context } from './Context';
import type { PageSources } from '../Page/PageSources';
import type { VariableProcessor } from '../variables/VariableProcessor';
import { MbNode, NodeOrText } from '../utils/node';

require('../patches/htmlparser2');

const _ = { has, isEmpty };

/*
 * Common panel and include helper functions
 */

/**
 * Returns a boolean representing whether the file specified exists.
 */
function _checkAndWarnFileExists(element: MbNode, context: Context, actualFilePath: string,
                                 pageSources: PageSources, isOptional = false) {
  if (!fsUtil.fileExists(actualFilePath)) {
    if (isOptional) {
      return false;
    }

    pageSources.missingIncludeSrc.push({
      from: context.cwf,
      to: actualFilePath,
    });
    const error = new Error(
      `No such file: ${actualFilePath}\nMissing reference in ${context.cwf}`);
    logger.error(error);

    createErrorNode(element, error);
    return false;
  }

  return true;
}

function _getBoilerplateFilePath(element: MbNode, filePath: string, config: Record<string, any>) {
  const isBoilerplate = _.has(element.attribs, 'boilerplate');
  if (isBoilerplate) {
    element.attribs.boilerplate = element.attribs.boilerplate || path.basename(filePath);

    return urlUtil.calculateBoilerplateFilePath(element.attribs.boilerplate, filePath, config);
  }

  return undefined;
}

/**
 * Retrieves several flags and file paths from the src attribute specified in the element.
 */
function _getSrcFlagsAndFilePaths(element: MbNode, config: Record<string, any>) {
  const isUrl = urlUtil.isUrl(element.attribs.src);

  // We do this even if the src is not a url to get the hash, if any
  const includeSrc = parse(element.attribs.src);

  let filePath;
  if (isUrl) {
    filePath = element.attribs.src;
  } else {
    const includePath = decodeURIComponent(includeSrc.pathname).replace(/\\/g, path.sep);

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
export function processPanelSrc(node: MbNode, context: Context, pageSources: PageSources,
                                config: Record<string, any>): Context {
  const hasSrc = _.has(node.attribs, 'src');
  if (!hasSrc) {
    return context;
  }

  const {
    isUrl,
    hash,
    filePath,
    actualFilePath,
    // We can typecast here as we have checked for src above.
  } = _getSrcFlagsAndFilePaths(node, config);

  const fileExists = _checkAndWarnFileExists(node, context, actualFilePath, pageSources);
  if (!fileExists) {
    return context;
  }

  if (!isUrl && hash) {
    node.attribs.fragment = hash.substring(1);
  }

  const { fragment } = node.attribs;
  const relativePath = fsUtil.setExtension(path.relative(config.rootPath, filePath), '._include_.html');
  const fullResourcePath = path.posix.join(`${config.baseUrl}/`, fsUtil.ensurePosix(relativePath));
  node.attribs.src = fragment ? `${fullResourcePath}#${fragment}` : fullResourcePath;

  delete node.attribs.boilerplate;

  pageSources.dynamicIncludeSrc.push({
    from: context.cwf,
    to: actualFilePath,
    asIfTo: filePath,
  });

  return context;
}

/*
 * Includes
 */

function _deleteIncludeAttributes(node: MbNode) {
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
export function processInclude(node: MbNode, context: Context, pageSources: PageSources,
                               variableProcessor: VariableProcessor, renderMd: (text: string) => string,
                               renderMdInline: (text: string) => string,
                               config: Record<string, any>): Context {
  if (_.isEmpty(node.attribs.src)) {
    const error = new Error(`Empty src attribute in include in: ${context.cwf}`);
    logger.error(error);
    cheerio(node).replaceWith(createErrorNode(node, error));
    return context;
  }

  const {
    isUrl,
    hash,
    filePath,
    actualFilePath,
    // We can typecast here as we have checked for src above.
  } = _getSrcFlagsAndFilePaths(node, config);

  // No need to process url contents
  if (isUrl) {
    _deleteIncludeAttributes(node);
    return context;
  }

  const isOptional = _.has(node.attribs, 'optional');
  const fileExists = _checkAndWarnFileExists(node, context, actualFilePath, pageSources, isOptional);
  if (!fileExists) {
    return context;
  }

  const isInline = _.has(node.attribs, 'inline');
  const isTrim = _.has(node.attribs, 'trim');
  const shouldOmitFrontmatter = _.has(node.attribs, 'omitFrontmatter');

  node.name = isInline ? 'span' : 'div';

  pageSources.staticIncludeSrc.push({
    from: context.cwf,
    to: actualFilePath,
  });

  const {
    nunjucksProcessed,
    childContext,
  } = variableProcessor.renderIncludeFile(actualFilePath, pageSources, node, context, filePath);

  let actualContent = nunjucksProcessed;
  if (fsUtil.isMarkdownFileExt(path.extname(actualFilePath))) {
    actualContent = isInline
      ? renderMdInline(actualContent)
      : renderMd(actualContent);
  }

  // Process sources with or without hash, retrieving and appending
  // the appropriate children to a wrapped include element
  if (hash) {
    const $ = cheerio.load(actualContent);
    const actualContentOrNull = $(hash).html();
    actualContent = actualContentOrNull || '';

    if (actualContentOrNull === null && !isOptional) {
      const error = new Error(`No such segment '${hash}' in file: ${actualFilePath}\n`
       + `Missing reference in ${context.cwf}`);
      logger.error(error);

      actualContent = cheerio.html(createErrorNode(node, error));
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
      cheerio(node).replaceWith(createErrorNode(node, error));
      return context;
    }
  }

  _deleteIncludeAttributes(node);

  return childContext;
}

/**
 * PreProcesses popovers with the src attribute.
 * Replaces it with an error node if the specified src is invalid.
 * Else, appends the content to the node.
 */
export function processPopoverSrc(node: MbNode, context: Context, pageSources: PageSources,
                                  variableProcessor: VariableProcessor, renderMd: (text: string) => string,
                                  config: Record<string, any>): Context {
  if (!_.has(node.attribs, 'src')) {
    return context;
  }

  if (_.isEmpty(node.attribs.src)) {
    const error = new Error(`Empty src attribute in include in: ${context.cwf}`);
    logger.error(error);
    cheerio(node).replaceWith(createErrorNode(node, error));
    return context;
  }

  const {
    isUrl,
    hash,
    filePath,
    actualFilePath,
    // We can typecast here as we have checked for src above.
  } = _getSrcFlagsAndFilePaths(node, config);

  // No need to process url contents
  if (isUrl) {
    const error = new Error('URLs are not allowed in the \'src\' attribute');
    logger.error(error);
    cheerio(node).replaceWith(createErrorNode(node, error));
    return context;
  }

  const fileExists = _checkAndWarnFileExists(node, context, actualFilePath, pageSources);
  if (!fileExists) {
    return context;
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
  if (fsUtil.isMarkdownFileExt(path.extname(actualFilePath))) {
    actualContent = renderMd(actualContent);
  }

  // Process sources with or without hash, retrieving and appending
  // the appropriate children to a wrapped include element
  if (hash) {
    const $ = cheerio.load(actualContent);
    actualContent = $(hash).html() || '';

    if (actualContent === '') {
      const error = new Error(`No such segment '${hash}' in file: ${actualFilePath}\n`
        + `Missing reference in ${context.cwf}`);
      logger.error(error);

      cheerio(node).replaceWith(createErrorNode(node, error));

      return context;
    }
  }

  actualContent = actualContent.trim();

  if (node.children.length > 0) {
    childContext.addCwfToCallstack(context.cwf);

    if (childContext.hasExceededMaxCallstackSize()) {
      const error = new CyclicReferenceError(childContext.callStack);
      logger.error(error);
      cheerio(node).replaceWith(createErrorNode(node, error));
      return context;
    }
  }

  const attributeSlotElement: NodeOrText[] = createSlotTemplateNode('content', actualContent);
  node.children = node.children ? attributeSlotElement.concat(node.children) : attributeSlotElement;

  delete node.attribs.src;

  return childContext;
}
