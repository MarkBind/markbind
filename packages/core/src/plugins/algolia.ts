import cheerio from 'cheerio';
import { FrontMatter, PluginContext } from './Plugin';

const ALGOLIA_CSS_URL = 'https://cdn.jsdelivr.net/npm/@docsearch/css@3.2.0/dist/style.css';
const ALGOLIA_JS_URL = 'https://cdn.jsdelivr.net/npm/@docsearch/js@3.2.0/dist/umd/index.js';
const ALGOLIA_INPUT_SELECTOR = '#algolia-search-input';

function buildAlgoliaInitScript(pluginContext: PluginContext) {
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
    const style = document.createElement('style');
    style.innerHTML = ".DocSearch-Container { z-index: 1002; position: fixed; }";
    document.getElementsByTagName('head')[0].appendChild(style);
  </script>
  `;
}

function addNoIndexClasses(content: string) {
  const $ = cheerio.load(content);
  const noIndexSelectors = [
    'dropdown',
    'modal',
    'panel:not([expanded])',
    'question template[\\#hint] div',
    'question template[\\#answer] div',
    'tab:nth-of-type(n+2)',
    'tab-group:nth-of-type(n+2)',
  ].join(', ');
  $(noIndexSelectors).addClass('algolia-no-index');
  return $.html();
}

export = {
  getLinks: () => [`<link rel="stylesheet" href="${ALGOLIA_CSS_URL}">`],
  getScripts: (pluginContext: PluginContext) => [
    `<script src="${ALGOLIA_JS_URL}"></script>`,
    buildAlgoliaInitScript(pluginContext),
    insertAlgoliaCustomCss(),
  ],
  postRender: (_pluginContext: PluginContext,
               _frontmatter: FrontMatter, content: string) => addNoIndexClasses(content),
};
