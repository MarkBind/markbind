<template>
  <span
    :class="['thumb-wrapper', {'thumb-circle': circle}, addClass]"
    :style="[getBorder, getFontSize, getFontColor, getBgColor]"
  >
    <img
      v-if="hasSrc"
      ref="pic"
      :src="src"
      class="thumb-image"
      :width="computedWidth"
      :height="computedHeight"
      :alt="alt"
      @load.once="computeImgSize"
    />
    <slot></slot>
  </span>
</template>

<script>
const DEFAULT_SIZE = 100;

export default {
  props: {
    circle: {
      type: Boolean,
      default: false,
    },
    addClass: {
      type: String,
      default: '',
    },
    alt: {
      type: String,
      default: '',
    },
    background: {
      type: String,
      default: '',
    },
    border: {
      type: String,
      default: '',
    },
    fontColor: {
      type: String,
      default: '',
    },
    fontSize: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: '',
    },
    src: {
      type: String,
      default: null,
    },
    text: {
      type: String,
      default: '',
    },
  },
  computed: {
    getBorder() {
      // Default is no border
      return this.border === '' ? {} : { border: this.border };
    },
    getFontSize() {
      const defaultSize = this.imageSize / 2;
      const definedSize = this.fontSize;

      return {
        'font-size': `${(definedSize === undefined || definedSize === '') ? defaultSize : definedSize}px`,
      };
    },
    getFontColor() {
      // Default is no setting (inherit)
      return this.fontColor === '' ? {} : { 'color': this.fontColor };
    },
    getBgColor() {
      // Default is no setting (inherit)
      return this.background === '' ? {} : { 'background': this.background };
    },
    hasSrc() {
      // Returns true if src is defined and is not an empty string
      return this.src !== undefined && this.src !== '';
    },
    imageSize() {
      return this.size || DEFAULT_SIZE;
    },
  },
  data() {
    return {
      computedWidth: '',
      computedHeight: '',
    };
  },
  mounted() {
    const wrapperElement = this.$el;
    wrapperElement.style.width = `${this.imageSize}px`;
    wrapperElement.style.height = `${this.imageSize}px`;
    wrapperElement.style.lineHeight = `${this.imageSize}px`;
    const img = this.$refs.pic;
    if (img && img.complete) {
      this.computeImgSize();
    }
  },
  methods: {
    computeImgSize() {
      // Scale the img within such that the cropped image is the required size
      const renderedImg = this.$refs.pic;
      const imgHeight = renderedImg.naturalHeight;
      const imgWidth = renderedImg.naturalWidth;
      const imgSize = Math.min(imgHeight, imgWidth);
      const expansionFactor = this.imageSize / imgSize;

      this.computedWidth = imgWidth * expansionFactor;
      this.computedHeight = imgHeight * expansionFactor;
    },
  },
};
</script>

<style>
    .thumb-wrapper {
        display: inline-block;
        overflow: hidden;
        position: relative;
        text-align: center;
        vertical-align: middle;
    }

    .thumb-circle {
        border-radius: 50%;
    }

    .thumb-image {
        left: 50%;
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
    }
</style>
