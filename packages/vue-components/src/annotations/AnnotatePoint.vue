<template>
  <div>
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
        :distance="computeDistance"
        :disabled="!hasPopover"
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
          <span class="hover-label">{{ label }}</span>
        </span>

        <template #popper>
          <div class="popover-container">
            <h3 v-if="hasHeader" class="popover-header">
              {{ header }}
            </h3>
            <div class="popover-body">
              {{ body }}
            </div>
          </div>
        </template>
      </v-dropdown>
    </span>
    <span v-if="hasBottomText && hasLabel">
      <h5 class="text-header">
        {{ computeBottomText() }}
      </h5>
      <div>
        {{ body }}
      </div>
    </span>
  </div>
</template>

<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import { Portal } from 'portal-vue';

export default {
  components: {
    Portal,
  },
  props: {
    body: {
      type: String,
      default: '',
    },
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
    label: {
      type: String,
      default: '',
    },
    legend: {
      type: String,
      default: 'popover',
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
        left: `${this.width * this.toDecimal(this.x) - this.size / 2}px`,
        top: `${this.height * this.toDecimal(this.y) - this.size / 2}px`,
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
    computeDistance() {
      return this.size * (2 / 3);
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
    hasLabel() {
      return this.label !== '';
    },
    hasBottomText() {
      return this.isBottomText();
    },
    hasPopover() {
      return this.isPopover();
    },
  },
  methods: {
    isBottomText() {
      return this.legend === 'bottom' || this.legend === 'both';
    },
    isPopover() {
      return this.legend === 'popover' || this.legend === 'both';
    },
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
    computeBottomText() {
      if (this.label !== '' && this.header === '') {
        return this.label;
      }
      if (this.label === '' && this.header !== '') {
        return this.header;
      }
      return `${this.label}: ${this.header}`;
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
    }

    .hover-point {
        border-radius: 50%;
        border-style: solid;
        border-width: 1px;
        z-index: 2;
    }

    .hover-label {
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
