/*
 * https://github.com/vuepress/vuepress-next/tree/main/packages/%40vuepress/markdown/src/plugins/customComponentPlugin
 *
 * The files in this folder, custom-component, are adapted from the above link to fit MarkBind's needs. 
 *
 * It helps us to define Vue custom components (or unknown components) as block or inline elements
 * elements during markdown-it parsing. It also helps us to define special tags to ignore such as
 * <include>, <script>, <style>. 
 */

const markdownIt = require('../../index');

const initCustomComponentHtmlBlockRule = require('./htmlBlockRule');
const htmlInlineRule = require('./htmlInlineRule');

/* 
 * MODIFIED (MarkBind): tweaked customComponentPlugin function and added injectTags function 
 * to accomodate ignoring special tags capability
 */

/**
 * Replacing the default htmlBlock rule to allow using custom components in markdown
 */
function customComponentPlugin(md, tagsToIgnore) {
  const customComponentHtmlBlockRule = initCustomComponentHtmlBlockRule(tagsToIgnore);

  // override default html block ruler
  md.block.ruler.at('html_block', customComponentHtmlBlockRule, {
    alt: ['paragraph', 'reference', 'blockquote'],
  });

  // override default html inline ruler
  md.inline.ruler.at('html_inline', htmlInlineRule);
};

/**
 * Sets up the plugin with the provided tag names to ignore.
 * Replaces any previously injected tags.
 */
function injectTags(tagsToIgnore) {
  markdownIt.use(customComponentPlugin, tagsToIgnore);
}

module.exports = {
  injectTags,
};
