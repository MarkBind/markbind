<template>
  <div v-if="item.heading" class="heading">
    <div class="heading-text">
      {{ item.heading.text }}
    </div>
    <div class="heading-text-items">
      <small v-html="highlight(item.heading.text, value)"></small>
      <br />
      <small v-for="(keyword, index) in item.keywords" :key="index">
        <span v-html="highlight(keyword, value)"></span>
        <br />
      </small>
    </div>
  </div>
  <div v-else>
    <span class="page-title" v-html="highlight(item.title, value)"></span>
    <br v-if="item.keywords" />
    <small v-if="item.keywords" v-html="highlight(item.keywords, value)"></small>
    <hr class="page-headings-separator" />
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      default: null,
    },
    value: {
      type: String,
      default: '',
    },
  },
  methods: {
    highlight(value, phrase) {
      function getMatchIntervals() {
        const regexes = phrase.split(' ')
          .filter((searchKeyword) => searchKeyword !== '')
          .map((searchKeyword) => searchKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
          .map((searchKeyword) => new RegExp(`(${searchKeyword})`, 'gi'));
        const matchIntervals = [];
        regexes.forEach((regex) => {
          let match = regex.exec(value);
          while (match !== null) {
            if (match.index === regex.lastIndex) {
              break;
            }
            matchIntervals.push({ start: match.index, end: regex.lastIndex });
            match = regex.exec(value);
          }
        });
        return matchIntervals;
      }
      // https://www.geeksforgeeks.org/merging-intervals/
      function mergeOverlappingIntervals(intervals) {
        if (intervals.length <= 1) {
          return intervals;
        }
        return intervals
          .sort((a, b) => a.start - b.start)
          .reduce((stack, current) => {
            const top = stack[stack.length - 1];
            if (!top || top.end < current.start) {
              stack.push(current);
            } else if (top.end < current.end) {
              top.end = current.end;
            }
            return stack;
          }, []);
      }
      const matchIntervals = mergeOverlappingIntervals(getMatchIntervals());
      let highlightedValue = value;
      // Traverse from back to front to avoid the positioning going out of sync
      for (let i = matchIntervals.length - 1; i >= 0; i -= 1) {
        highlightedValue = `${highlightedValue.slice(0, matchIntervals[i].start)}<mark>`
          + `${highlightedValue.slice(matchIntervals[i].start, matchIntervals[i].end)}</mark>`
          + `${highlightedValue.slice(matchIntervals[i].end)}`;
      }
      return highlightedValue;
    },
  },
};
</script>

<style scoped>
  .mark {
    padding: 0 !important;
  }

  .heading {
    padding: 0 0 0.1rem 0.2rem;
  }

  .heading-text {
    display: inline-block;
    width: 40%;
    white-space: normal;
    vertical-align: top;
  }

  .heading-text-items {
    display: inline-block;
    width: calc(60% - 0.7rem);
    white-space: normal;
    border-left: 1px solid #ddd;
    padding-left: 0.5rem;
  }

  .page-title {
    font-size: 1.05rem;
    font-weight: bold;
  }

  .page-headings-separator {
    margin: 0.2rem 0;
  }
</style>
