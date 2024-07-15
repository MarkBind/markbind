import cheerio from 'cheerio';
import { PluginContext, FrontMatter } from './Plugin';
import * as logger from '../utils/logger';

// todo: (gerteck) find a way to import the UI and Script from the working directory.
const DEFAULT_UI = 'https://cdn.jsdelivr.net/npm/@pagefind/default-ui@1.0.4/+esm';

function addPagefindUI() {
  logger.info('Adding Pagefind UI');
  return `
    <link rel="stylesheet" href="${DEFAULT_UI}">
    <script src="/pagefind/pagefind-ui.js"></script>
    <div id="search"></div>
    <script>
      window.addEventListener('DOMContentLoaded', (event) => {
        new window.PagefindUI({
          element: "#search",
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

  // Called after the page is rendered
  postRender: (_pluginContext: PluginContext, _frontmatter: FrontMatter, content: string) => {
    const $ = cheerio.load(content);

    // const $pagefind = $('.pagefind');
    // $pagefind.append(addPagefindUI());
    return $.html();
  },
};
