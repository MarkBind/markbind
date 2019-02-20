const AGOLIA_CSS_URL = 'https://cdn.jsdelivr.net/npm/docsearch.js@2/dist/cdn/docsearch.min.css';
const AGOLIA_JS_URL = 'https://cdn.jsdelivr.net/npm/docsearch.js@2/dist/cdn/docsearch.min.js';
const AGOLIA_INPUT_SELECTOR = '#agolia-search-input';

function getAgoliaInitScript(apiKey, indexName) {
  return `<script>
    function initAgolia() {
      docsearch({
        apiKey: "${apiKey}",
        indexName: "${indexName}",
        inputSelector: "${AGOLIA_INPUT_SELECTOR}"
      });
    }
    MarkBind.afterSetup(initAgolia);
  </script>`;
}

module.exports = {
  getLinks: (content, pluginContext, frontMatter, utils) => [utils.buildStylesheet(AGOLIA_CSS_URL)],
  getScripts: (content, pluginContext, frontMatter, utils) =>
    [utils.buildScript(AGOLIA_JS_URL), getAgoliaInitScript(pluginContext.apiKey, pluginContext.indexName)],
};
