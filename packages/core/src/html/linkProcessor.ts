import path from 'path';
import has from 'lodash/has';
import parse from 'url-parse';
import ignore from 'ignore';

import * as fsUtil from '../utils/fsUtil';
import * as logger from '../utils/logger';
import * as urlUtil from '../utils/urlUtil';

import { PluginManager } from '../plugins/PluginManager';
import type { NodeProcessorConfig } from './NodeProcessor';
import type { PageSources } from '../Page/PageSources';
import { MbNode } from '../utils/node';

const _ = { has };

const pluginTagConfig = PluginManager.tagConfig;

const defaultTagLinkMap: Record<string, string> = {
  img: 'src',
  pic: 'src',
  thumbnail: 'src',
  a: 'href',
  link: 'href',
  include: 'src',
  panel: 'src',
  popover: 'src',
  script: 'src',
};

export function hasTagLink(node: MbNode) {
  return node.name in defaultTagLinkMap || node.name in pluginTagConfig;
}

export function getDefaultTagsResourcePath(node: MbNode) {
  const linkAttribName = defaultTagLinkMap[node.name];
  const resourcePath = node.attribs[linkAttribName];
  return resourcePath;
}

function _getResourcePathFromRoot(rootPath: string, fullResourcePath: string) {
  return fsUtil.ensurePosix(path.relative(rootPath, fullResourcePath));
}

/**
 * @param {string} resourcePath parsed from the node's relevant attribute
 * @returns {boolean} whether the resourcePath is a valid intra-site link
 */
export function isIntraLink(resourcePath: string | undefined): boolean {
  const MAILTO_OR_TEL_REGEX = /^(?:mailto:|tel:)/i;
  return !!resourcePath
    && !urlUtil.isUrl(resourcePath)
    && !resourcePath.startsWith('#')
    && !MAILTO_OR_TEL_REGEX.test(resourcePath);
}

function _convertRelativeLink(node: MbNode, cwf: string, rootPath: string,
                              baseUrl: string, resourcePath: string | undefined, linkAttribName: string) {
  if (!resourcePath || !isIntraLink(resourcePath)) {
    return;
  }

  if (path.isAbsolute(resourcePath)) {
    // Do not rewrite.
    return;
  }

  const cwd = path.dirname(cwf);
  const fullResourcePath = path.join(cwd, resourcePath);
  const resourcePathFromRoot = _getResourcePathFromRoot(rootPath, fullResourcePath);

  node.attribs[linkAttribName] = path.posix.join(baseUrl || '/', resourcePathFromRoot);
}

/**
 * Converts relative links in elements to absolute ones, prepended by the {@param baseUrl}.
 * This is needed because a relative link may have been from an included file (through <include>, etc.),
 * hence we need to rewrite the link accordingly.
 *
 * TODO allow plugins to tap into this process / extend {@link defaultTagLinkMap}
 *
 * @param  node from the dom traversal
 * @param  cwf as flagged from {@link NodeProcessor}
 * @param  rootPath of the root site
 * @param  baseUrl
 */
export function convertRelativeLinks(node: MbNode, cwf: string, rootPath: string, baseUrl: string) {
  if (node.name in defaultTagLinkMap) {
    const resourcePath = getDefaultTagsResourcePath(node);
    const linkAttribName = defaultTagLinkMap[node.name];
    _convertRelativeLink(node, cwf, rootPath, baseUrl, resourcePath, linkAttribName);
  }

  if (node.name in pluginTagConfig && pluginTagConfig[node.name].attributes) {
    pluginTagConfig[node.name].attributes.forEach((attrConfig) => {
      if (attrConfig.isRelative && node.attribs) {
        const resourcePath = node.attribs[attrConfig.name];
        _convertRelativeLink(node, cwf, rootPath, baseUrl, resourcePath, attrConfig.name);
      }
    });
  }
}

export function convertMdExtToHtmlExt(node: MbNode) {
  if (node.name === 'a' && node.attribs.href) {
    const hasNoConvert = _.has(node.attribs, 'no-convert');
    if (hasNoConvert) {
      return;
    }

    const { href } = node.attribs;

    if (urlUtil.isUrl(href)) {
      // Not intralink
      return;
    }

    const hrefUrl = parse(href);

    // get the first instance of URL fragment (first encounter of hash)
    const fragment = hrefUrl.hash === null ? '' : hrefUrl.hash;
    const pathName = hrefUrl.pathname === null ? '' : hrefUrl.pathname;
    const ext = path.posix.extname(pathName);

    const isExtMd = ext === '.md';
    if (!isExtMd) {
      // extension is not .md, we do not need to process the link
      return;
    }

    const pathNameWithoutExt = pathName.substring(0, pathName.length - ext.length);

    const newHref = `${pathNameWithoutExt}.html${fragment}`;
    node.attribs.href = newHref;
  }
}

