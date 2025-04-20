<template>
  <div>
    <div v-if="hasBottomText && hasLabel" class="legend-wrapper">
      <div class="text-header">
        {{ computedBottomHeader }}
      </div>
      <div v-if="hasContent">
        <slot name="content"></slot>
      </div>
    </div>

    <div class="annotate-point">
      <div v-if="isMounted" class="popover-annotation">
        <div :style="pointPosition">
          <v-popover
            v-if="isMounted"
            :placement="placement"
            :delay="0"
            :triggers="triggers"
            :popper-triggers="triggers"
            :hide-triggers="triggers"
            :distance="computeDistance"
            :disabled="!hasPopover"
            :skidding="computeSkidding"
            :arrow-padding="computeArrowPadding"
            shift-cross-axis
          >
            <div class="hover-wrapper">
              <div class="element-wrapper">
                <slot>
                  <button class="hover-point" :style="pointStyle">
                  </button>
                </slot>
              </div>
              <div class="hover-label" :style="labelStyle">
                <slot name="label"></slot>
              </div>
            </div>

            <template #popper>
              <div v-if="hasContent || hasHeader" class="popover-container">
                <h3 v-if="hasHeader" class="popover-header">
                  <slot name="header"></slot>
                </h3>
                <div v-if="hasContent" class="popover-body">
                  <slot name="content"></slot>
                </div>
              </div>
            </template>
          </v-popover>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { toNumber } from '../utils/utils';

export default {
  props: {
    content: {
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
    x: {
      type: String,
      default: null,
    },
    y: {
      type: String,
      default: null,
    },
    color: {
      type: String,
      default: 'green',
    },
    textColor: {
      type: String,
      default: 'black',
    },
    fontSize: {
      type: String,
      default: '14',
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
    trigger: {
      type: String,
      default: 'click',
    },
  },
  data() {
    return {
      targetEl: {},
      isMounted: false,
      width: this.parentWidth,
      height: this.parentHeight,
    };
  },
  inject: ['parentWidth', 'parentHeight', 'src'],
  computed: {
    pointPosition() {
      this.computeImage(() => {
        this.width = this.parentEl.offsetWidth;
        this.height = this.parentEl.offsetHeight;
      });

      const relativeX = (this.toDecimal(this.x) - (this.size / 2 / this.width)) * 100;
      const relativeY = (this.toDecimal(this.y) - (this.size / 2 / this.height)) * 100;

      return {
        left: `${relativeX}%`,
        top: `${relativeY}%`,
        position: 'absolute',
        pointerEvents: 'all',
      };
    },
    pointStyle() {
      const cursorStyle = !this.hasPopover ? 'default' : 'pointer';

      return {
        backgroundColor: this.color,
        opacity: this.opacity,
        width: `${this.size}px`,
        height: `${this.size}px`,
        cursor: cursorStyle,
      };
    },
    labelStyle() {
      return {
        fontSize: `${Math.min(this.fontSize, this.size)}px`,
        color: this.textColor,
      };
    },
    triggers() {
      return this.trigger.split(' ');
    },
    computeDistance() {
      if (this.placement === 'top') {
        return toNumber(this.size * (2 / 3));
      }
      return toNumber(this.size / 10);
    },
    computeSkidding() {
      if (this.placement === 'left' || this.placement === 'right') {
        return -toNumber(this.size / 4);
      }
      return 0;
    },
    computeArrowPadding() {
      if (this.placement === 'left' || this.placement === 'right') {
        return toNumber(this.size / 2);
      }
      return 0;
    },
    hasHeader() {
      return !!this.$slots.header;
    },
    hasContent() {
      return !!this.$slots.content;
    },
    hasWidth() {
      return this.width !== '';
    },
    hasHeight() {
      return this.height !== '';
    },
    hasLabel() {
      return !!this.$slots.label;
    },
    hasBottomText() {
      return this.legend === 'bottom' || this.legend === 'both';
    },
    hasPopover() {
      return (this.hasContent || this.hasHeader) && (this.legend === 'popover' || this.legend === 'both');
    },
    computedBottomHeader() {
      const labelSlotContent = this.$slots.label?.();
      const headerSlotContent = this.$slots.header?.();

      const labelText = labelSlotContent?.[0]?.children;
      const labelHeader = headerSlotContent?.[0]?.children;

      if (labelText === undefined && labelHeader !== undefined) { // Label is not defined
        return labelHeader;
      }
      if (labelText !== undefined && labelHeader === undefined) { // Header is not defined
        return labelText;
      }

      return `${labelText}: ${labelHeader}`;
    },
  },
  methods: {
    // This methods takes in a callback and only runs it when the image is loaded.
    // Which allows for computation of image size.
    computeImage(callback) {
      const image = new Image();
      image.onload = function () {
        callback();
      };
      image.src = this.src;
    },
    toDecimal(percent) {
      return parseFloat(percent) / 100;
    },
  },
  mounted() {
    this.targetEl = this.$el;
    this.isMounted = true;
    this.parentEl = this.$el.parentElement.parentElement.querySelector('.annotate-image');
  },
};
</script>

<style>
    .annotate-point {
        pointer-events: none;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
    }

    .popover-annotation {
        position: absolute;
        width: 100%;
        height: 100%;
    }

    .hover-point {
        border-radius: 50%;
        border-style: solid;
        border-width: 1px;
        z-index: 1;
    }

    .hover-label {
        position: absolute;
        pointer-events: none;
        z-index: 2;
        text-align: center;
    }

    .hover-label > * {
        margin: 0;
    }

    .element-wrapper > * {
        position: relative;
        z-index: 1;
        cursor: pointer;
    }

    .hover-wrapper {
        z-index: 0;
        background: transparent;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    .legend-wrapper {
        height: 100%;
        position: relative;
    }

    .text-header {
        font-size: 1.1em;
        font-weight: 500;
        margin-top: 1em;
    }
</style>
