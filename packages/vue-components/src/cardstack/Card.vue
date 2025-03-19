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
        <div v-if="hasTag" class="tag-container">
          <span
            v-for="(cardTag, index) in exposedTags"
            :key="index"
            :class="['badge', cardTag[1]]"
          >
            {{ cardTag[0] }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
    };
  },
  components: {
  },
  computed: {
    computedWidth() {
      const block = this.$parent.$props.blocks;
      return `${100 / block}%`;
    },
    computedBlock() {
      const block = this.$parent.$props.blocks;
      return Math.floor(12 / block);
    },
    computeDisabled() {
      const isEmptyContent = this.$slots.header === undefined && this.$slots.default === undefined;
      return this.disabled || this.disableCard || isEmptyContent;
    },
    computeTags() {
      const tagSet = new Set();
      if (this.tag !== '') {
        this.tag.split(',')
          .map(tag => tag.trim())
          .forEach(tag => tagSet.add(tag));
      }
      return this.tag !== '' ? Array.from(tagSet) : [];
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
      // Retrieves tags with styling from parent and returns tags relevant to card
      const allTags = this.$parent.collectTags();
      return allTags.filter(tag => this.computeTags.includes(tag[0]));
    },
    computedKeywords() {
      return this.keywords ? this.keywords.split(',').map(keyword => keyword.trim()) : [];
    },
    hasTag() {
      return !!this.tag;
    },
  },
  methods: {
  },
  mounted() {
    this.isMounted = true;
    this.exposedTags = this.formatTags;
    this.headerText = this.computeHeaders;
    this.hasHeader = this.headerText !== '';
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

    .tag-container {
        margin-top: auto;
        width: 100%;
        height: auto;
        display: flex;
        display: inline-block;
        overflow: hidden;
    }

    .tag-container > span {
        margin-right: 5px;
    }
</style>
