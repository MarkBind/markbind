import cheerio from 'cheerio';

import { PluginContext } from './Plugin';
import { MbNode } from '../utils/node';

const DEFAULT_CDN_ADDRESS = 'https://cdn.jsdelivr.net/npm/pagefind@1.0.4/lib/index.min.js';
const DEFAULT_UI = 'https://cdn.jsdelivr.net/npm/@pagefind/default-ui@1.0.4/+esm';

function addPagefindUI() {
  return `
<link rel="stylesheet" href="${DEFAULT_UI}">
<script src="/pagefind/pagefind-ui.js"></script>
<div id="search"></div>
<script>
  window.addEventListener('DOMContentLoaded', (event) => {
    new window.PagefindUI({
      element: "#search-testtesttest",
      showSubResults: true,
      showImages: false,
    });
  });
</script>`;
}

export = {
  processNode: (pluginContext: PluginContext, node: MbNode) => {
    const $ = cheerio.load(node);
    $('header').append(addPagefindUI());
  },
  getScripts: () => [`<script src='${DEFAULT_CDN_ADDRESS}'></script>`],
};
