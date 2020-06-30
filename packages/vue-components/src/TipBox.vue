<template>
    <div class="alert box-container" :class="[boxStyle, addClass, lightStyle, seamlessStyle, noBackgroundStyle, noBorderStyle]" :style="customStyle">
        <div v-if="headerBool" :class="['box-header-wrapper', { 'alert-dismissible': dismissible }]">
            <div v-show="hasIcon" class="icon-wrapper" :class="[iconStyle]">
                <slot name="icon">
                    <span v-html="iconType"></span>
                </slot>
            </div>
            <div class="box-header">
                <slot name="_header"></slot>
            </div>
            <button v-show="dismissible" type="button" class="close close-with-heading" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div v-if="horizontalDividerBool" class="horizontal-divider" :class="boxStyle" aria-hidden="true"></div>
        <div :class="['box-body-wrapper', { 'alert-dismissible': dismissible && !headerBool, 'box-body-wrapper-with-heading': headerBool }]">
            <div v-show="hasIcon && !headerBool" class="icon-wrapper" :class="[iconStyle]">
                <slot name="icon">
                    <span v-html="iconType"></span>
                </slot>
            </div>
            <div v-if="verticalDividerBool" class="vertical-divider" :class="boxStyle" aria-hidden="true"></div>
            <div class="contents" :class="[fontBlack, seamlessStyle]">
                <slot></slot>
            </div>
            <button v-show="dismissible && !headerBool" type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    </div>
</template>

<script>

  export default {
    props: {
      dismissible: {
        type: Boolean,
        default: false
      },
      backgroundColor: {
        type: String,
        default: null
      },
      borderColor: {
        type: String,
        default: null
      },
      borderLeftColor: {
        type: String,
        default: null
      },
      color: {
        type: String,
        default: null
      },
      icon: {
        type: String,
        default: null
      },
      iconSize: {
        type: String,
        default: null
      },
      type: {
        type: String,
        default: 'none'
      },
      addClass: {
        type: String,
        default: ''
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
      }
    },
    computed: {
      isSeamless() {
        return !this.light && this.seamless;
      },
      verticalDividerBool() {
        return this.isSeamless && !this.headerBool;
      },
      horizontalDividerBool() {
          return this.isSeamless && this.headerBool;
      },
      headerBool() {
        return !!this.$slots._header;
      },
      boxStyle() {
        switch (this.type) {
          case 'warning':
            return 'alert-warning'
          case 'info':
          case 'definition':
            return 'alert-info'
          case 'success':
          case 'tip':
            return 'alert-success'
          case 'important':
          case 'wrong':
            return 'alert-danger'
          default:
            return 'alert-default'
        }
      },
      lightStyle() {
        if (this.light) {
          switch (this.type) {
            case 'warning':
              return 'border-warning text-warning alert-border-left';
            case 'info':
            case 'definition':
              return 'border-info text-info alert-border-left';
            case 'success':
            case 'tip':
              return 'border-success text-success alert-border-left';
            case 'important':
            case 'wrong':
              return 'border-danger text-danger alert-border-left';
            default:
              return 'alert-border-left';
          }
        }
        return '';
      },
      customStyle() {
        var style = {};
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
        if (this.color) {
          style.color = this.color;
        }
        return style;
      },
      seamlessStyle() {
        if (this.isSeamless) {
          return 'seamless';
        }
        return '';
      },
      fontBlack() {
        if (this.light) {
          return 'font-black';
        }
        return '';
      },
      hasIcon() {
        // this.$slots.icon is either undefined or an object
        const isIconSlotFilled = !!this.$slots.icon;
        return !this.noIcon || isIconSlotFilled;
      },
      iconType() {
        switch (this.type) {
          case 'wrong':
            return '<i class="fas fa-times"></i>';
          case 'warning':
            return '<i class="fas fa-exclamation"></i>';
          case 'info':
            return '<i class="fas fa-info"></i>';
          case 'success':
            return '<i class="fas fa-check"></i>';
          case 'important':
            return '<i class="fas fa-flag"></i>';
          case 'tip':
            return '<i class="fas fa-lightbulb"></i>';
          case 'definition':
            return '<i class="fas fa-atlas"></i>';
          default:
            return '';
        }
      },
      iconStyle() {
        if (this.iconSize) {
          return `fa-${this.iconSize}`;
        }
        return '';
      },
      noBackgroundStyle() {
        if (this.noBackground) {
          return 'no-background';
        }
        return '';
      },
      noBorderStyle() {
        if (this.noBorder) {
          return 'no-border';
        }
        return '';
      }
    }
  }
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
        padding: 0.28em 1.25rem;
        border-radius: 6px 6px 0 0;
    }

    .box-body-wrapper {
        display: flex;
        flex-direction: row;
        width: 100%;
        padding: 0.75rem 1.25rem;
    }

    .box-container.seamless > .box-body-wrapper {
        padding: 0.75rem 0.5rem;
    }

    .box-container.seamless {
        background-color: transparent;
        border-color: transparent;
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
        display: flex;
        justify-content: center;
        margin-right: .5em;
        min-width: 1em;
    }

    .close-with-heading {
        top: auto;
        padding: 0 1.25rem;
    }

    .close-with-heading > span {
        vertical-align: text-top;
    }

    .contents {
        padding: 0 6px;
        width: 100%;
    }

    .contents.seamless {
        padding-left: 12px;
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
        border-width: 0px 0px 0px 5px;
    }

    .font-black {
        color: #24292e;
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
