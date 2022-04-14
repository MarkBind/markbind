<template>
  <div :class="['image-wrapper', addClass]">
    <div v-if="isPointType()" class="point-container">
      <img
        ref="pic"
        :src="src"
        :alt="alt"
        :width="computedWidth"
        class="point-image "
        @load.once="computeWidth"
      />
      <span class="point-wrapper">
        <slot></slot>
      </span>
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
  },
  data() {
    return {
      widthFromHeight: '',
    };
  },
  methods: {
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
    .point-container {
        position: relative;
        width: 100%;
        height: 100%;
    }

    .point-image {
        position: absolute;
    }

    .point-wrapper {
        position: absolute;
    }

    .image-wrapper {
        display: inline-block;
        text-align: center;
        padding: 4px;
    }

    .image-caption {
        display: block;
    }

    .image-container {
        position: relative;
        width: 100%;
    }

    .image-canvas {
        max-width: 100%;
        height: auto;
    }
</style>
