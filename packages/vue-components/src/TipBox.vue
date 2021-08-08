<template>
  <div
    :class="[
      'alert box-container',
      containerStyle(),
      addClass,
      { 'd-flex': seamlessHeaderBool() },
    ]"
    :style="customStyle()"
  >
    <!--Icon and vertical divider for seamless header box-->
    <div v-if="seamlessHeaderBool()" class="d-flex">
      <div
        v-if="iconBool()"
        :class="['icon-wrapper', iconStyle()]"
        :style="customIconColorStyle()"
      >
        <slot name="icon">
          <i :class="['fas', getFontAwesomeIconStyle()]"></i>
        </slot>
      </div>
      <div
        class="vertical-divider"
        :class="getBootstrapAlertStyle()"
        aria-hidden="true"
      ></div>
    </div>

    <div class="header-and-body">
      <!-- Header wrapper, not rendered if there is no header attribute -->
      <div
        v-if="headerBool()"
        :class="['box-header-wrapper', { 'alert-dismissible': dismissible }]"
      >
        <!-- icon on the left of the header -->
        <div
          v-if="iconBool() && !seamlessHeaderBool()"
          :class="['icon-wrapper', iconStyle()]"
          :style="customIconColorStyle()"
        >
          <slot name="icon">
            <i :class="['fas', getFontAwesomeIconStyle()]"></i>
          </slot>
        </div>

        <!-- header -->
        <div class="box-header">
          <slot name="header"></slot>
        </div>

        <!-- dismiss button to the right of the header -->
        <button
          v-if="dismissible"
          type="button"
          class="close close-with-heading"
          data-dismiss="alert"
          aria-label="Close"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <!-- Body wrapper -->
      <div
        :class="[
          'box-body-wrapper',
          {
            'alert-dismissible': dismissible && !headerBool(),
            'box-body-wrapper-with-heading': headerBool(),
          },
        ]"
      >
        <!-- icon on the left, not shown if there is a header -->
        <div
          v-if="iconBool() && !headerBool()"
          :class="['icon-wrapper', iconStyle()]"
          :style="customIconColorStyle()"
        >
          <slot name="icon">
            <i :class="['fas', getFontAwesomeIconStyle()]"></i>
          </slot>
        </div>

        <!-- Icon -- content divider for seamless boxes without the header attribute -->
        <div
          v-if="seamlessNoHeaderBool()"
          class="vertical-divider"
          :class="getBootstrapAlertStyle()"
          aria-hidden="true"
        ></div>

        <!-- Content wrapper -->
        <div class="contents" :style="customColorStyle()">
          <slot></slot>
        </div>

        <!-- dismiss button on the right, not shown if there is a header -->
        <button
          v-if="dismissible && !headerBool()"
          type="button"
          class="close"
          data-dismiss="alert"
          aria-label="Close"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { classifyBootstrapStyle } from './utils/utils';

