<template>
  <div v-show="!computeDisabled" :class="`col-md-${computedBlock}`">
    <div class="article-container" :style="computedWidth">
      <div class="card-header-container">
        <slot name="header"></slot>
      </div>
      <div class="card-content-container">
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
</template>

<script>
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
  },
};

</script>

<style scoped>
    .article-container {
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        border-style: solid;
        border-color: rgb(228 228 228);
        border-width: 0.1px;
        height: 100%;
        padding: 10px;
        background-color: white;
        border-radius: 8px;
    }

    .card-content-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        margin: 0;
        padding: 0;
        width: 100%;
        word-break: break-word;
    }

    .card-header-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        top: 10;
        width: 100%;
        margin: 0;
        padding: 0;
    }

    .tag-container {
        margin-top: auto;
        width: 100%;
        height: auto;
        display: inline-block;
        overflow: hidden;
    }

    .tag-container > span {
        margin-right: 5px;
    }
</style>
