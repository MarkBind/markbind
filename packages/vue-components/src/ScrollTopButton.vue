<template>
  <div
    :class="['scroll-top-button', getIconSize(), 'd-print-none', {'lighten': $data.isLighten}]"
    :style="iconStyle()"
    aria-hidden="true"
    @click="handleScrollTop()"
  >
    <slot name="icon">
      <i :class="['fas fa-arrow-circle-up']"></i>
    </slot>
  </div>
</template>

<script lang="ts">
export default {
  name: 'ScrollTopButton',
  props: {
    icon: {
      type: String,
      default: null,
    },
    iconSize: {
      type: String,
      default: 'lg',
    },
    iconColor: {
      type: String,
      default: null,
    },
    bottom: {
      type: String,
      default: null,
    },
    right: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      isVisible: false,
      isLighten: false,
      timers: {
        showOrHideButtonTimer: 0,
        lightenButtonTimer: 0,
      },
    };
  },
  methods: {
    initScrollTopButton() {
      window.addEventListener('scroll', this.promptScrollTopButton);
    },
    destroyScrollTopButton() {
      window.removeEventListener('scroll', this.promptScrollTopButton);
    },
    promptScrollTopButton() {
      this.resetScrollTopButton();
      this.showOrHideScrollTopButton();
    },
    resetScrollTopButton() {
      clearTimeout(this.timers.showOrHideButtonTimer);
      clearTimeout(this.timers.lightenButtonTimer);
      this.isLighten = false;
    },
    showOrHideScrollTopButton() {
      this.timers.showOrHideButtonTimer = setTimeout(() => {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
          this.isVisible = true;
          this.lightenScrollTopButton();
        } else {
          this.isVisible = false;
        }
      }, 100);
    },
    lightenScrollTopButton() {
      // lightens the scroll-top-button after 1 second of button inactivity
      // prevents the button from obscuring the content
      this.timers.lightenButtonTimer = setTimeout(() => {
        if (!this.isLighten) {
          this.isLighten = true;
        }
      }, 1000);
    },
    iconStyle() {
      const style = {};
      style.display = this.isVisible ? 'block' : 'none';
      if (this.iconColor) {
        style.color = this.iconColor;
      }
      style.bottom = this.bottom ? this.bottom : '2%';
      style.right = this.right ? this.right : '2%';
      style.position = 'fixed';
      return style;
    },
    handleScrollTop() {
      document.body.scrollIntoView({ block: 'start', behavior: 'smooth' });
    },
    getIconSize() {
      return this.iconSize ? `fa-${this.iconSize}` : '';
    },
  },
  mounted() {
    this.initScrollTopButton();
  },
  beforeUnmount() {
    this.destroyScrollTopButton();
  },
};
</script>

<style>
    .scroll-top-button {
        display: none;
        position: fixed;
        bottom: 20px;
        right: 30px;
        z-index: 99;
        cursor: pointer;
        opacity: 0.4;
        transition-property: opacity;
        transition-duration: 0.25s;
    }

    .scroll-top-button.lighten {
        opacity: 0.15;
    }

    /*
      Media query to prevent button hover effect on devices
      that do not have hover capabilities. This is to
      prevent button opacity style from getting 'stucked'
      due to button hover on mobile view.
    */
    @media (hover: hover) {
        .scroll-top-button:hover {
            opacity: 0.7;
        }
    }

    .scroll-top-button:active {
        opacity: 1;
    }
</style>