export default {
  props: {
    dismissible: {
      type: Boolean,
      default: false,
    },
    backgroundColor: {
      type: String,
      default: null,
    },
    borderColor: {
      type: String,
      default: null,
    },
    borderLeftColor: {
      type: String,
      default: null,
    },
    color: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },
    iconSize: {
      type: String,
      default: null,
    },
    iconColor: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      default: '',
    },
    addClass: {
      type: String,
      default: '',
    },
    light: {
      type: Boolean,
      default: false,
    },
    seamless: {
      type: Boolean,
      default: false,
    },
    noIcon: {
      type: Boolean,
      default: false,
    },
    noBackground: {
      type: Boolean,
      default: false,
    },
    noBorder: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    isSeamless() {
      return !this.light && this.seamless;
    },
    seamlessNoHeaderBool() {
      return this.isSeamless() && !this.headerBool();
    },
    seamlessHeaderBool() {
      return this.isSeamless() && this.headerBool();
    },
    headerBool() {
      return !!this.$scopedSlots.header;
    },
    iconBool() {
      // this.$scopedSlots.icon is either undefined or an object
      const isIconSlotFilled = !!this.$scopedSlots.icon;
      return (!this.noIcon && this.type) || isIconSlotFilled;
    },
    containerStyle() {
      let containerStyle;

      if (this.light) {
        containerStyle = `${this.getBootstrapBorderStyle()} alert-border-left`;
      } else if (this.seamless) {
        containerStyle = 'seamless';
      } else {
        containerStyle = this.getBootstrapAlertStyle();
      }

      if (this.noBackground) {
        containerStyle += ' no-background';
      }

      if (this.noBorder) {
        containerStyle += ' no-border';
      }

      return containerStyle;
    },
    customStyle() {
      const style = {};
      if (this.backgroundColor) {
        style.backgroundColor = this.backgroundColor;
        style.borderColor = this.backgroundColor;
      }
      if (this.borderColor) {
        style.border = `1px solid ${this.borderColor}`;
      }
      if (this.borderLeftColor) {
        style.borderLeft = `5px solid ${this.borderLeftColor}`;
      }
      return style;
    },
    customColorStyle() {
      if (this.color) {
        return { color: this.color };
      }
      return {};
    },
    iconStyle() {
      let iconStyle = '';
      if (this.iconSize) {
        iconStyle += `fa-${this.iconSize}`;
      }

      if (this.light || this.seamless) {
        iconStyle += ` ${this.getBootstrapTextStyle()}`;
      }

      return iconStyle;
    },
    customIconColorStyle() {
      if (this.iconColor) {
        return { color: this.iconColor };
      }
      return {};
    },
    getBootstrapAlertStyle() {
      const { baseStyle, colorStyle } = classifyBootstrapStyle(this.type);
      if (colorStyle) {
        return `alert-${colorStyle}`;
      }
      return `alert-${baseStyle}`;
    },
    getBootstrapTextStyle() {
      const { baseStyle, colorStyle } = classifyBootstrapStyle(this.type);
      if (colorStyle) {
        return `text-${colorStyle}`;
      }
      return `text-${baseStyle}`;
    },
    getBootstrapBorderStyle() {
      const { baseStyle, colorStyle } = classifyBootstrapStyle(this.type);
      if (colorStyle) {
        return `border-${colorStyle}`;
      }
      return `border-${baseStyle}`;
    },
    getFontAwesomeIconStyle() {
      const { iconStyle } = classifyBootstrapStyle(this.type);
      switch (iconStyle) {
      case 'wrong':
        return 'fa-times';
      case 'warning':
        return 'fa-exclamation';
      case 'info':
        return 'fa-info';
      case 'success':
        return 'fa-check';
      case 'important':
        return 'fa-flag';
      case 'tip':
        return 'fa-lightbulb';
      case 'definition':
        return 'fa-atlas';
      default:
        return '';
      }
    },
  },
};
</script>

<style scoped>
    .box-container {
        width: 100%;
        padding: 0;
        border-radius: 6px;
    }

    .box-header-wrapper {
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 100%;
        padding: 0.4rem 1.25rem 0.28rem 1.25rem;
        border-radius: 6px 6px 0 0;
    }

    .box-body-wrapper {
        display: flex;
        flex-direction: row;
        width: 100%;
        padding: 0.75rem 1.25rem;
    }

    .box-container.seamless > .header-and-body > .box-body-wrapper {
        padding: 0.75rem 0.5rem;
    }

    .contents {
        padding: 0 6px;
        width: 100%;
    }

    .box-container.seamless > .header-and-body > div.box-body-wrapper > .contents {
        padding-left: 12px;
    }

    .heading {
        display: inline;
        float: right;
        font-weight: normal;
        color: inherit;
        background-color: rgba(240, 240, 240, 0.6);
        width: auto;
        padding: 3px 5px 4px 5px;
        border-width: 0;
        border-radius: 0 6px 0 6px;
        margin: -13px -27px 0 15px;
    }

    .box-body-wrapper-with-heading {
        padding-top: 0.5rem;
    }

    .alert-dismissible {
        padding-right: 4rem;
    }

    .box-header {
        font-weight: 500;
    }

    .icon-wrapper {
        display: inline;
        text-align: center;
        margin-right: 0.5em;
        min-width: 1em;
    }

    .close-with-heading {
        top: auto;
        padding: 0 1.25rem;
    }

    .close-with-heading > span {
        vertical-align: text-top;
    }

    .contents > :last-child {
        margin-bottom: 0;
    }

    .alert-default {
        color: #24292e;
        background-color: #f6f8fa;
        border-color: #e8ebef;
    }

    .alert-border-left {
        background-color: #f9f8f8;
        border-left: solid;
        border-width: 0 0 0 5px;
    }

    .vertical-divider {
        width: 4px;
    }

    .horizontal-divider {
        margin: 0 auto;
        width: calc(100% - 2.5rem);
        height: 3px;
    }

    .no-background {
        background: none;
    }

    .no-border {
        border: none;
    }
</style>

<!-- TODO move this once we upgrade vue-loader version for scoped deep selectors -->
<style>
    div.box-header > * {
        margin-bottom: 0;
    }
</style>
