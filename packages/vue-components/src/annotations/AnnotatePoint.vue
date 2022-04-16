<template>
  <div class="annotate-point">
    <span
      v-if="isMounted"
      class="popover-annotation"
      :style="pointPosition"
    >
      <portal v-if="targetEl.id" :to="'popover:' + targetEl.id">
        <h3 v-if="hasHeader" class="popover-header">
          <slot name="header"></slot>
        </h3>
        <div class="popover-body">
          <slot name="body"></slot>
        </div>
      </portal>

      <v-dropdown
        v-if="isMounted"
        :placement="placement"
        :delay="0"
        :triggers="triggers"
        :popper-triggers="triggers"
        :hide-triggers="triggers"
        :distance="computeDistance"
        :disabled="!hasPopover"
        shift-cross-axis
      >
        <span
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
              {{ content }}
            </div>
          </div>
        </template>
      </v-dropdown>
    </span>
    <span v-if="hasBottomText && hasLabel" class="legend-wrapper">
      <h5 class="text-header">
        {{ computedBottomHeader }}
      </h5>
      <div>
        {{ content }}
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
    trigger: {
      type: String,
      default: 'click',
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
      // eslint-disable-next-line no-restricted-globals
      const screenWidth = screen.width;
      this.computeImage((width, height, aspectRatio) => {
        if (!this.hasWidth && this.hasHeight) {
          this.width = Math.round(this.height * aspectRatio);
        }
        if (this.hasWidth && !this.hasHeight) {
          this.height = Math.round(this.width / aspectRatio);
        }
        if (!this.hasWidth && !this.hasHeight) {
          this.width = width;
          this.height = height;
        }
        if (this.width > screenWidth) {
          this.width = screenWidth;
          this.height = Math.round(this.width / aspectRatio);
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
    triggers() {
      return this.trigger.split(' ');
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
      return this.legend === 'bottom' || this.legend === 'both';
    },
    hasPopover() {
      return this.legend === 'popover' || this.legend === 'both';
    },
    computedBottomHeader() {
      if (this.label !== '' && this.header === '') {
        return this.label;
      }
      if (this.label === '' && this.header !== '') {
        return this.header;
      }
      return `${this.label}: ${this.header}`;
    },
  },
  methods: {
    computeImage(callback) {
      const image = new Image();
      image.onload = function () {
        const aspectRatio = this.width / this.height;
        callback(this.width, this.height, aspectRatio);
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
  },
};
</script>

<style>
    .annotate-point {
        margin-top: 1rem;
    }

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
