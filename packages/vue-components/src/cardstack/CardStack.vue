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
        v-if="displaySelectAll"
        class="badge tag-badge select-all-toggle"
        @click="toggleAllTags"
      >
        <span class="badge bg-light text-dark tag-indicator">
          <span v-if="allSelected">✓</span>
          <span v-else>&nbsp;&nbsp;&nbsp;</span>
        </span>
        Select All
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
import {
  MIN_TAGS_FOR_SELECT_ALL, BADGE_COLOURS, isBootstrapColor, getTextColor, normalizeColor,
} from '../utils/colors';
import { unescapeHTML } from '../utils/utils';

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
    showSelectAll: {
      type: [Boolean, String],
      default: true,
    },
  },
  computed: {
    allSelected() {
      return this.selectedTags.length === this.cardStackRef.tagMapping.length;
    },
    displaySelectAll() {
      const isEnabled = String(this.$props.showSelectAll).toLowerCase() !== 'false';
      const hasEnoughTags = this.cardStackRef.tagMapping.length > MIN_TAGS_FOR_SELECT_ALL;
      return isEnabled && hasEnoughTags;
    },
  },
  watch: {
    'cardStackRef.tagMapping': {
      handler(newMapping) {
        // Initialise the selectedTags with all tag names when loading for the first time
        if (this.selectedTags.length === 0 && newMapping.length > 0) {
          this.selectedTags = newMapping.map(key => key[0]);
          this.cardStackRef.selectedTags = this.selectedTags;
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
      this.cardStackRef.searchTerms = this.value.split(' ').filter(term => term !== '');
    },
    updateTag(tagName) {
      if (this.selectedTags.includes(tagName)) {
        this.selectedTags = this.selectedTags.filter(tag => tag !== tagName);
      } else {
        this.selectedTags.push(tagName);
      }
      // Update the shared state so children react
      this.cardStackRef.selectedTags = [...this.selectedTags];
    },
    showAllTags() {
      const allTags = this.cardStackRef.tagMapping.map(key => key[0]);
      this.selectedTags = allTags;
      this.cardStackRef.selectedTags = [...allTags];
    },
    hideAllTags() {
      this.selectedTags = [];
      this.cardStackRef.selectedTags = [];
    },
    computeShowTag(tagName) {
      return this.selectedTags.includes(tagName);
    },
    toggleAllTags() {
      const allTags = this.cardStackRef.tagMapping.map(key => key[0]);
      if (this.selectedTags.length === allTags.length) {
        this.selectedTags = [];
        this.hideAllTags();
      } else {
        this.selectedTags = allTags;
        this.showAllTags();
      }
    },
    isBootstrapColor,
    getTextColor,
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
        searchTerms: [],
        selectedTags: [],
        searchData: new Map(),
        component: null, // Will be set to the component instance
        updateTagMapping() {
          const tags = this.rawTags;
          const tagMap = new Map();
          let index = 0;

          // First, parse custom tag configs if provided
          let customConfigs = [];
          try {
            const configSource = this.component?.dataTagConfigs || this.component?.tagConfigs;
            if (configSource && configSource !== '') {
              const decodedConfig = unescapeHTML(configSource);
              // The prop might be double-stringified, so parse once or twice
              let parsed = decodedConfig;
              // eslint-disable-next-line lodash/prefer-lodash-typecheck
              for (let i = 0; i < 2 && typeof parsed === 'string'; i += 1) {
                parsed = JSON.parse(parsed);
              }
              customConfigs = parsed;
            }
          } catch (e) {
            // If parsing fails, continue with default behavior
            // eslint-disable-next-line no-console
            console.warn('Failed to parse tag-configs:', e);
          }

          const customConfigMap = new Map();
          customConfigs.forEach((config) => {
            customConfigMap.set(config.name, config);
          });

          // Process tags in the order specified in customConfigs first
          customConfigs.forEach((config) => {
            if (tags.includes(config.name)) {
              const color = normalizeColor(config.color) || BADGE_COLOURS[index % BADGE_COLOURS.length];
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
  created() {
    this.cardStackRef.component = this;
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

    .badge.tag-badge.select-all-toggle {
        background: transparent !important;
        color: #1e1e1e !important;
        font-weight: 400;
    }

    .select-all-toggle .tag-indicator {
        margin-right: 1.5px;
    }
</style>
