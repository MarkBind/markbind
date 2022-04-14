<template>
  <div :class="['annotate-image-wrapper', addClass]">
    <img
      ref="pic"
      :src="src"
      :alt="alt"
      :width="computedWidth"
      class="annotate-image"
      @load.once="computeWidth"
    />
    <span class="temp">
      <slot></slot>
    </span>
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
    addClass: {
      type: String,
      default: '',
    },
    type: {
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
    imageSize() {
      let tempWidth = 0;
      let tempHeight = 0;

      this.computeImage((width, height, ar) => {
        if (!this.hasWidth && this.hasHeight) {
          tempWidth = Math.round(this.height * ar);
        }
        if (this.hasWidth && !this.hasHeight) {
          tempHeight = Math.round(this.width / ar);
        }
        if (!this.hasWidth && !this.hasHeight) {
          tempWidth = width;
          tempHeight = height;
        }
      });
      return {
        width: `${tempWidth}px`,
        height: `${tempHeight}px`,
      };
    },
  },
  data() {
    return {
      widthFromHeight: '',
    };
  },
  methods: {
    computeImage(callback) {
      const image = new Image();
      image.onload = function () {
        callback(this.width, this.height);
      };
      image.src = this.src;
    },
    isPointType() {
      return this.type === 'point';
    },
    isArrowType() {
      return this.type === 'arrow';
    },
    computeWidth() {
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
        display: flex;
        flex-direction: column;
        text-align: left;
    }

    .annotate-image {
        width: 100%;
        height: 100%;
    }

    .point-wrapper {
        position: absolute;
        top: 0;
        left: 0;
    }

</style>
