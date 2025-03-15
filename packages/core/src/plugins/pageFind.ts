// todo: Find way to bypass MB's auto changing of the path
// (find a way to import the UI and Script from the working directory.)
const JS_FILE_NAME = 'pageFindAssets/pagefind-ui.min.js';
const CSS_FILE_NAME = 'pageFindAssets/pagefind-ui.min.css';

const PAGEFIND_INPUT_SELECTOR = '#pagefind-search-input';

/**
 * Generates the script to initialize the Default Pagefind UI
 */
function initalizeDefaultPagefindUIScript() {
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

/**
 * Attaches the pagefind search API to the window object
 */
function attachPagefindObjectScript() {
  return `
    <script>
      window.addEventListener('DOMContentLoaded', async (event) => {
        try {
          const pagefind = await import("/pagefind/pagefind.js");
          if (pagefind) {
            window.Pagefind = pagefind;
            await pagefind.options({ bundlePath: "/pagefind" });
          }
        } catch (error) {
          console.error('Error initializing Pagefind:', error);
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
  getScripts: () => [
    `<script src="${JS_FILE_NAME}"></script>`,
    attachPagefindObjectScript(),
    initalizeDefaultPagefindUIScript(),
  ],
  getLinks: () => [
    `<link rel="stylesheet" href="${CSS_FILE_NAME}">`,
    // `<link rel="stylesheet" href="${ADDITIONAL_CSS_FILE_NAME}">`,
  ],
};
