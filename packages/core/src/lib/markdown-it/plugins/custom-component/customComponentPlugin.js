const customComponentHtmlBlockRule = require('./htmlBlockRule');
const htmlInlineRule = require('./htmlInlineRule');

/**
 * Replacing the default htmlBlock rule to allow using custom components in markdown
 */
const customComponentPlugin = (md) => {
  /*
   * Note that html_block is to be replaced by markdown-it-escape-special-tags.
   * Thus, we have to push a new rule after the original html_block rule instead.
   */
  md.block.ruler.after('html_block', 'custom_component_html_block', customComponentHtmlBlockRule, {
    alt: ['paragraph', 'reference', 'blockquote'],
  })
  // override default html inline ruler
  md.inline.ruler.at('html_inline', htmlInlineRule)
};

module.exports = customComponentPlugin;
