const cheerio = module.parent.require('cheerio');

const {
  ALGOLIA_CSS_URL,
  ALGOLIA_JS_URL,
  ALGOLIA_INPUT_SELECTOR,
} = require('../constants');

function buildAlgoliaInitScript(pluginContext) {
  return `<script>
    docsearch({
      apiKey: "${pluginContext.apiKey}",
      indexName: "${pluginContext.indexName}",
      inputSelector: "${ALGOLIA_INPUT_SELECTOR}",
      algoliaOptions: ${JSON.stringify(pluginContext.algoliaOptions || {})},
      debug: ${pluginContext.debug || false},
    });
  </script>`;
}

function addNoIndexClasses(content) {
  const $ = cheerio.load(content);
  const noIndexSelectors = [
    'dropdown',
    'b-modal',
    'panel:not([expanded])',
    'span[data-mb-component-type="popover"] div[data-mb-slot-name="content"]',
    'question div[slot=hint]',
    'question div[slot=answer]',
    'tab:nth-of-type(n+2)',
    'tab-group:not(:first-child)',
  ].join(', ');
  $(noIndexSelectors).addClass('algolia-no-index');
  return $.html();
}

module.exports = {
  getLinks: () => [`<link rel="stylesheet" href="${ALGOLIA_CSS_URL}">`],
  getScripts: pluginContext => [
    `<script src="${ALGOLIA_JS_URL}"></script>`,
    buildAlgoliaInitScript(pluginContext),
  ],
  postRender: (pluginContext, frontMatter, content) => addNoIndexClasses(content),
};
