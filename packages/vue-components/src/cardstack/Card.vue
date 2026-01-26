<template>
  <div v-show="!computeDisabled" :class="`col-md-${computedBlock}`">
    <div class="card">
      <div class="card-body article-container" :style="computedWidth">
        <div
          v-if="hasHeader"
          ref="header"
          class="card-title"
        >
          <h6>
            <slot name="header"></slot>
          </h6>
        </div>
        <div class="card-text">
          <slot></slot>
        </div>
        <br />
        <div v-if="hasTag" class="key-container">
          <span class="keyword-container">
            <em>{{ computeKeywords }}</em>
          </span>
          <span
            v-for="(key, index) in exposedTags"
            :key="index"
            :class="['badge', key[1].badgeColor, 'tag-container']"
          >
            {{ key[0] }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import $ from '../utils/NodeList';

export default {
  props: {
    tag: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    keywords: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      isMounted: false,
      disableCard: false,
      exposedTags: [],
      headerText: '',
      hasHeader: true,
      disableTag: false,
      cardStack: null,
    };
  },
  components: {
  },
  inject: ['cardStackRef'], // Inject the ref
  computed: {
    computedWidth() {
      const block = this.$parent.$props.blocks;
      return `${100 / block}%`;
    },
    computedBlock() {
      const allowedBlocks = [6, 4, 3, 2, 1];
      const block = this.$parent.$props.blocks;
      const parseBlock = allowedBlocks.find(value => value <= block) || 1;
      return Math.floor(12 / parseBlock);
    },
    computeDisabled() {
      const isEmptyContent = this.$slots.header === undefined && this.$slots.default === undefined;
      return this.disabled || this.disableCard || isEmptyContent || this.disableTag;
    },
    computeTags() {
      const tagSet = new Set();
      if (this.tag !== '') {
        this.tag.split(',')
          .map(tag => tag.trim())
          .filter(tag => tag !== '')
          .forEach(tag => tagSet.add(tag));
      }

      return (!this.disabled && this.tag !== '') ? Array.from(tagSet) : [];
    },
    computeHeaders() {
      let headers = '';
      $(this.$refs.header).forEach((element) => {
        if (element.innerText !== undefined && element.innerText !== '') {
          headers += element.innerText;
        }
      });
      return headers;
    },
    formatTags() {
      // Retrieves tags with styling from parent and returns tags relevant to cards
      const allTags = this.cardStack.tagMapping;
      return allTags.filter(tag => this.computeTags.includes(tag[0]));
    },
    computeKeywords() {
      const parseKeywords = this.keywords.split(',').map(keyword => keyword.trim());
      return parseKeywords.join(', ');
    },
    hasTag() {
      return !!this.tag;
    },
  },
  methods: {
  },
  mounted() {
    this.cardStack = this.cardStackRef;
    this.isMounted = true;
    this.headerText = this.computeHeaders;
    this.hasHeader = this.headerText !== '';

    this.cardStack.updateRawTags(this.computeTags);
    this.cardStack.updateTagMapping();
    this.cardStack.children.push(this);
    this.cardStack.updateSearchData();
    this.exposedTags = this.formatTags;
  },
};
</script>

<style scoped>
    .card {
        height: 100%;
    }

    .card-body {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .key-container {
        margin-top: auto;
        width: 100%;
        height: auto;
        display: inline-block;
        overflow: hidden;
    }

    .keyword-container {
        color: grey;
        font-size: 12px;
    }

    .key-container > span {
        margin-right: 5px;
    }
</style>
