const cheerio = module.parent.require('cheerio');

const {
  ALGOLIA_CSS_URL,
  ALGOLIA_JS_URL,
  ALGOLIA_INPUT_SELECTOR,
} = require('../constants');

function buildAlgoliaInitScript(pluginContext) {
  return `<script>
    docsearch(
      ${JSON.stringify({ container: ALGOLIA_INPUT_SELECTOR, ...pluginContext })}
    );
  </script>`;
}

function addNoIndexClasses(content) {
  const $ = cheerio.load(content);
  const noIndexSelectors = [
    'dropdown',
    'b-modal',
    'panel:not([expanded])',
    // to target both popover and tooltip
    '[data-mb-component-type] [data-mb-slot-name]',
    'question template[\\#hint] div',
    'question template[\\#answer] div',
    'tab:nth-of-type(n+2)',
    'tab-group:nth-of-type(n+2)',
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
