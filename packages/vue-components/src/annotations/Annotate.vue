<template>
  <div :class="['annotate-image-wrapper', addClass]">
    <img
      ref="pic"
      :src="src"
      :alt="alt"
      :width="computedWidth"
      class="annotate-image"
      :loading="computedLoadType"
      @load.once="getWidth"
    />
    <div style="top: 0; left: 0; height: 0;">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { toNumber } from '../utils/utils';

export default {
  props: {
    src: {
      type: String,
      default: null,
    },
    alt: {
      type: String,
      default: null,
    },
    height: {
      type: String,
      default: '',
    },
    width: {
      type: String,
      default: '',
    },
    eager: {
      type: Boolean,
      default: false,
    },
    addClass: {
      type: String,
      default: '',
    },
  },
  computed: {
    hasWidth() {
      return this.width !== '';
    },
    hasHeight() {
      return this.height !== '';
    },
    computedWidth() {
      if (this.hasWidth) {
        return this.width;
      }
      return this.widthFromHeight;
    },
    computedLoadType() {
      return this.eager ? 'eager' : 'lazy';
    },
  },
  data() {
    return {
      widthFromHeight: '',
    };
  },
  methods: {
    getWidth() {
      if (!this.hasWidth && this.hasHeight) {
        const renderedImg = this.$refs.pic;
        const imgHeight = renderedImg.naturalHeight;
        const imgWidth = renderedImg.naturalWidth;
        const imageAspectRatio = imgWidth / imgHeight;
        this.widthFromHeight = Math.round(toNumber(this.height) * imageAspectRatio).toString();
      }
    },
  },
  provide() {
    return {
      width: this.width,
      height: this.height,
      src: this.src,
    };
  },
};
</script>

<style>
    .annotate-image-wrapper {
        position: relative;
        text-align: left;
        display: inline-block;
    }

    .annotate-image {
        max-width: 100%;
        height: auto;
    }

</style>
