<template>
  <span :class="['image-wrapper', addClass]">
    <img
      ref="pic"
      :src="src"
      :alt="alt"
      :width="computedWidth"
      :height="computedHeight"
      :loading= "computedLoadType"
      class="img-fluid rounded"
      @load.once="computeWidthAndHeight"
    />
    <span class="image-caption">
      <slot></slot>
    </span>
  </span>
</template>

<script>
import { toNumber } from './utils/utils';

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
    }
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
      if (!this.hasWidth && this.hasHeight) {
        this.widthFromHeight = Math.round(toNumber(this.height) * aspectRatio).toString();
      }
      if (this.hasWidth) {
        this.heightFromWidth = Math.round(toNumber(this.width) / aspectRatio).toString();
      }
    },
  },
};
</script>

<style>
    .image-wrapper {
        display: inline-block;
        text-align: center;
        padding: 4px;
    }

    .image-caption {
        display: block;
    }
</style>
