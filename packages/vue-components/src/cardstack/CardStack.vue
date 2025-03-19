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
            v-for="(tag, index) in tags"
            :key="index"
            :class="['badge', tag[1]]"
            @click="update"
          >
            {{ tag[0] }}
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
      // Retrieves all child tags and returns a unique set of tags with style
      const tagSet = new Set();
      let index = 0;
      this.$children.forEach((child) => {
        if (child.$props.disabled) {
          return;
        }
        child.computeTags.forEach((tag) => {
          if (!tagSet.has(tag)) {
            const badgeColor = this.badgeColors[index % this.badgeColors.length];
            tagSet.add([tag, badgeColor]);
            index += 1;
          }
        });
      });
      return Array.from(tagSet);
    },
    collectPrimitiveData() {
      const primitiveMap = new Map();

      this.$children.forEach((child) => {
        const tags = child.computeTags;
        const keywords = child.computedKeywords;
        const header = child.headerText;
        const searchTarget = tags.join(' ') + keywords.join(' ') + header;

        primitiveMap.set(searchTarget, child);
      });

      return primitiveMap;
    },
    update() {
      // Calculated value at time of search
      const regexes = this.value.split(' ')
        .filter(searchKeyword => searchKeyword !== '')
        .map(searchKeyword => searchKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .map(searchKeyword => new RegExp(searchKeyword, 'ig'));

      this.primitiveValues.forEach((child, searchTarget) => {
        if (child.$props.disabled) {
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
  },
  data() {
    return {
      value: '',
      tags: [],
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
      primitiveValues: new Map(),
    };
  },
  mounted() {
    this.isMounted = true;
    this.tags = this.collectTags();
    this.primitiveValues = this.collectPrimitiveData();
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

</style>
