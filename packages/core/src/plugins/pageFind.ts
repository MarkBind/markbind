import cheerio from 'cheerio';
import { PluginContext } from './Plugin';
import { MbNode } from '../utils/node';

const DEFAULT_CDN_ADDRESS = 'https://cdn.jsdelivr.net/npm/pagefind@1.0.4/lib/index.min.js';

const initPagefind = `
<script>
  window.addEventListener('DOMContentLoaded', (event) => {
    const pagefind = window.pagefind;
    pagefind.createIndex({ keepIndexUrl: true, verbose: true, logfile: "debug.log" })
      .then((index) => {
        index.addDirectory({ path: "_site" })
          .then(({ errors, page_count }) => {
            index.writeFiles({ outputPath: "_site/pagefind" })
              .then(() => {
                pagefind.close();
              });
          });
      });
  });
</script>`;

function addPagefindUI(pluginContext: PluginContext) {
  return `
<link rel="stylesheet" href="${pluginContext.baseUrl}/pagefind/pagefind-ui.css">
<script src="${pluginContext.baseUrl}/pagefind/pagefind-ui.js"></script>
<div id="search"></div>
<script>
  window.addEventListener('DOMContentLoaded', (event) => {
    new window.PagefindUI({
      element: "#search",
      showSubResults: true,
      showImages: false,
      baseUrl: "${pluginContext.baseUrl}",
    });
  });
</script>`;
}

export = {
  processNode: (pluginContext: PluginContext, node: MbNode) => {
    const $ = cheerio.load(node);
    $('header').append(addPagefindUI(pluginContext));
  },
  getScripts: () => [
    `<script src="${DEFAULT_CDN_ADDRESS}"></script>`,
    initPagefind,
  ],
};
