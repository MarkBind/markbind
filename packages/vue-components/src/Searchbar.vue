<template>
  <div style="position: relative;" class="dropdown">
    <div v-if="algolia" id="algolia-search-input"></div>
    <input
      v-else
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
        const displayTitle = title || src.substring(0, src.lastIndexOf('.'));

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

      // using distance with adjacent transpositions - doesn't work with chars other than a-z
      /*
      function damerauLevenshtein(s1, s2) {
        const da = [];
        for (let i = 0; i < 26; i += 1) { // i = 1 to 26
          da[i] = 0;
        }

        const d = [...Array(s1.length + 2)].map(() => Array(s2.length + 2)); // -1 to lengths of each

        const maxDist = s1.length + s2.length;
        d[0][0] = maxDist;
        for (let i = 0; i <= s1.length; i += 1) {
          d[i + 1][0] = maxDist;
          d[i + 1][1] = i;
        }
        for (let j = 0; j <= s2.length; j += 1) {
          d[0][j + 1] = maxDist;
          d[1][j + 1] = j;
        }

        let cost = 0;
        for (let i = 1; i <= s1.length; i += 1) {
          let db = 0;
          for (let j = 1; j <= s2.length; j += 1) {
            const k = da[s2[j - 1].charCodeAt(0) - 97];
            const l = db;
            if (s1[i - 1] === s2[j - 1]) {
              cost = 0;
              db = j; // j-1??
            } else {
              cost = 1;
            }

            const substitution = d[i][j] + cost;
            const insertion = d[i + 1][j] + 1;
            const deletion = d[i][j + 1] + 1;
            const transposition = d[k][l] + (i - k - 1) + 1 + (j - l - 1);
            d[i + 1][j + 1] = Math.min(substitution, insertion, deletion, transposition);
          }
          da[s1[i - 1] - 1] = i;
        }

        return d[s1.length + 1][s2.length + 1];
      }
      */

      // using optimal string alignment distance
      function damerauLevenshtein(s1, s2) {
        const d = [...Array(s1.length + 1)].map(() => Array(s2.length + 1));

        for (let i = 0; i <= s1.length; i += 1) {
          d[i][0] = i;
        }
        for (let j = 0; j <= s2.length; j += 1) {
          d[0][j] = j;
        }

        let cost = 0;
        for (let i = 0; i < s1.length; i += 1) {
          for (let j = 0; j < s2.length; j += 1) {
            if (s1[i] === s2[j]) {
              cost = 0;
            } else {
              cost = 1;
            }

            const deletion = d[i][j + 1] + 1;
            const insertion = d[i + 1][j] + 1;
            const substitution = d[i][j] + cost;
            d[i + 1][j + 1] = Math.min(deletion, insertion, substitution);

            if (i > 0 && j > 0 && s1[i] === s2[j - 1] && s1[i - 1] === s2[j]) {
              d[i + 1][j + 1] = Math.min(d[i + 1][j + 1], d[i - 1][j - 1] + 1);
            }
          }
        }

        return d[s1.length][s2.length];
      }

      // fix dupes
      function isDuplicateResult(page) {
        // if more than 1 header, keep
        if (page.headings.length > 1) {
          return false;
        }

        const heading = page.headings[0].heading.text.toLowerCase().trim();
        const title = page.title.toLowerCase().trim();
        const limit = 3; // TODO: see if this is a good enough limit (or can use % as well)

        // if heading is contained within page title, can remove since all info is alr present in title
        if (title.includes(heading)) {
          return true;
        }

        // if title contained, keep both cos keeping heading without title looks weird

        // for anything else, use levenshtein or gestalt?
        const dist = damerauLevenshtein(heading, title);
        if (dist <= limit) {
          return true;
        }
        // console.log("dist between " + heading + " and " + title);
        // console.log(dist);
        // console.log(damerauLevenshtein("bark", "bank"));
        // console.log(damerauLevenshtein("brak", "bark"));
        // console.log(damerauLevenshtein("test 1", "test 2"));
        return false;
      }

      return pages
        .sort((a, b) => b.totalMatches - a.totalMatches)
        .flatMap((page) => {
          if (page.headings && isDuplicateResult(page)) {
            return [page];
          } else if (page.headings) {
            return [page, ...page.headings];
          }
          return page;
        });
    },
    dropdownMenuClasses() {
      return [
        'dropdown-menu',
        'search-dropdown-menu',
        { show: this.showDropdown },
        { 'd-none': !this.showDropdown },
        { 'dropdown-menu-end': this.menuAlignRight },
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

<style scoped>
    .form-control {
        min-width: 8em;
    }

    .table-active {
        background-color: rgba(0, 0, 0, 0.075); /* follows Bootstrap's table-active */
    }

    .dropdown-menu-end {
        right: 0;
        left: auto;
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

    @media screen and (max-width: 768px) {
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
