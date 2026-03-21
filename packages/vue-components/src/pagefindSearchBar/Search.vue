<script setup>
/* eslint-disable import/no-extraneous-dependencies */
import {
  ref, onMounted, nextTick, watch, onUnmounted,
} from 'vue';
import LogoPagefind from './LogoPagefind.vue';

const MARKBIND_PREFIX = 'markbind/';
const MARKBIND_PREFIX_REGEX = /markbind\//g;

let observer = null;

const showModal = ref(false);

const toggleSearch = () => {
  showModal.value = !showModal.value;
};

// process subresults (headings within the page) by stripping the "markbind/" prefix if it exists
const stripMarkbindPrefix = (url, regex) => {
  if (url.includes(MARKBIND_PREFIX)) {
    return url.replace(regex, '');
  }
  return url;
};

// Process the main result URL and its sub-results to strip the "markbind/" prefix if it exists
const processPagefindResult = (result) => {
  result.url = stripMarkbindPrefix(result.url, MARKBIND_PREFIX_REGEX);

  if (result.sub_results && Array.isArray(result.sub_results)) {
    result.sub_results.forEach((subResult) => {
      subResult.url = stripMarkbindPrefix(subResult.url, MARKBIND_PREFIX_REGEX);
    });
  }
  return result;
};

const handleKeyDown = (e) => {
  if (!showModal.value) return;
  if (!['ArrowUp', 'ArrowDown', 'Enter'].includes(e.key)) return;

  const results = Array.from(document.querySelectorAll(
    '.pagefind-ui__result-link, .pagefind-ui__sub-result-link'));
  if (results.length === 0) return;

  const input = document.querySelector('#pagefind-search-input input');
  const { activeElement } = document;

  if (e.key === 'Enter' && activeElement === input) {
    const activeResult = document.querySelector('.pagefind-ui__result.is-active .pagefind-ui__result-link');
    if (activeResult) {
      e.preventDefault();
      activeResult.click();
      showModal.value = false;
      return;
    }
  }

  const index = results.indexOf(activeElement);
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    document.querySelectorAll('.pagefind-ui__result.is-active').forEach((el) => {
      el.classList.remove('is-active');
    });

    let targetIndex;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      // index is -1 if focus is in the input; this correctly jumps to 0
      targetIndex = (index + 1) % results.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      targetIndex = (index <= 0) ? results.length - 1 : index - 1;
    }

    // Single source of truth for focusing
    const target = results[targetIndex];
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
};

const handleGlobalKeydown = (e) => {
  // Shortcut: Cmd/Ctrl + K
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    toggleSearch();
    return;
  }

  // Shortcut: Escape
  if (e.key === 'Escape' && showModal.value) {
    showModal.value = false;
    return;
  }

  // Navigation: Up/Down/Enter
  handleKeyDown(e);
};

// --- CHANGE: Extracted event listeners to named functions for reliable removal (Issues 2, 3) ---
const handleMouseOver = (e) => {
  const container = document.querySelector('#pagefind-search-input');
  if (!container) return;
  const resultLink = e.target.closest('.pagefind-ui__result-link');
  if (resultLink) {
    container.querySelectorAll('.pagefind-ui__result.is-active').forEach((el) => {
      el.classList.remove('is-active');
    });
    const resultElement = resultLink.closest('.pagefind-ui__result');
    if (resultElement) {
      resultElement.classList.add('is-active');
    }
    resultLink.focus({ preventScroll: true });
  }
};

const handleResultClick = (e) => {
  if (e.target.closest('a')) {
    showModal.value = false;
  }
};

const cleanupModalAssets = () => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  const container = document.querySelector('#pagefind-search-input');
  if (container) {
    container.removeEventListener('mouseover', handleMouseOver);
    container.removeEventListener('click', handleResultClick);
    // Clear content to ensure a fresh Pagefind UI on next open
    container.innerHTML = '';
  }
};

watch(showModal, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      const container = document.querySelector('#pagefind-search-input');
      if (window.PagefindUI && container && !container.querySelector('.pagefind-ui')) {
        // eslint-disable-next-line no-unused-vars
        const pagefind = new window.PagefindUI({
          element: '#pagefind-search-input',
          showSubResults: true,
          resetFilters: true,
          showImages: false,
          autofocus: true,
          excerptLength: 10,
          pageSize: 100,
          processResult: processPagefindResult,
        });

        // Focus the input inside the new structure
        const input = document.querySelector('#pagefind-search-input input');
        if (input) {
          input.focus();
          observer = new MutationObserver(() => {
            container.querySelectorAll('.pagefind-ui__result').forEach((el) => {
              el.classList.remove('is-active');
            });

            const firstResult = container.querySelector('.pagefind-ui__result');
            if (firstResult) {
              firstResult.classList.add('is-active');
            }
          });

          // Start observing the container for added search results
          observer.observe(container, { childList: true, subtree: true });
        }

        container.addEventListener('mouseover', handleMouseOver);
        container.addEventListener('click', handleResultClick);
      }
    });
  } else {
    cleanupModalAssets();
  }
});

