const cheerio = module.parent.require('cheerio');

const ALGOLIA_CSS_URL = 'https://cdn.jsdelivr.net/npm/docsearch.js@2/dist/cdn/docsearch.min.css';
const ALGOLIA_JS_URL = 'https://cdn.jsdelivr.net/npm/docsearch.js@2/dist/cdn/docsearch.min.js';
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

function addNoIndexClasses(content) {
  const $ = cheerio.load(content, { xmlMode: false });
  const noIndexSelectors = [
    'dropdown',
    'modal',
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
  getLinks: (content, pluginContext, frontMatter, utils) => [utils.buildStylesheet(ALGOLIA_CSS_URL)],
  getScripts: (content, pluginContext, frontMatter, utils) =>
    [utils.buildScript(ALGOLIA_JS_URL), buildAlgoliaInitScript(pluginContext)],
  postRender: content => addNoIndexClasses(content),
};
