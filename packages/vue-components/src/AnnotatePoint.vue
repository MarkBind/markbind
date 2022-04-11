<template>
  <span
    v-if="isMounted"
    class="popover-annotation"
    :x="x"
    :y="y"
    :style="pointStyle"
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
      :triggers="triggers"
      :popper-triggers="triggers"
      :hide-triggers="triggers"
      :placement="placement"
      :delay="0"
      :distance="10"
      shift-cross-axis
    >
      <button
        v-if="!isInput"
        class="hover-point"
        @click.stop
      ></button>

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
import { toNumber } from './utils/utils';

export default {
  components: {
    Portal,
  },
  props: {
    header: {
      type: String,
      default: '',
    },
    trigger: {
      type: String,
      default: 'hover focus',
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
  },
  inject: ['width', 'height', 'src'],
  computed: {
    pointStyle() {
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
        left: `${this.width * this.toDecimal(this.x)}px`,
        top: `${this.height * this.toDecimal(this.y)}px`,
      };
    },
    hasHeader() {
      return this.header !== '';
    },
    triggers() {
      return this.trigger.split(' ');
    },
    hasWidth() {
      return this.width !== '';
    },
    hasHeight() {
      return this.height !== '';
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
    width: 20px;
    height: 20px;
    background: rgba(144, 144, 144, 0.25);
    border-radius: 50%;
    border-style: solid;
    border-width: 1px;
}

</style>
