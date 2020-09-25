const path = require('path');
const lodashHas = require('lodash/has');
const utils = require('../utils');

const defaultTagLinkMap = {
  img: 'src',
  pic: 'src',
  thumbnail: 'src',
  a: 'href',
  link: 'href',
};

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
  if (!(node.name in defaultTagLinkMap)) {
    return;
  }

  const linkAttribName = defaultTagLinkMap[node.name];
  const resourcePath = node.attribs && node.attribs[linkAttribName];
  if (!resourcePath) {
    return;
  }

  if (path.isAbsolute(resourcePath) || utils.isUrl(resourcePath) || resourcePath.startsWith('#')) {
    // Do not rewrite.
    return;
  }

  const cwd = path.dirname(cwf);
  const fullResourcePath = path.join(cwd, resourcePath);
  const resourcePathFromRoot = utils.ensurePosix(path.relative(rootPath, fullResourcePath));

  node.attribs[linkAttribName] = path.posix.join(baseUrl || '/', resourcePathFromRoot);
}

function convertMdExtToHtmlExt(node) {
  if (node.attribs && node.attribs.href) {
    const { href } = node.attribs;
    const hasMdExtension = href && href.slice(-3) === '.md';
    const hasNoConvert = lodashHas(node.attribs, 'no-convert');
    if (hasMdExtension && !hasNoConvert) {
      const newHref = `${href.substring(0, href.length - 3)}.html`;
      node.attribs.href = newHref;
    }
  }
}

module.exports = {
  convertRelativeLinks,
  convertMdExtToHtmlExt,
};
