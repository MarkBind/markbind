<template>
  <div class="grid-container">
    <div class="header-row">
      <span class="search-bar">
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
      <div class="tag-container">
        <span>Tags:</span>
        <div class="tag-badge-container">
          <span
            v-for="(key, index) in tags"
            :key="index"
            :class="['badge', key[1].badgeColor]"
            @click="updateTag(key[0])"
          >
            {{ key[0] }}
            <span class="badge bg-light text-dark tag-indicator">
              <span v-if="computeShowTag(key[0])">✓</span>
              <span v-else>&nbsp;&nbsp;&nbsp;</span>
            </span>
          </span>
        </div>
      </div>
    </div>
    <div class="container">
      <div class="row justify-content-starts gy-3">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>

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
  methods: {
    collectTags() {
      // Generate tag mapping between unique tags and badge colors
      const tagMap = new Map();
      let index = 0;

      this.$children.forEach((child) => {
        if (child.$props.disabled) return;

        child.computeTags.forEach((tag) => {
          // "tag" -> {badgeColor, children : [child], disableTag: false}
          if (!tagMap.has(tag)) {
            const color = this.badgeColors[index % this.badgeColors.length];
            const tagMapping = { badgeColor: color, children: [child] };
            tagMap.set(tag, tagMapping);
            index += 1;
          } else {
            tagMap.get(tag).children.push(child);
          }
        });
      });

      return Array.from(tagMap.entries());
    },
    collectSearchData() {
      const primitiveMap = new Map();

      this.$children.forEach((child) => {
        const tags = child.computeTags;
        const keywords = child.computeKeywords;
        const header = child.headerText;
        const searchTarget = tags.join(' ') + keywords + header;

        primitiveMap.set(searchTarget, child);
      });

      return primitiveMap;
    },
    update() {
      const regexes = this.value.split(' ')
        .filter(searchKeyword => searchKeyword !== '')
        .map(searchKeyword => searchKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .map(searchKeyword => new RegExp(searchKeyword, 'ig'));

      this.searchDataValues.forEach((child, searchTarget) => {
        if (child.$props.disabled || child.$data.disableTag) {
          return;
        }

        if (this.value === '' && !child.$props.disabled) {
          child.$data.disableCard = false;
          return;
        }

        regexes.forEach((regex) => {
          if (searchTarget.match(regex)) {
            child.$data.disableCard = false;
            return true;
          }
          child.$data.disableCard = true;
          return false;
        });
      });
    },
    updateTag(tagName) {
      if (this.selectedTags.includes(tagName)) {
        this.selectedTags = this.selectedTags.filter(tag => tag !== tagName);
      } else {
        this.selectedTags.push(tagName);
      }

      if (this.selectedTags.length === 0) {
        this.$children.forEach((child) => {
          if (child.$props.disabled) return;

          child.$data.disableTag = false;
        });
      } else {
        this.$children.forEach((child) => {
          if (child.$props.disabled) return;

          const tags = child.computeTags;
          const containsActiveTag = tags.some(tag => this.selectedTags.includes(tag));
          child.$data.disableTag = !containsActiveTag;
        });
      }
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
      badgeColors: [
        'bg-primary',
        'bg-secondary',
        'bg-success',
        'bg-danger',
        'bg-warning text-dark',
        'bg-info text-dark',
        'bg-light text-dark',
        'bg-dark',
      ],
      searchDataValues: new Map(),
    };
  },
  mounted() {
    this.isMounted = true;
    this.tags = this.collectTags();
    this.searchDataValues = this.collectSearchData();
  },
};

</script>

<style scoped>
    .header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 0;
        padding: 0;
    }

    .search-bar {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin: 0;
        padding: 5px;
        width: 50%;

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

    .tag-container {
        display: flex;
        flex-direction: row;
        width: 50%;
        text-align: right
    }

    .tag-badge-container {
        display: flex;
        flex-flow: row wrap;
        width: 100%;
    }

    .tag-badge-container > span {
        margin: 2px;
        cursor: pointer;
    }

    .tag-indicator {
        width: 18px;
        height: 100%;
    }
</style>
