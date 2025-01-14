<template>
  <div style="position: relative;" class="dropdown">
    <div v-if="defaultUI" id="pagefind-search-input"></div>
    <template v-else>
      <input
        v-model="value"
        data-bs-toggle="dropdown"
        type="text"
        class="form-control"
        :placeholder="placeholder"
        autocomplete="off"
        @input="update"
        @keyup.up="up"
        @keyup.down="down"
        @keydown.enter="hit"
        @keydown.esc="reset"
        @focus="initPagefind"
        @blur="showDropdown = false;"
      />
      <div class="form-control placeholder-div-hidden">
        {{ placeholder }}
      </div>
    </template>
    <ul ref="dropdown" :class="dropdownMenuClasses">
      <li
        v-for="(item, index) in items"
        :key="index"
        :class="{ 'table-active': isActive(index) }"
      >
        <a
          class="dropdown-item"
          @mousedown.prevent="hit"
          @mousemove="setActive(index)"
        >
          <pagefind-searchbar-result-item :item="item" :value="value" />
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import PagefindSearchbarResultItem from './PagefindSearchbarResultItem.vue';

export default {
  // lifecycle hook
  created() {
    this.items = [];
  },

  // all component props need to be explicitly declared
  props: {
    placeholder: {
      type: String,
      default: 'Search',
    },
    menuAlignRight: {
      type: Boolean,
      default: false,
    },
    defaultUI: {
      type: Boolean,
      default: false,
    },
  },
  // function that returns initial reactive state for component instance
  data() {
    return {
      value: '',
      showDropdown: false,
      current: 0,
      items: [],
    };
  },

  // computed property will only re-evaluate when some of its dependencies have changed
  computed: {
    dropdownMenuClasses() {
      return [
        'dropdown-menu',
        'search-dropdown-menu',
        { 'show': this.showDropdown },
        { 'dropdown-menu-hidden': !this.showDropdown },
        { 'dropdown-menu-end': this.menuAlignRight },
      ];
    },
  },

  // objects containing desired methods
  methods: {
    async update() {
      if (!this.value) {
        this.reset();
        return false;
      }
      await this.performSearch();
      return true;
    },

    /**
     * Perform a search using the Pagefind API
     * We currently limit the subresults to 3 and discard irrelevant data from searchFragments for efficiency.
     * For each result, we display the title and limit the subresults to 3. Each subresult has an excerpt.
     */
    async performSearch() {
      if (window.Pagefind) {
        const searchQuery = await window.Pagefind.search(this.value);
        this.pagefindSearchResult = searchQuery?.results || [];
        this.searchFragments = await Promise.all(this.pagefindSearchResult.map(r => r.data()));

        // limit subresults to 3
        this.searchFragments.forEach((fragment) => {
          fragment.sub_results = fragment.sub_results.slice(0, 3);
        });

        // extract only usable data and flatten sub_results
        this.items = this.searchFragments.flatMap((fragment) => {
          const pageTitle = {
            title: fragment.meta.title || fragment.url,
            url: fragment.url,
          };

          const pageHeaders = fragment.sub_results.map(subResult => ({
            heading: subResult.title,
            url: subResult.url,
            excerpt: subResult.excerpt,
          }));

          return [pageTitle, ...pageHeaders];
        });

        this.showDropdown = this.items.length > 0;
      }
    },

    initPagefind() {
      if (window.Pagefind) {
        window.Pagefind.init();
      }
    },

    // reset items to 0, searchbar value, and hide dropdown
    reset() {
      this.items = [];
      this.value = '';
      this.showDropdown = false;
    },
    hit(e) {
      e.preventDefault();
      window.location.href = this.items[this.current].url;
    },

    setActive(index) {
      this.current = index;
    },
    isActive(index) {
      return this.current === index;
    },
    down() {
      if (this.current < this.items.length - 1) {
        this.current += 1;
        this.scrollListView();
      }
    },
    up() {
      if (this.current > 0) {
        this.current -= 1;
        this.scrollListView();
      }
    },
    scrollListView() {
      const { dropdown } = this.$refs;
      const currentEntry = dropdown.children[this.current];
      const upperBound = dropdown.scrollTop;
      const lowerBound = upperBound + dropdown.clientHeight;
      const currentEntryOffsetBottom = currentEntry.offsetTop + currentEntry.offsetHeight;
      if (currentEntry.offsetTop < upperBound) {
        dropdown.scrollTop = currentEntry.offsetTop;
      } else if (currentEntryOffsetBottom > lowerBound) {
        dropdown.scrollTop = currentEntryOffsetBottom - dropdown.clientHeight;
      }
    },
  },

  components: {
    PagefindSearchbarResultItem,
  },
};
</script>

<style scoped>
    .dropdown {
        display: block;
    }

    .form-control {
        min-width: 12.7em;
        max-width: 25.4em; /* twice of min-width, to accommodate a range of lengths */
    }

    /* For mobile devices and general tablets in portrait e.g. iPad */
    @media screen and (width <= 878px) and (orientation: portrait) {
        .form-control {
            min-width: 8em;
            max-width: 16em; /* twice of min-width, to accommodate a range of lengths */
        }
    }

    /* For general tablets in landscape e.g. iPad */
    @media screen and (width >= 768px) and (width <= 878px)  and (orientation: landscape) {
        .form-control {
            min-width: 9em;
            max-width: 18em; /* twice of min-width, to accommodate a range of lengths */
        }
    }

    .table-active {
        background-color: rgb(0 0 0 / 7.5%); /* follows Bootstrap's table-active */
    }

    .dropdown-menu-end {
        right: 0;
        left: auto;
    }

    .placeholder-div-hidden {
        /* prevents placeholderDiv from taking up space on the navbar to resolve FOUC */
        height: 0;
        padding-top: 0;
        padding-bottom: 0;
        border-top: 0;
        border-bottom: 0;
        visibility: hidden;
        overflow: hidden;
    }

    .dropdown-menu-hidden {
        visibility: hidden;
    }
</style>

<style>
    .search-dropdown-menu {
        min-width: 30em;
        max-height: 30em;
        overflow-y: scroll;
    }

    .dropdown-menu > li > a {
        cursor: pointer;
    }

    @media screen and (width <= 768px) {
        .search-dropdown-menu {
            min-width: 90vw;
            max-height: 30em;
            overflow-y: scroll;
        }

        .dropdown-menu.search-dropdown-menu {
            position: absolute;
        }
    }
</style>
