<script>
import typeahead from './Typeahead.vue';
import searchbarPageItem from './SearchbarPageItem.vue';

export default {
  extends: typeahead,
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
        .filter((searchKeyword) => searchKeyword !== '')
        .map((searchKeyword) => searchKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .map((searchKeyword) => new RegExp(searchKeyword, 'ig'));
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
            const matchesHeading = regexes.some((regex) => regex.test(text));
            const matchesKeywords = headingKeywords[id] && headingKeywords[id]
              .some((keyword) => regexes.some((regex) => regex.test(keyword)));

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
    entryTemplate() {
      return 'searchbarPageItem';
    },
  },
  methods: {
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

@media screen and (max-width: 768px) {
  .search-dropdown-menu {
    min-width: auto;
    max-height: 30em;
    overflow-y: scroll;
  }
}
</style>
