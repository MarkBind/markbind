const ALGOLIA_CSS_URL =
  'https://cdn.jsdelivr.net/npm/docsearch.js@2/dist/cdn/docsearch.min.css';
const ALGOLIA_JS_URL =
  'https://cdn.jsdelivr.net/npm/docsearch.js@2/dist/cdn/docsearch.min.js';
const ALGOLIA_INPUT_SELECTOR = '#algolia-search-input';

function buildAlgoliaInitScript(pluginContext) {
  return `<script>
    function initAlgolia() {
      docsearch({
        apiKey: "${pluginContext.apiKey}",
        indexName: "${pluginContext.indexName}",
        inputSelector: "${ALGOLIA_INPUT_SELECTOR}",
        algoliaOptions: ${JSON.stringify(pluginContext.algoliaOptions || {})},
        debug: ${pluginContext.debug || false},
      });
    }
    MarkBind.afterSetup(initAlgolia);
  </script>`;
}

module.exports = {
  getLinks: (content, pluginContext, frontMatter, utils) => [
    utils.buildStylesheet(ALGOLIA_CSS_URL),
  ],
  getScripts: (content, pluginContext, frontMatter, utils) => [
    utils.buildScript(ALGOLIA_JS_URL),
    buildAlgoliaInitScript(pluginContext),
  ],
};
