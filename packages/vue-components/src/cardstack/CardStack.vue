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
        :class="['badge', isBootstrapColor(key[1].badgeColor) ? key[1].badgeColor : '', 'tag-badge']"
        :style="isBootstrapColor(key[1].badgeColor) ? {} : {
          backgroundColor: key[1].badgeColor,
          color: getTextColor(key[1].badgeColor)
        }"
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
    tagConfigs: {
      type: String,
      default: '',
    },
    dataTagConfigs: {
      type: String,
      default: '',
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
        this.showAllTags();
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
    isBootstrapColor(color) {
      // Check if the color is a Bootstrap class
      return BADGE_COLOURS.some(c => c === color);
    },
    getTextColor(backgroundColor) {
      // Simple function to determine if text should be light or dark
      // This is a basic implementation - you might want to use a more sophisticated algorithm
      if (!backgroundColor || backgroundColor.startsWith('bg-')) {
        return '#000';
      }
      // Parse hex color
      const hex = backgroundColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      // Calculate relative luminance
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5 ? '#000' : '#fff';
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

          // First, parse custom tag configs if provided
          let customConfigs = [];
          try {
            const configSource = this.$parent.dataTagConfigs || this.$parent.tagConfigs;
            if (configSource && configSource !== '') {
              // Decode HTML entities (quotes were escaped to prevent SSR warnings)
              const decodedConfig = configSource.replace(/&quot;/g, '"');
              // The prop might be double-stringified, so parse once or twice
              let parsed = decodedConfig;
              // eslint-disable-next-line lodash/prefer-lodash-typecheck
              if (typeof parsed === 'string') {
                parsed = JSON.parse(parsed);
              }
              // eslint-disable-next-line lodash/prefer-lodash-typecheck
              if (typeof parsed === 'string') {
                parsed = JSON.parse(parsed);
              }
              customConfigs = parsed;
            }
          } catch (e) {
            // If parsing fails, continue with default behavior
            // eslint-disable-next-line no-console
            console.warn('Failed to parse tag-configs:', e);
          }

          // Create a map of custom tag names to their configs
          const customConfigMap = new Map();
          customConfigs.forEach((config) => {
            customConfigMap.set(config.name, config);
          });

          // Process tags in the order specified in customConfigs first
          customConfigs.forEach((config) => {
            if (tags.includes(config.name)) {
              const color = config.color || BADGE_COLOURS[index % BADGE_COLOURS.length];
              const tagMapping = { badgeColor: color, children: [], disableTag: false };
              tagMap.set(config.name, tagMapping);
              index += 1;
            }
          });

          // Then add any remaining tags that weren't in customConfigs
          tags.forEach((tag) => {
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
