const cheerio = module.parent.require('cheerio');

const TEST_STYLESHEET_FILE = '<link rel="stylesheet" href="testMarkbindPluginStylesheet.css">';
const TEST_SCRIPT_FILE = '<script src="testMarkbindPluginScript.js"></script>';

module.exports = {
  postRender: (pluginContext, frontMatter, content) => {
    const $ = cheerio.load(content);
    $('#test-markbind-plugin').append(`${pluginContext.post}`);
    return $.html();
  },
  getLinks: () => [TEST_STYLESHEET_FILE],
  getScripts: () => [
    // Explicitly resolve to test absolute file paths
    TEST_SCRIPT_FILE,
    '<script>alert("Inline plugin script loaded!")</script>',
  ],
};
