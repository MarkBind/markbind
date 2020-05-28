/**
 * Converts shorthand syntax to proper Markbind syntax
 * @param content of the page
 */
module.exports = {
  preRenderNode: (node) => {
    if (node.name === 'panel' && node.children) {
      node.children.forEach((n) => {
        if (n.name === 'span' && n.attribs.heading !== undefined) {
          n.attribs.slot = 'header';
          n.attribs.class = n.attribs.class ? `${n.attribs.class} card-title` : 'card-title';
          delete n.attribs.heading;
        }
      });
    }

    return node;
  },
};
