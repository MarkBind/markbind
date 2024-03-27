import cheerio from 'cheerio';
import { PluginContext } from './Plugin';
import { MbNode } from '../utils/node';

const DEFAULT_CDN_ADDRESS = 'https://cdn.jsdelivr.net/npm/pagefind@1.0.4/lib/index.min.js';

async function initPagefind() {
  const { default: pagefind } = await import(DEFAULT_CDN_ADDRESS);
  const { index } = await pagefind.createIndex({
    keepIndexUrl: true,
    verbose: true,
    logfile: 'debug.log',
  });
  await index.addDirectory({ path: '_site' });
  await index.writeFiles({ outputPath: '_site/pagefind' }).then(() => { pagefind.close(); });
}

function addPagefindUI(pluginContext: PluginContext) {
  return `
<link rel="stylesheet" href="/pagefind/pagefind-ui.css">
<script src="/pagefind/pagefind-ui.js"></script>
<div id="search"></div>
<script>
  window.addEventListener('DOMContentLoaded', (event) => {
    new window.PagefindUI({
      element: "#search-testtesttest",
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
  postRender: () => { initPagefind(); },
};
