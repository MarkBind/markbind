const cheerio = module.parent.require('cheerio');
const path = require('path');

const TEST_STYLESHEET_FILE = 'testMarkbindPluginStylesheet.css';
const TEST_SCRIPT_FILE = 'testMarkbindPluginScript.js';

module.exports = {
  preRender: (content, pluginContext) =>
    content.replace('Markbind Plugin Pre-render Placeholder', `${pluginContext.pre}`),
  postRender: (content, pluginContext) => {
    const $ = cheerio.load(content);
    $('#test-markbind-plugin').append(`${pluginContext.post}`);
    return $.html();
  },
  getLinks: (content, pluginContext, frontMatter, utils) => [utils.buildStylesheet(TEST_STYLESHEET_FILE)],
  getScripts: (content, pluginContext, frontMatter, utils) => [
    // Explicitly resolve to test absolute file paths
    utils.buildScript(path.resolve(__dirname, TEST_SCRIPT_FILE)),
    '<script>alert("Inline plugin script loaded!")</script>',
  ],
};
