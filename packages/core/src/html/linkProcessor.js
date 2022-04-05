const path = require('path');
const lodashHas = require('lodash/has');
const url = require('url');
const ignore = require('ignore');

const fsUtil = require('../utils/fsUtil');
const logger = require('../utils/logger');
const urlUtil = require('../utils/urlUtil');

const { PluginManager } = require('../plugins/PluginManager');

const pluginTagConfig = PluginManager.tagConfig;

const defaultTagLinkMap = {
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

function hasTagLink(node) {
  return node.name in defaultTagLinkMap || node.name in pluginTagConfig;
}

function getDefaultTagsResourcePath(node) {
  const linkAttribName = defaultTagLinkMap[node.name];
  const resourcePath = node.attribs && node.attribs[linkAttribName];
  return resourcePath;
}

function getResourcePathFromRoot(rootPath, fullResourcePath) {
  return fsUtil.ensurePosix(path.relative(rootPath, fullResourcePath));
}

/**
 * @param {string} resourcePath parsed from the node's relevant attribute
 * @returns {boolean} whether the resourcePath is a valid intra-site link
 */
function isIntraLink(resourcePath) {
  return resourcePath
    && !urlUtil.isUrl(resourcePath)
    && !resourcePath.startsWith('#')
    && !/^(?:mailto:|tel:)/i.test(resourcePath); // mailto/tel links are not relative
}

function _convertRelativeLink(node, cwf, rootPath, baseUrl, resourcePath, linkAttribName) {
  if (!isIntraLink(resourcePath)) {
    return;
  }

  if (path.isAbsolute(resourcePath)) {
    // Do not rewrite.
    return;
  }

  const cwd = path.dirname(cwf);
  const fullResourcePath = path.join(cwd, resourcePath);
  const resourcePathFromRoot = getResourcePathFromRoot(rootPath, fullResourcePath);

  node.attribs[linkAttribName] = path.posix.join(baseUrl || '/', resourcePathFromRoot);
}

/**
 * Converts relative links in elements to absolute ones, prepended by the {@param baseUrl}.
 * This is needed because a relative link may have been from an included file (through <include>, etc.),
 * hence we need to rewrite the link accordingly.
 *
 * TODO allow plugins to tap into this process / extend {@link defaultTagLinkMap}
 *
 * @param {Object<any, any>} node from the dom traversal
 * @param {string} cwf as flagged from {@link NodeProcessor}
 * @param {string} rootPath of the root site
 * @param {string} baseUrl
 */
function convertRelativeLinks(node, cwf, rootPath, baseUrl) {
  if (node.name in defaultTagLinkMap) {
    const resourcePath = getDefaultTagsResourcePath(node);
    const linkAttribName = defaultTagLinkMap[node.name];
    _convertRelativeLink(node, cwf, rootPath, baseUrl, resourcePath, linkAttribName);
  }

  if (node.name in pluginTagConfig && pluginTagConfig[node.name].attributes && node.attribs) {
    pluginTagConfig[node.name].attributes.forEach((attrConfig) => {
      if (attrConfig.isRelative) {
        const resourcePath = node.attribs[attrConfig.name];
        _convertRelativeLink(node, cwf, rootPath, baseUrl, resourcePath, attrConfig.name);
      }
    });
  }
}

function convertMdExtToHtmlExt(node) {
  if (node.name === 'a' && node.attribs && node.attribs.href) {
    const hasNoConvert = lodashHas(node.attribs, 'no-convert');
    if (hasNoConvert) {
      return;
    }

    const { href } = node.attribs;

    if (urlUtil.isUrl(href)) {
      // Not intralink
      return;
    }

    const hrefUrl = url.parse(href);

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

function isValidPageSource(resourcePath, config) {
  const relativeResourcePath = resourcePath.startsWith('/')
    ? resourcePath.substring(1)
    : resourcePath;
  const relativeResourcePathWithNoExt = fsUtil.removeExtensionPosix(relativeResourcePath);
  const isPageSrc = config.addressablePagesSource.includes(relativeResourcePathWithNoExt);
  return isPageSrc;
}

function isValidFileAsset(resourcePath, config) {
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
 * @param {string} resourcePath parsed from the node's relevant attribute
 * @param {string} cwf as flagged from {@link NodePreprocessor}
 * @param {Object<any, any>} config passed for page metadata access
 * @returns {string} these string return values are for unit testing purposes only
 */
function validateIntraLink(resourcePath, cwf, config) {
  if (!isIntraLink(resourcePath)) {
    return 'Not Intralink';
  }

  const err = `You might have an invalid intra-link! Ignore this warning if it was intended.
'${resourcePath}' found in file '${cwf}'`;

  resourcePath = urlUtil.stripBaseUrl(resourcePath, config.baseUrl); // eslint-disable-line no-param-reassign

  const resourcePathUrl = url.parse(resourcePath);
  if (resourcePathUrl.hash) {
    // remove hash portion (if any) in the resourcePath
    resourcePath = resourcePathUrl.path; // eslint-disable-line no-param-reassign
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
 * @param {Object<any, any>} node from the dom traversal
 * @param {string} rootPath site root path to resolve the link from
 * @param {string} baseUrl base url to strip off the link (if any)
 * @param {PageSources} pageSources {@link PageSources} object to add the resolved file path to
 * @returns {string} these string return values are for unit testing purposes only
 */
function collectSource(node, rootPath, baseUrl, pageSources) {
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

module.exports = {
  getDefaultTagsResourcePath,
  hasTagLink,
  convertRelativeLinks,
  convertMdExtToHtmlExt,
  validateIntraLink,
  collectSource,
  isIntraLink,
};
