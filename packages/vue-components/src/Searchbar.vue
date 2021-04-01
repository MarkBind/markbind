<template>
  <div style="position: relative;">
    <input
      :id="inputId"
      v-model="value"
      type="text"
      class="form-control"
      :placeholder="placeholder"
      autocomplete="off"
      @input="update"
      @keydown.up="up"
      @keydown.down="down"
      @keydown.enter="hit"
      @keydown.esc="reset"
      @blur="showDropdown = false"
    />
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
          <searchbar-page-item :item="item" :value="value" />
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import searchbarPageItem from './SearchbarPageItem.vue';
import { delayer, getJSON } from './utils/utils';

const _DELAY_ = 200;

export default {
  created() {
    this.items = this.primitiveData;
  },
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    limit: {
      type: Number,
      default: 8,
    },
    async: {
      type: String,
      default: '',
    },
    keyProp: {
      type: String,
      default: null,
    },
    onHit: {
      type: Function,
      default(items) {
        this.reset();
        this.value = items;
      },
    },
    placeholder: {
      type: String,
      default: 'Search',
    },
    delay: {
      type: Number,
      default: _DELAY_,
    },
    menuAlignRight: {
      type: Boolean,
      default: false,
    },
    algolia: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      value: '',
      showDropdown: false,
      noResults: true,
      current: 0,
      items: [],
    };
  },
  computed: {
    primitiveData() {
      // Returns the total number of matches between an array of regex patterns and string search targets.
      function getTotalMatches(searchTargets, regexes) {
        const searchTarget = searchTargets.join(' ');

        return regexes.reduce((total, regex) => {
          const matches = searchTarget.match(regex);
          return total + (matches ? matches.length : 0);
        }, 0);
      }

      if (this.value.length < 2 || !this.data) {
        return [];
      }
      const pages = [];
      const regexes = this.value.split(' ')
        .filter(searchKeyword => searchKeyword !== '')
        .map(searchKeyword => searchKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .map(searchKeyword => new RegExp(searchKeyword, 'ig'));
      this.data.forEach((entry) => {
        const {
          headings,
          src,
          title,
          headingKeywords,
        } = entry;
        const keywords = entry.keywords || '';
        const displayTitle = title || src;

        const pageSearchTargets = [
          displayTitle,
          keywords,
          ...Object.values(headings),
          ...Object.values(headingKeywords),
        ];
        const totalPageMatches = getTotalMatches(pageSearchTargets, regexes);

        if (totalPageMatches > 0) {
          const pageHeadings = [];
          Object.entries(headings).forEach(([id, text]) => {
            const matchesHeading = regexes.some(regex => regex.test(text));
            const matchesKeywords = headingKeywords[id] && headingKeywords[id]
              .some(keyword => regexes.some(regex => regex.test(keyword)));

            if (matchesHeading || matchesKeywords) {
              const headingSearchTargets = [
                text,
                ...(headingKeywords[id] || []),
              ];
              const totalHeadingMatches = getTotalMatches(headingSearchTargets, regexes);

              pageHeadings.push({
                heading: { id, text },
                keywords: headingKeywords[id],
                src,
                totalMatches: totalHeadingMatches,
              });
            }
          });
          pageHeadings.sort((a, b) => b.totalMatches - a.totalMatches);

          pages.push({
            headings: pageHeadings,
            keywords,
            src,
            title: displayTitle,
            totalMatches: totalPageMatches,
          });
        }
      });

      return pages
        .sort((a, b) => b.totalMatches - a.totalMatches)
        .flatMap((page) => {
          if (page.headings) {
            return [page, ...page.headings];
          }
          return page;
        });
    },
    inputId() {
      return this.algolia ? 'algolia-search-input' : null;
    },
    dropdownMenuClasses() {
      return [
        'dropdown-menu',
        'search-dropdown-menu',
        { show: this.showDropdown },
        { 'dropdown-menu-right': this.menuAlignRight },
      ];
    },
  },
  methods: {
    update() {
      if (!this.value) {
        this.reset();
        return false;
      }
      if (this.data) {
        this.items = this.primitiveData;
        this.showDropdown = this.items.length > 0;
      }
      if (this.async) this.query();
      return true;
    },
    query: delayer(function () {
      getJSON(this.async + this.value).then((data) => {
        this.items = (this.keyProp ? data[this.keyProp] : data).slice(0, this.limit);
        this.showDropdown = this.items.length;
      });
    }, 'delay', _DELAY_),
    reset() {
      this.items = [];
      this.value = '';
      this.loading = false;
      this.showDropdown = false;
    },
    setActive(index) {
      this.current = index;
    },
    isActive(index) {
      return this.current === index;
    },
    hit(e) {
      e.preventDefault();
      this.onHit(this.items[this.current], this);
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
    searchbarPageItem,
  },
};
</script>

<style>
    .search-dropdown-menu {
        min-width: 30em;
        max-height: 30em;
        overflow-y: scroll;
    }

    .dropdown-menu > li > a {
        cursor: pointer;
    }

    @media screen and (max-width: 768px) {
        .search-dropdown-menu {
            min-width: auto;
            max-height: 30em;
            overflow-y: scroll;
        }
    }
</style>
