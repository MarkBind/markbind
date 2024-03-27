import cheerio from 'cheerio';
import { PluginContext } from './Plugin';
import { MbNode } from '../utils/node';

const DEFAULT_CDN_ADDRESS = 'https://cdn.jsdelivr.net/npm/pagefind@1.0.4/+esm';

const initPagefind = `
  <script type="module">
    import pagefind from '${DEFAULT_CDN_ADDRESS}';
    const { index } = await pagefind.createIndex({
        keepIndexUrl: true,
        verbose: true,
        logfile: "debug.log"
    });
    const { errors, page_count } = await index.addDirectory({
        path: "_site",
    });
    await index.writeFiles({ outputPath: "_site/pagefind" });
    await pagefind.close();  
  </script>`;

function addPagefindUI(pluginContext: PluginContext) {
  return `
  <link rel="stylesheet" href="/pagefind/pagefind-ui.css">
  <script src="/pagefind/pagefind-ui.js"></script>
  <div id="search"></div>
    <script>
      window.addEventListener('DOMContentLoaded', (event) => {
          new PagefindUI({ element: "#search",  
            showSubResults: true, 
            showImages: false, 
            baseUrl: ${pluginContext.baseUrl},});
    });
    </script>`;
}

export = {
  processNode: (pluginContext: PluginContext, node: MbNode) => {
    const $ = cheerio.load(node);
    $('header').append(addPagefindUI(pluginContext));
  },
  getScripts: () => [initPagefind],
};
