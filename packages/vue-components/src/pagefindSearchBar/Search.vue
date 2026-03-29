<script setup>
/* eslint-disable import/no-extraneous-dependencies */
import { formatPagefindResult } from '@markbind/core/src/Pagefind';
import {
  ref, watch, onMounted, onUnmounted, nextTick,
} from 'vue';
import LogoPagefind from './LogoPagefind.vue';

const MARKBIND_PREFIX = 'markbind/';
const MARKBIND_PREFIX_REGEX = /markbind\//g;

const showModal = ref(false);
const searchQuery = ref('');
const searchResults = ref([]);
const isLoading = ref(false);
const selectedIndex = ref(-1);
const searchInputRef = ref(null);

const selectResult = (result) => {
  if (result && result.route) {
    window.location.href = result.route;
    showModal.value = false;
  }
};

const toggleSearch = () => {
  showModal.value = !showModal.value;
  if (showModal.value) {
    nextTick(() => {
      if (searchInputRef.value) {
        searchInputRef.value.focus();
      }
    });
  }
};

const stripMarkbindPrefix = (url) => {
  if (url.includes(MARKBIND_PREFIX)) {
    return url.replace(MARKBIND_PREFIX_REGEX, '');
  }
  return url;
};

const performSearch = async (query) => {
  if (!query.trim()) {
    searchResults.value = [];
    return;
  }

  isLoading.value = true;
  try {
    const pagefind = await window.loadPagefind();
    const search = await pagefind.search(query);
    const rawResults = await Promise.all(search.results.map(r => r.data()));

    searchResults.value = rawResults
      .flatMap((r) => {
        r.url = stripMarkbindPrefix(r.url);
        if (r.sub_results && Array.isArray(r.sub_results)) {
          r.sub_results.forEach((subResult) => {
            subResult.url = stripMarkbindPrefix(subResult.url);
          });
        }
        return r;
      })
      .flatMap(r => formatPagefindResult(r));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Search failed:', error);
    searchResults.value = [];
  }
  isLoading.value = false;
};

let debounceTimer = null;
watch(searchQuery, (newQuery) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    performSearch(newQuery);
  }, 150);
});

const handleKeyDown = (e) => {
  if (!showModal.value) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedIndex.value = Math.min(
      selectedIndex.value + 1,
      searchResults.value.length - 1,
    );
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedIndex.value = Math.max(selectedIndex.value - 1, -1);
  } else if (e.key === 'Enter' && selectedIndex.value >= 0) {
    e.preventDefault();
    selectResult(searchResults.value[selectedIndex.value]);
    return;
  }

  // Scroll active element into view
  nextTick(() => {
    const activeElement = document.querySelector('.search-result-item.active');
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
};

const handleGlobalKeydown = (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    toggleSearch();
    return;
  }

  if (e.key === 'Escape' && showModal.value) {
    showModal.value = false;
  }
};

const handleResultMouseEnter = (index) => {
  selectedIndex.value = index;
};

const handleResultClick = (result) => {
  selectResult(result);
};

watch(showModal, (isOpen) => {
  if (!isOpen) {
    searchQuery.value = '';
    searchResults.value = [];
    selectedIndex.value = -1;
    isLoading.value = false;
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
});
</script>

<template>
  <div class="blog-search">
    <div class="nav-search-btn-wait" @click="toggleSearch">
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
      <span class="metaKey">
        <kbd class="command-palette-commands-key">{{ metaKey }}</kbd>
        &nbsp;
        <kbd class="command-palette-commands-key">K</kbd>
      </span>
    </div>

    <div
      v-if="showModal"
      class="search-dialog"
    >
      <div
        command-dialog-mask
        @click.self="showModal = false"
      >
        <div command-dialog-wrapper class="search-modal">
          <div command-dialog-header class="search-header">
            <div class="search-bar">
              <input
                ref="searchInputRef"
                v-model="searchQuery"
                type="text"
                class="search-input"
                placeholder="Search"
                @keydown="handleKeyDown"
              />
            </div>
          </div>

          <div class="search-results-container">
            <div v-if="isLoading" class="search-loading">
              Searching...
            </div>
            <div
              v-else-if="searchResults.length > 0"
              class="search-results"
            >
              <div
                v-for="(result, index) in searchResults"
                :key="result.route"
                :class="['search-result-item', { active: index === selectedIndex }]"
                @click="handleResultClick(result)"
                @mouseenter="handleResultMouseEnter(index)"
              >
                <!-- Main result: single icon -->
                <div v-if="!result.isSubResult" class="result-icon">
                  <svg
                    class="DocSearch-Hit-icon"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M17 6v12c0 .52-.2 1-1 1H4c-.7 0-1-.33-1-1V2
                      c0-.55.42-1 1-1h8l5 5zM14 8h-3.13c-.51 0-.87-.34-.87-.87V4"
                      stroke="currentColor"
                      fill="none"
                      fill-rule="evenodd"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
                <!-- Sub-result: two icons for indentation -->
                <template v-else>
                  <div class="result-icon">
                    <svg
                      class="DocSearch-Hit-Tree"
                      viewBox="0 0 24 54"
                    >
                      <g
                        v-if="!result.isLastSubResult"
                        stroke="currentColor"
                        fill="none"
                        fill-rule="evenodd"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M8 6v42M20 27H8.3" />
                      </g>
                      <g
                        v-else
                        stroke="currentColor"
                        fill="none"
                        fill-rule="evenodd"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M8 6v21M20 27H8.3" />
                      </g>
                    </svg>
                  </div>
                  <div class="result-icon-sub">
                    <svg
                      class="DocSearch-Hit-Hash"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M13 13h4-4V8H7v5h6v4-4H7V8H3h4V3v5h6V3v5h4-4v5zm-6 0v4-4H3h4z"
                        stroke="currentColor"
                        fill="none"
                        fill-rule="evenodd"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                </template>
                <div class="link">
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <div class="result-title" v-html="result.meta.title"></div>
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <div class="result-excerpt" v-html="result.meta.description"></div>
                </div>
                <div
                  v-if="index === selectedIndex"
                >
                  <div class="result-icon-sub">
                    <svg
                      class="DocSearch-Hit-Select-Icon"
                      viewBox="0 0 20 20"
                    >
                      <g
                        stroke="currentColor"
                        fill="none"
                        fill-rule="evenodd"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M18 3v4c0 2-2 4-4 4H2" />
                        <path d="M8 17l-6-6 6-6" />
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              v-else-if="searchQuery.trim() && !isLoading"
              class="search-empty"
            >
              No results found.
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
    border: 1px solid var(--mb-search-accent);
    transition: border 0.2s;
}

.nav-search-btn-wait:hover {
    border: 1px solid var(--mb-search-brand, #5468ff);
}

.blog-search .nav-search-btn-wait .search-tip {
    color: var(--mb-search-accent);
    font-size: 1rem;
    padding-left: 8px;
    padding-right: 16px;
}

.metaKey {
    margin-left: 10px;
    font-size: 12px;
    padding: 0 2px;
}

.search-bar {
    cursor: text;
    align-items: center;
    border-radius: 4px;
    border: 1px solid var(--mb-search-brand);
    width: 100%;
}
</style>

<style>
    @import url('./assets/search.css');
</style>
