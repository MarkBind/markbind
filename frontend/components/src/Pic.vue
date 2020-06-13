<template>
    <div :class="['image-wrapper', addClass]">
        <img ref="pic" @load.once="computeWidth" :src="src" :alt="alt" :width="computedWidth" class="img-fluid rounded">
        <div class="image-caption">
            <slot></slot>
        </div>
    </div>
</template>

<script>
  import {toNumber} from './utils/utils.js'

  export default {
    props: {
      src: {
        type: String
      },
      alt: {
        type: String
      },
      height: {
        type: String,
        default: ''
      },
      width: {
        type: String,
        default: ''
      },
      addClass: {
        type: String,
        default: ''
      }
    },
    computed: {
      hasWidth () {
        return this.width !== '';
      },
      hasHeight () {
        return this.height !== '';
      },
      computedWidth () {
        if (this.hasWidth) {
          return this.width;
        }
        return this.widthFromHeight;
      }
    },
    data () {
      return {
        widthFromHeight: '',
      }
    },
    methods: {
      computeWidth() {
        if (!this.hasWidth && this.hasHeight) {
          const renderedImg = this.$refs.pic;
          const imgHeight = renderedImg.naturalHeight;
          const imgWidth = renderedImg.naturalWidth;
          const aspectRatio = imgWidth / imgHeight;
          this.widthFromHeight = Math.round(toNumber(this.height) * aspectRatio).toString();
        }
      }
    }
  }
</script>

<style>
    .image-wrapper {
        display: inline-block;
        text-align: center;
        padding: 4px;
    }
</style>
