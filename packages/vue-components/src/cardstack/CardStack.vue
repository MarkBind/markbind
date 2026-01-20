<template>
  <div class="grid-container">
    <div class="header-row">
      <span v-if="searchable" class="search-bar">
        <template v-if="searchable">
          <input
            v-model="value"
            type="text"
            class="form-control search-bar"
            :placeholder="placeholder"
            @input="update"
          />
        </template>
      </span>
      <span
        v-for="(key, index) in cardStackRef.tagMapping"
        :key="index"
        :class="['badge', key[1].badgeColor, 'tag-badge']"
        @click="updateTag(key[0])"
      >
        {{ key[0] }}&nbsp;
        <span class="badge bg-light text-dark tag-indicator">
          <span v-if="computeShowTag(key[0])">✓</span>
          <span v-else>&nbsp;&nbsp;&nbsp;</span>
        </span>
      </span>
    </div>
    <div class="container">
      <div class="row justify-content-starts gy-3">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
const BADGE_COLOURS = [
  'bg-primary',
  'bg-secondary',
  'bg-success',
  'bg-danger',
  'bg-warning text-dark',
  'bg-info text-dark',
  'bg-light text-dark',
  'bg-dark',
];

export default {
  props: {
    blocks: {
      type: String,
      default: '2',
    },
    placeholder: {
      type: String,
      default: 'Search',
    },
    searchable: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
  },
  watch: {
    'cardStackRef.tagMapping': {
      handler(newMapping) {
        // Initialise the selectedTags with all tag names when loading for the first time
        if (this.selectedTags.length === 0 && newMapping.length > 0) {
          this.selectedTags = newMapping.map(key => key[0]);
        }
      },
      immediate: true,
    },
  },
  provide() {
    return {
      cardStackRef: this.cardStackRef,
    };
  },
  methods: {
    update() {
      const regexes = this.value.split(' ')
        .filter(searchKeyword => searchKeyword !== '')
        .map(searchKeyword => searchKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .map(searchKeyword => new RegExp(searchKeyword, 'ig'));

      this.cardStackRef.searchData.forEach((child, searchTarget) => {
        if (child.$props.disabled || child.$data.disableTag) {
          return;
        }

        if (this.value === '' && !child.$props.disabled) {
          child.$data.disableCard = false;
          return;
        }
        let matched = false;
        regexes.forEach((regex) => {
          if (searchTarget.match(regex)) {
            matched = true;
          }
        });
        child.$data.disableCard = !matched;
      });
    },
    updateTag(tagName) {
      if (this.selectedTags.includes(tagName)) {
        this.selectedTags = this.selectedTags.filter(tag => tag !== tagName);
      } else {
        this.selectedTags.push(tagName);
      }

      if (this.selectedTags.length === 0) {
        // this.showAllTags(); //reminder to remove later
        // This ensures that all cards are disabled when no tags are selected
        this.cardStackRef.children.forEach((child) => {
          if (!child.$props.disabled) {
            child.$data.disableTag = true;
          }
        });
      } else {
        this.cardStackRef.children.forEach((child) => {
          if (child.$props.disabled) return;

          const tags = child.computeTags;
          const containsActiveTag = tags.some(tag => this.selectedTags.includes(tag));
          child.$data.disableTag = !containsActiveTag;
        });
      }
    },
    showAllTags() {
      this.cardStackRef.children.forEach((child) => {
        if (child.$props.disabled) return;

        child.$data.disableTag = false;
      });
    },
    computeShowTag(tagName) {
      return this.selectedTags.includes(tagName);
    },
  },
  data() {
    return {
      value: '',
      tags: [],
      selectedTags: [],
      cardStackRef: {
        rawTags: [],
        tagMapping: [],
        children: [],
        searchData: new Map(),
        updateTagMapping() {
          const tags = this.rawTags;
          const tagMap = new Map();
          let index = 0;

          tags.forEach((tag) => {
            // "tag" -> {badgeColor, children : [child], disableTag: false}
            if (!tagMap.has(tag)) {
              const color = BADGE_COLOURS[index % BADGE_COLOURS.length];
              const tagMapping = { badgeColor: color, children: [], disableTag: false };
              tagMap.set(tag, tagMapping);
              index += 1;
            }
          });
          this.tagMapping = Array.from(tagMap.entries());
        },
        updateSearchData() {
          const primitiveMap = new Map();

          this.children.forEach((child) => {
            const rawTags = child.computeTags;
            const keywords = child.computeKeywords;
            const header = child.headerText;
            const searchTarget = rawTags.join(' ') + keywords + header;

            primitiveMap.set(searchTarget, child);
          });

          this.searchData = primitiveMap;
        },
        updateRawTags(tags) {
          this.rawTags.push(...tags);
        },
      },
    };
  },
  mounted() {
    this.isMounted = true;
  },
};

</script>

<style scoped>
    .header-row {
        display: flex;
        align-items: center;
        justify-content: start;
        margin: 0;
        padding: 0 24px;
        flex-flow: row wrap;
        gap: 2px;
    }

    .search-bar {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin: 0;
        padding: 5px;
    }

    .row {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
    }

    .grid-container {
        background-color: rgb(231 231 231);
        border-radius: 8px;
        padding: 20px;
        margin: 10px 0;
    }

    .container {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .form-control {
        min-width: 12.7em;
        max-width: 25.4em;
    }

    /* .tag-container {
        display: flex;
        flex-direction: row;
        width: 50%;
        text-align: right
    } */

    /* .tag-badge-container {
        display: flex;
        flex-flow: row wrap;
        width: 100%;
    } */
    .tag-badge {
        margin: 2px;
        cursor: pointer;
        height: inherit;
        padding: 5px;
    }

    .tag-indicator {
        width: 18px;
        height: 100%;
    }
</style>
