import cheerio from 'cheerio';
import { PluginContext } from './Plugin';

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
  tagConfig: {
    pagefind: {
      isSpecial: true,
    },
  },
  postRender: (pluginContext: PluginContext, content: string) => {
    const $ = cheerio.load(content);
    $('header').append(addPagefindUI());
  },
};
