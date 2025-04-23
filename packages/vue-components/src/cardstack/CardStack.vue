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
      <span class="toggle-badge" @click="toggleFilterMode">
        match all selected

        <span
          :class="['btn', 'btn-sm', `tag-badge`]"
        >
          <span class="badge bg-light text-dark tag-indicator">
            <span v-if="filterMode === 'AND'">✓</span>
            <span v-else>&nbsp;&nbsp;&nbsp;</span>
          </span>
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
  provide() {
    return {
      cardStackRef: this.cardStackRef,
    };
  },
  methods: {
    toggleFilterMode() {
      this.filterMode = this.filterMode === 'AND' ? 'OR' : 'AND';
      if (this.selectedTags.length > 0) {
        this.updateTag(null, true);
      }
    },
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
    updateTag(tagName, forceUpdate = false) {
      if (!forceUpdate && tagName) {
        if (this.selectedTags.includes(tagName)) {
          this.selectedTags = this.selectedTags.filter(tag => tag !== tagName);
        } else {
          this.selectedTags.push(tagName);
        }
      }

      if (this.selectedTags.length === 0) {
        this.showAllTags();
      } else {
        this.cardStackRef.children.forEach((child) => {
          if (child.$props.disabled) return;

          const tags = child.computeTags;
          let showCard;
          if (this.filterMode === 'AND') {
            showCard = this.selectedTags.every(tag => tags.includes(tag));
          } else {
            showCard = tags.some(tag => this.selectedTags.includes(tag));
          }
          child.$data.disableTag = !showCard;
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
      selectedTags: [],
      filterMode: 'OR',
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
        margin-right: 5px;
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
        margin-left: -3px;
        margin-right: -3px;
    }

    .filter-mode-toggle {
        font-size: 0.8rem;
        margin-left: 8px;
        padding: 0.2rem 0.5rem;
    }

    .toggle-badge {
        color: black;
        cursor: pointer;
        margin-left: 5px;
    }
</style>
