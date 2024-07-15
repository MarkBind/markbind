import cheerio from 'cheerio';
import { PluginContext, FrontMatter } from './Plugin';
import * as logger from '../utils/logger';

// todo: (gerteck) find a way to import the UI and Script from the working directory.
const DEFAULT_UI = 'https://cdn.jsdelivr.net/npm/@pagefind/default-ui@1.0.4/+esm';

const JS_FILE_NAME = 'pageFindAssets/pagefind-ui.min.js';
const CSS_FILE_NAME = 'pageFindAssets/pagefind-ui.min.css';
const ADDTIONAL_CSS_FILE_NAME = 'pageFindAssets/pagefind-ui-additional.css';
const PAGEFIND_INPUT_SELECTOR = '#pagefind-search-input';

function genScript() {
  logger.info('Generating PageFind script');
  return `
    <script>
      window.addEventListener('DOMContentLoaded', (event) => {
        const searchContainers = document.querySelectorAll('${PAGEFIND_INPUT_SELECTOR}');
        if (searchContainers.length) {
          searchContainers.forEach((container) => {
            new window.PagefindUI({
              element: container,
              showSubResults: true,
              showImages: false,
            });
          });
        }
      });
    </script>`;
}

export = {
  tagConfig: {
    pagefind: {
      isSpecial: true,
    },
  },
  getScripts: () => [`<script src="${JS_FILE_NAME}"></script>`, genScript()],
  getLinks: () => [`<link rel="stylesheet" href="${CSS_FILE_NAME}">`,
    `<link rel="stylesheet" href="${ADDTIONAL_CSS_FILE_NAME}">`],
};
