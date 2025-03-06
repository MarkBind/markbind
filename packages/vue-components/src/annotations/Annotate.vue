<template>
  <div :class="['annotate-image-wrapper', addClass]">
    <img
      ref="pic"
      :src="src"
      :alt="alt"
      :width="computedWidth"
      :height="computedHeight"
      :loading="computedLoadType"
      class="annotate-image"
      @load.once="computeWidthAndHeight"
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
    lazy: {
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
    computedHeight() {
      return this.heightFromWidth;
    },
    computedLoadType() {
      return this.lazy ? 'lazy' : 'eager';
    },
  },
  data() {
    return {
      widthFromHeight: '',
      heightFromWidth: '',
    };
  },
  methods: {
    computeWidthAndHeight() {
      const renderedImg = this.$refs.pic;
      const imgHeight = renderedImg.naturalHeight;
      const imgWidth = renderedImg.naturalWidth;
      const aspectRatio = imgWidth / imgHeight;
      if (this.hasWidth) { // if width is present, overwrite the height (if any) to maintain aspect ratio
        this.heightFromWidth = Math.round(toNumber(this.width) / aspectRatio).toString();
      } else if (this.hasHeight) {
        this.widthFromHeight = Math.round(toNumber(this.height) * aspectRatio).toString();
        this.heightFromWidth = this.height;
      }
    },
  },
  provide() {
    return {
      parentWidth: this.width,
      parentHeight: this.height,
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
