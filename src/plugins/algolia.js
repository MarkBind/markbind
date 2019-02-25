const ALGOLIA_CSS_URL = 'https://cdn.jsdelivr.net/npm/docsearch.js@2/dist/cdn/docsearch.min.css';
const ALGOLIA_JS_URL = 'https://cdn.jsdelivr.net/npm/docsearch.js@2/dist/cdn/docsearch.min.js';
const ALGOLIA_INPUT_SELECTOR = '#algolia-search-input';

function buildAlgoliaInitScript(apiKey, indexName) {
  return `<script>
    function initAlgolia() {
      docsearch({
        apiKey: "${apiKey}",
        indexName: "${indexName}",
        inputSelector: "${ALGOLIA_INPUT_SELECTOR}"
      });
    }
    MarkBind.afterSetup(initAlgolia);
  </script>`;
}

module.exports = {
  getLinks: (content, pluginContext, frontMatter, utils) => [utils.buildStylesheet(ALGOLIA_CSS_URL)],
  getScripts: (content, pluginContext, frontMatter, utils) =>
    [
      utils.buildScript(ALGOLIA_JS_URL),
      buildAlgoliaInitScript(pluginContext.apiKey, pluginContext.indexName),
    ],
};