function isValidPageSource(resourcePath: string, config: NodeProcessorConfig) {
  const relativeResourcePath = resourcePath.startsWith('/')
    ? resourcePath.substring(1)
    : resourcePath;
  const relativeResourcePathWithNoExt = fsUtil.removeExtensionPosix(relativeResourcePath);
  const isPageSrc = config.addressablePagesSource.includes(relativeResourcePathWithNoExt);
  return isPageSrc;
}

function isValidFileAsset(resourcePath: string, config: NodeProcessorConfig) {
  const relativeResourcePath = resourcePath.startsWith('/')
    ? resourcePath.substring(1)
    : resourcePath;
  const fileIgnore = ignore().add(config.ignore);
  if (relativeResourcePath && fileIgnore.ignores(relativeResourcePath)) {
    return true;
  }
  const fullResourcePath = path.join(config.rootPath, relativeResourcePath);
  return fsUtil.fileExists(fullResourcePath);
}

/**
 * Serves as an internal intra-link validator. Checks if the intra-links are valid.
 * If the intra-links are suspected to be invalid, a warning message will be logged.
 *
 * @param  resourcePath parsed from the node's relevant attribute
 * @param  cwf as flagged from {@link NodePreprocessor}
 * @param  config passed for page metadata access
 * @returns  these string return values are for unit testing purposes only
 */
export function validateIntraLink(resourcePath: string, cwf: string, config: NodeProcessorConfig): string {
  if (!isIntraLink(resourcePath)) {
    return 'Not Intralink';
  }

  const err = `You might have an invalid intra-link! Ignore this warning if it was intended.
'${resourcePath}' found in file '${cwf}'`;

  resourcePath = urlUtil.stripBaseUrl(resourcePath, config.baseUrl); // eslint-disable-line no-param-reassign

  const resourcePathUrl = parse(resourcePath);

  if (resourcePathUrl.hash) {
    // remove hash portion (if any) in the resourcePath
    resourcePath = resourcePathUrl.pathname; // eslint-disable-line no-param-reassign
  }

  if (resourcePath.endsWith('/')) {
    // append index.html to e.g. /userGuide/
    const implicitResourcePath = `${resourcePath}index.html`;
    if (!isValidPageSource(implicitResourcePath, config) && !isValidFileAsset(implicitResourcePath, config)) {
      logger.warn(err);
      return 'Intralink ending with "/" is neither a Page Source nor File Asset';
    }
    return 'Intralink ending with "/" is a valid Page Source or File Asset';
  }

  const hasNoFileExtension = path.posix.extname(resourcePath) === '';
  if (hasNoFileExtension) {
    // does not end with '/' and no file ext (e.g. /userGuide)
    const implicitResourcePath = `${resourcePath}/index.html`;
    const asFileAsset = resourcePath;
    if (!isValidPageSource(implicitResourcePath, config) && !isValidFileAsset(implicitResourcePath, config)
      && !isValidFileAsset(asFileAsset, config)) {
      logger.warn(err);
      return 'Intralink with no extension is neither a Page Source nor File Asset';
    }
    return 'Intralink with no extension is a valid Page Source or File Asset';
  }

  const hasHtmlExt = resourcePath.slice(-5) === '.html';
  if (hasHtmlExt) {
    if (!isValidPageSource(resourcePath, config) && !isValidFileAsset(resourcePath, config)) {
      logger.warn(err);
      return 'Intralink with ".html" extension is neither a Page Source nor File Asset';
    }
    return 'Intralink with ".html" extension is a valid Page Source or File Asset';
  }

  // basic asset check
  if (!isValidFileAsset(resourcePath, config)) {
    logger.warn(err);
    return 'Intralink is not a File Asset';
  }
  return 'Intralink is a valid File Asset';
}

/**
 * Resolves and collects source file paths pointed to by attributes in nodes for live reload.
 * Only necessary for plugins for now.
 *
 * @param  node from the dom traversal
 * @param  rootPath site root path to resolve the link from
 * @param  baseUrl base url to strip off the link (if any)
 * @param  pageSources {@link PageSources} object to add the resolved file path to
 * @returns  these string return values are for unit testing purposes only
 */
export function collectSource(node: MbNode, rootPath: string,
                              baseUrl: string, pageSources: PageSources): string | void {
  const tagConfig = pluginTagConfig[node.name];
  if (!tagConfig || !tagConfig.attributes) {
    return;
  }

  tagConfig.attributes.forEach((attrConfig) => {
    if (!attrConfig.isSourceFile) {
      return;
    }

    const sourceFileLink = node.attribs[attrConfig.name];
    if (!sourceFileLink || urlUtil.isUrl(sourceFileLink)) {
      return;
    }

    const linkWithoutBaseUrl = urlUtil.stripBaseUrl(sourceFileLink, baseUrl);
    const linkWithoutLeadingSlash = linkWithoutBaseUrl.startsWith('/')
      ? linkWithoutBaseUrl.substring(1)
      : linkWithoutBaseUrl;

    const fullResourcePath = path.join(rootPath, linkWithoutLeadingSlash);
    pageSources.staticIncludeSrc.push({ to: fullResourcePath });
  });
}
