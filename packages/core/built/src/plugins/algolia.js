var cheerio = module.parent.require('cheerio');
var _a = require('../constants'), ALGOLIA_CSS_URL = _a.ALGOLIA_CSS_URL, ALGOLIA_JS_URL = _a.ALGOLIA_JS_URL, ALGOLIA_INPUT_SELECTOR = _a.ALGOLIA_INPUT_SELECTOR;
function buildAlgoliaInitScript(pluginContext) {
    return "<script>\n    function initAlgolia() {\n      docsearch({\n        apiKey: \"" + pluginContext.apiKey + "\",\n        indexName: \"" + pluginContext.indexName + "\",\n        inputSelector: \"" + ALGOLIA_INPUT_SELECTOR + "\",\n        algoliaOptions: " + JSON.stringify(pluginContext.algoliaOptions || {}) + ",\n        debug: " + (pluginContext.debug || false) + ",\n      });\n    }\n    MarkBind.afterSetup(initAlgolia);\n  </script>";
}
function addNoIndexClasses(content) {
    var $ = cheerio.load(content);
    var noIndexSelectors = [
        'dropdown',
        'b-modal',
        'panel:not([expanded])',
        'popover div[slot=content]',
        'question div[slot=hint]',
        'question div[slot=answer]',
        'tab:not(:first-child)',
        'tab-group:not(:first-child)',
    ].join(', ');
    $(noIndexSelectors).addClass('algolia-no-index');
    return $.html();
}
module.exports = {
    getLinks: function () { return ["<link rel=\"stylesheet\" href=\"" + ALGOLIA_CSS_URL + "\">"]; },
    getScripts: function (pluginContext) { return [
        "<script src=\"" + ALGOLIA_JS_URL + "\"></script>",
        buildAlgoliaInitScript(pluginContext),
    ]; },
    postRender: function (pluginContext, frontMatter, content) { return addNoIndexClasses(content); },
};
