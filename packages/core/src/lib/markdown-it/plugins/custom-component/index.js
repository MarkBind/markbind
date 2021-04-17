/*
 * https://github.com/vuepress/vuepress-next/tree/main/packages/%40vuepress/markdown/src/plugins/customComponentPlugins
 *
 * The files in this folder, custom-component, are adapted from the above link to fit MarkBind's needs. 
 *
 * It helps us to define Vue custom components (or unknown components) as block-level elements during markdown-it parsing.
 */

const customComponentPlugin = require('./customComponentPlugin');

module.exports = customComponentPlugin;
