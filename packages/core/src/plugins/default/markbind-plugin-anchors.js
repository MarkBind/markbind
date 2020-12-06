const cheerio = module.parent.require('cheerio');

const CSS_FILE_NAME = 'markbind-plugin-anchors.css';

const HEADER_REGEX = new RegExp('^h[1-6]$');

/**
 * Adds anchor links to headers
 */
module.exports = {
  getLinks: () => [`<link rel="stylesheet" href="${CSS_FILE_NAME}">`],
  processNode: (pluginContext, node) => {
    if (HEADER_REGEX.test(node.name) && node.attribs.id) {
      cheerio(node).append(
        `<a class="fa fa-anchor" href="#${node.attribs.id}" onclick="event.stopPropagation()"></a>`);
    }
  },
};
