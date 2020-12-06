/**
 * Converts shorthand syntax to proper Markbind syntax
 * @param content of the page
 */
module.exports = {
  processNode: (pluginContext, node) => {
    // panel>span[heading]
    if (node.name === 'span'
      && node.attribs
      && node.attribs.heading !== undefined
      && node.parent
      && node.parent.name === 'panel') {
      node.attribs.slot = 'header';
      node.attribs.class = node.attribs.class ? `${node.attribs.class} card-title` : 'card-title';
      delete node.attribs.heading;
    }
  },
};