const metaKey = ref('');
onMounted(() => {
  metaKey.value = /(Mac|iPhone|iPod|iPad)/i.test(navigator?.platform)
    ? '⌘'
    : 'Ctrl';
  window.addEventListener('keydown', handleGlobalKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
  cleanupModalAssets();
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
            2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419
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
    >
      <div
        command-dialog-mask
        @click.self="showModal = false"
      >
        <div command-dialog-wrapper class="search-modal">
          <div command-dialog-header class="search-header">
            <div class="search-bar">
              <div id="pagefind-search-input"></div>
            </div>
          </div>

          <div command-dialog-footer>
            <div class="command-palette-logo">
              <a
                href="https://github.com/cloudcannon/pagefind"
                target="_blank"
                rel="noopener noreferrer"
              >
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
                <kbd class="command-palette-commands-key">
                  <svg
                    width="15"
                    height="15"
                    aria-label="Arrow down"
                    role="img"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.2"
                    >
                      <path d="M7.5 3.5v8M10.5 8.5l-3 3-3-3" />
                    </g>
                  </svg>
                </kbd>
                <kbd class="command-palette-commands-key">
                  <svg
                    width="15"
                    height="15"
                    aria-label="Arrow up"
                    role="img"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.2"
                    >
                      <path d="M7.5 11.5v-8M10.5 6.5l-3-3-3 3" />
                    </g>
                  </svg>
                </kbd>
                <span class="command-palette-Label">
                  to navigate
                </span>
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
        flex: 1;
        display: flex;
    }

    .nav-search-btn-wait {
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 10px 0 12px;
        box-sizing: border-box;
        height: 40px;
        background-color: var(--mb-bg-alt, #fff);
        color: #212529;
        border-radius: 8px;
        border: 1px solid #ced4da;
        transition: border 0.2s;
    }

    .nav-search-btn-wait:hover {
        border: 1px solid var(--vcp-c-brand, #5468ff);
    }

    .blog-search .nav-search-btn-wait .search-tip {
        color: #909399;
        font-size: 12px;
        padding-left: 8px;
        padding-right: 16px;
    }

    .metaKey {
        margin-left: 10px;
        font-size: 12px;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        padding: 0 6px;
    }

    .search-bar {
        cursor: text;
        align-items: center;
        border-radius: 4px;
        border: 1px solid var(--vcp-c-brand);
    }

    .search-bar input {
        width: 100%;
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
        max-height: 55vh;
        overflow-y: auto;
        padding: 0;

        /* Hide scrollbar for IE, Edge and Firefox */
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
    }

    #pagefind-search-input :deep(.pagefind-ui__message) {
        box-sizing: content-box;
        padding: 0;
        display: flex;
        align-items: center;
        font-weight: 700;
        margin-top: 0;
    }

    #pagefind-search-input :deep(.pagefind-ui__result) {
        border-radius: 5px;
        padding: 2px 5px;
        box-shadow: 0 2px 7px rgba(0 0 0 / 20%);
        margin: 5px;
    }

    #pagefind-search-input :deep(.pagefind-ui__result-inner) {
        border-radius: 5px;
        padding: 2px;
    }

    #pagefind-search-input :deep(.pagefind-ui__result-link:focus) {
        outline: none;
        background-color: rgba(255 255 255 / 15%) !important;
        border-radius: 6px;
        display: block;
        padding: 4px 8px;
    }

    /* 1. Main Container: Keep the blue background when navigating inside */
    #pagefind-search-input :deep(.pagefind-ui__result:focus-within),
    #pagefind-search-input :deep(.pagefind-ui__result.is-active) {
        background-color: #5468ff !important;
        border-radius: 8px;
        transition: background-color 0.1s ease;
    }

    #pagefind-search-input :deep(.pagefind-ui__result:focus-within *),
    #pagefind-search-input :deep(.pagefind-ui__result.is-active *) {
        color: #fff !important;
    }

    /* Highlighting search terms (mark tags) */
    #pagefind-search-input :deep(.pagefind-ui__result:focus-within mark),
    #pagefind-search-input :deep(.pagefind-ui__result.is-active mark) {
        background-color: rgba(255 255 255 / 20%) !important;
        color: #fff !important;
    }

</style>

<style>
    /* Import the external CSS file you provided */
    @import url('./assets/search.css');
</style>
