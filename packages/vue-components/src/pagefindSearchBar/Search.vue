<script setup>
/* eslint-disable import/no-extraneous-dependencies */
import {
  ref, onMounted, nextTick, watch,
} from 'vue';
import LogoPagefind from './LogoPagefind.vue';

const showModal = ref(false);

const toggleSearch = () => {
  showModal.value = !showModal.value;
};

watch(showModal, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      if (window.PagefindUI) {
        // eslint-disable-next-line no-unused-vars
        const pagefind = new window.PagefindUI({
          element: '#pagefind-search-input',
          showSubResults: true,
          resetFilters: true,
          showImages: false,
          // Pagefind UI default styles will be applied here
          processResult: (result) => {
          // Remove the '/markbind' prefixt
            if (result.url.startsWith('/markbind/')) {
              result.url = result.url.substring(9);
            }
            // Also process subresults (headings within the page)
            if (result.sub_results && Array.isArray(result.sub_results)) {
              result.sub_results.forEach((subResult) => {
                if (subResult.url.startsWith('/markbind/')) {
                  subResult.url = subResult.url.substring(9);
                }
              });
            }
            return result;
          },
        });

        // Focus the input inside the new structure
        const input = document.querySelector('#pagefind-search-input input');
        if (input) {
          input.focus();
        }

        // Fix for Redirection & Modal Closing:
        // We listen for clicks on the results. If a result is clicked,
        // we close the modal. This is especially important for anchors (#).
        const container = document.querySelector('#pagefind-search-input');
        container.addEventListener('click', (e) => {
          const anchor = e.target.closest('a');
          if (anchor) {
            // Close the modal before the browser navigates
            showModal.value = false;
          }
        });
      }
    });
  }
});

const metaKey = ref('');
onMounted(() => {
  metaKey.value = /(Mac|iPhone|iPod|iPad)/i.test(navigator?.platform)
    ? '⌘'
    : 'Ctrl';

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      toggleSearch();
    }
    if (e.key === 'Escape' && showModal.value) {
      showModal.value = false;
    }
  });
});
</script>

<template>
  <div class="blog-search">
    <div class="nav-search-btn-wait" @click="showModal = true">
      <span class="search-icon">
        <svg
          width="14"
          height="14"
          viewBox="0 0 20 20"
        >
          <path
            d="M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115
            2.9419-10.65330-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419
            7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z"
            stroke="currentColor"
            fill="none"
            fill-rule="evenodd"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
      <span class="search-tip">Search</span>
      <span class="metaKey">{{ metaKey }} K</span>
    </div>

    <div
      v-if="showModal"
      class="algolia"
      @click.self="showModal = false"
    >
      <div command-dialog-mask>
        <div command-dialog-wrapper class="search-modal">
          <div command-dialog-header class="search-header">
            <div class="search-bar">
              <div id="pagefind-search-input"></div>
            </div>
          </div>

          <div command-dialog-footer>
            <div class="command-palette-logo">
              <a href="https://github.com/cloudcannon/pagefind" target="_blank">
                <span class="command-palette-Label">Search by</span>
                <LogoPagefind style="width: 77px" />
              </a>
            </div>
            <ul class="command-palette-commands">
              <li>
                <kbd class="command-palette-commands-key">↵</kbd>
                <span class="command-palette-Label">to select</span>
              </li>
              <li>
                <kbd class="command-palette-commands-key">esc</kbd>
                <span class="command-palette-Label">to close</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Inject the variables and layout styles from sugar-blog */
.blog-search {
  display: flex;
}

.nav-search-btn-wait {
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0 12px;
  height: 40px;
  background-color: var(--mb-bg-alt, #fff);
  color: #212529;
  border-radius: 10px;
  border: 1px solid #ced4da;
  transition: border 0.2s;
}

.nav-search-btn-wait:hover {
  border-color: var(--vcp-c-brand, #5468ff);
}

.metaKey {
  margin-left: 10px;
  font-size: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 0 6px;
}

/* Pagefind UI Override to match the clean 'Algolia' input look */
#pagefind-search-input :deep(.pagefind-ui__search-input) {
  border: none !important;
  background: transparent !important;
  font-size: 18px !important;
}

#pagefind-search-input :deep(.pagefind-ui__search-clear) {
  display: none; /* We use the sugar-blog style spacing instead */
}

/* Align the list with the sugar-blog container */
#pagefind-search-input :deep(.pagefind-ui__drawer) {
  max-height: 360px;
  overflow-y: auto;
  padding: 0 12px;
}
</style>

<style>
/* Import the external CSS file you provided */
@import './assets/search.css';
</style>
