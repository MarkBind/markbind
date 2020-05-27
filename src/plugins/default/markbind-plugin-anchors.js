const cheerio = module.parent.require('cheerio');

const CSS_FILE_NAME = 'markbind-plugin-anchors.css';

const HEADING_PATTERN = new RegExp('^h[1-6]$');

/**
 * Adds anchor links to headers
 */
module.exports = {
  getLinks: (content, pluginContext, frontMatter, utils) => [utils.buildStylesheet(CSS_FILE_NAME)],
  postRenderNode: (node) => {
    if (HEADING_PATTERN.test(node.name) && node.attribs.id) {
      const anchorElement = cheerio.parseHTML(
        `<a class="fa fa-anchor" href="#${node.attribs.id}" onclick="event.stopPropagation()"></a>`,
      );
      node.children = [...node.children, ...anchorElement];
    }
    return node;
  },
};
