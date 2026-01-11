const PAGEFIND_INPUT_SELECTOR = '#pagefind-search-input';

// See https://pagefind.app/docs/ui-usage/
export const getPagefindScript = (): string => `
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
    </script>
  `;
