const path = require('path');
const lodashHas = require('lodash/has');
const url = require('url');
const ignore = require('ignore');
const utils = require('../utils');
const logger = require('../utils/logger');

const defaultTagLinkMap = {
  img: 'src',
  pic: 'src',
  thumbnail: 'src',
  a: 'href',
  link: 'href',
};

function hasTagLink(node) {
  return node.name in defaultTagLinkMap;
}

function getResourcePath(node) {
  const linkAttribName = defaultTagLinkMap[node.name];
  const resourcePath = node.attribs && node.attribs[linkAttribName];
  return resourcePath;
}

function getResourcePathFromRoot(rootPath, fullResourcePath) {
  return utils.ensurePosix(path.relative(rootPath, fullResourcePath));
}

/**
 * Converts relative links in elements to absolute ones, prepended by the {@param baseUrl}.
 * This is needed because a relative link may have been from an included file (through <include>, etc.),
 * hence we need to rewrite the link accordingly.
 *
 * TODO allow plugins to tap into this process / extend {@link defaultTagLinkMap}
 *
 * @param {Object<any, any>} node from the dom traversal
 * @param {string} cwf as flagged from {@link ComponentPreprocessor}
 * @param {string} rootPath of the root site
 * @param {string} baseUrl
 */
function convertRelativeLinks(node, cwf, rootPath, baseUrl) {
  const resourcePath = getResourcePath(node);
  if (!resourcePath) {
    return;
  }
  if (path.isAbsolute(resourcePath) || utils.isUrl(resourcePath) || resourcePath.startsWith('#')) {
    // Do not rewrite.
    return;
  }

  const cwd = path.dirname(cwf);
  const fullResourcePath = path.join(cwd, resourcePath);
  const resourcePathFromRoot = getResourcePathFromRoot(rootPath, fullResourcePath);

  const linkAttribName = defaultTagLinkMap[node.name];
  node.attribs[linkAttribName] = path.posix.join(baseUrl || '/', resourcePathFromRoot);
}

function convertMdAndMbdExtToHtmlExt(node) {
  if (node.name === 'a' && node.attribs && node.attribs.href) {
    const hasNoConvert = lodashHas(node.attribs, 'no-convert');
    if (hasNoConvert) {
      return;
    }
    const { href } = node.attribs;
    const hasMdExtension = href.slice(-3) === '.md';
    if (hasMdExtension) {
      const newHref = `${href.substring(0, href.length - 3)}.html`;
      node.attribs.href = newHref;
      return;
    }
    const hasMbdExtension = href.slice(-4) === '.mbd';
    if (hasMbdExtension) {
      const newHref = `${href.substring(0, href.length - 4)}.html`;
      node.attribs.href = newHref;
    }
  }
}

function isValidPageSource(resourcePath, config) {
  const relativeResourcePath = resourcePath.startsWith('/')
    ? resourcePath.substring(1)
    : resourcePath;
  const parsedPath = path.parse(relativeResourcePath);
  const relativeResourcePathWithNoExt = parsedPath.dir
    ? `${parsedPath.dir}/${parsedPath.name}`
    : parsedPath.name;
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
  return utils.fileExists(fullResourcePath);
}

/**
 * Serves as an internal intra-link validator. Checks if the intra-links are valid.
 * If the intra-links are not suspected to not be valid, a warning message will be logged.
 *
 * @param {Object<any, any>} node from the dom traversal
 * @param {string} cwf as flagged from {@link ComponentPreprocessor}
 * @param {Object<any, any>} page config passed for page metadata access
 * @returns {string} these string return values are for unit testing purposes only
 */
function validateIntraLink(node, cwf, config) {
  let resourcePath = getResourcePath(node);
  if (!resourcePath || utils.isUrl(resourcePath) || resourcePath.startsWith('#')) {
    return 'Not Intralink';
  }

  const err = `You might have an invalid intra-link! Ignore this warning if it was intended.
'${resourcePath}' found in file '${cwf}'`;

  if (resourcePath.startsWith(config.baseUrl)) {
    // strip baseUrl from resourcePath
    resourcePath = resourcePath.substring(config.baseUrl.length);
  }

  const resourcePathUrl = url.parse(resourcePath);
  if (resourcePathUrl.hash) {
    // remove hash portion (if any) in the resourcePath
    resourcePath = resourcePathUrl.path;
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

module.exports = {
  hasTagLink,
  convertRelativeLinks,
  convertMdAndMbdExtToHtmlExt,
  validateIntraLink,
};
