const cheerio = module.parent.require('cheerio');

const {
  ALGOLIA_CSS_URL,
  ALGOLIA_JS_URL,
  ALGOLIA_INPUT_SELECTOR,
} = require('../constants');

function buildAlgoliaInitScript(pluginContext) {
  return `<script>
    docsearch({
      container: "${ALGOLIA_INPUT_SELECTOR}",
      appId: "${pluginContext.appId}",
      apiKey: "${pluginContext.apiKey}",
      indexName: "${pluginContext.indexName}",
      searchParameters: ${JSON.stringify(pluginContext.searchParameters || {})}
    });
  </script>`;
}

function insertAlgoliaCustomCss() {
  return `<script>
    const fixedHeader = document.querySelector("header[fixed]");
    
    // insert custom css if header is fixed
    if (fixedHeader) {
      const css = \`
        .DocSearch-Modal { 
          margin-top: \${fixedHeader.offsetHeight}px;
        }   
        @media (max-width: 750px) {
          .DocSearch-Dropdown {
            height: calc(100% - \${fixedHeader.offsetHeight}px - 66px);
          }
        }
      \`;

      const style = document.createElement('style');
      style.innerHTML = css;
      document.getElementsByTagName('head')[0].appendChild(style);
    }
  </script>
  `;
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
    insertAlgoliaCustomCss(),
  ],
  postRender: (pluginContext, frontMatter, content) => addNoIndexClasses(content),
};
