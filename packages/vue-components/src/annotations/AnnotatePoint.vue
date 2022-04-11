<template>
  <span
    v-if="isMounted"
    class="popover-annotation"
    :x="x"
    :y="y"
    :style="pointPosition"
  >
    <portal v-if="targetEl.id" :to="'popover:' + targetEl.id">
      <h3 v-if="hasHeader" class="popover-header">
        <slot name="header"></slot>
      </h3>
      <div class="popover-body">
        <slot name="content"></slot>
      </div>
    </portal>

    <v-dropdown
      v-if="isMounted"
      :placement="placement"
      :delay="0"
      :distance="24"
      shift-cross-axis
    >
      <span
        v-if="!isInput"
        class="hover-wrapper"
        @click.stop
      >
        <button
          class="hover-point"
          :style="pointStyle"
        >
        </button>
        <span class="hover-annotation">{{ annotation }}</span>
      </span>

      <template #popper>
        <div class="popover-container">
          <h3 v-if="hasHeader" class="popover-header">
            {{ header }}
          </h3>
          <div class="popover-body">
            <slot></slot>
          </div>
        </div>
      </template>
    </v-dropdown>
  </span>
</template>

<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import { Portal } from 'portal-vue';

export default {
  components: {
    Portal,
  },
  props: {
    header: {
      type: String,
      default: '',
    },
    placement: {
      type: String,
      default: 'top',
    },
    effect: {
      type: String,
      default: 'float',
    },
    x: {
      type: String,
      default: '0',
    },
    y: {
      type: String,
      default: '0',
    },
    color: {
      type: String,
      default: 'green',
    },
    opacity: {
      type: String,
      default: '0.3',
    },
    size: {
      type: String,
      default: '40',
    },
    annotation: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      targetEl: {},
      isMounted: false,
      width: this.width,
      height: this.height,
      src: this.src,
    };
  },
  inject: ['width', 'height', 'src'],
  computed: {
    pointPosition() {
      this.computeImage((width, height, ar) => {
        if (!this.hasWidth && this.hasHeight) {
          this.width = Math.round(this.height * ar);
        }
        if (this.hasWidth && !this.hasHeight) {
          this.height = Math.round(this.width / ar);
        }
        if (!this.hasWidth && !this.hasHeight) {
          this.width = width;
          this.height = height;
        }
      });
      return {
        left: `${this.width * this.toDecimal(this.x) - this.size}px`,
        top: `${this.height * this.toDecimal(this.y) - this.size}px`,
      };
    },
    pointStyle() {
      return {
        backgroundColor: this.color,
        opacity: this.opacity,
        width: `${this.size}px`,
        height: `${this.size}px`,
      };
    },
    hasHeader() {
      return this.header !== '';
    },
    hasWidth() {
      return this.width !== '';
    },
    hasHeight() {
      return this.height !== '';
    },
  },
  methods: {
    computeImage(callback) {
      const image = new Image();
      image.onload = function () {
        const ar = this.width / this.height;
        callback(this.width, this.height, ar);
      };
      image.src = this.src;
    },
    sendDataToCanvas() {
      this.$emit('data', { x: this.x, y: this.y, text: this.text });
    },
    toDecimal(percent) {
      return parseFloat(percent) / 100;
    },
  },
  mounted() {
    this.targetEl = this.$el;
    this.sendDataToCanvas();
    this.isMounted = true;
    this.isInput = this.$slots.default && this.$slots.default.some(node => node.tag === 'input');
  },
};
</script>

<style>
.popover-annotation {
    position: absolute;
    width: 100%;
    height: 100%;
}

.hover-point {
    border-radius: 50%;
    border-style: solid;
    border-width: 1px;
    z-index: 2;
}

.hover-annotation {
    position: absolute;
    pointer-events: none;
    z-index: 1;
}

.hover-wrapper {
    z-index: 0;
    background: transparent;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
</style>
