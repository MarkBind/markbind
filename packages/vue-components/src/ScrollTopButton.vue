<template>
  <i
    id="scroll-top-button"
    :class="[icon, getIconSize(), 'd-print-none', {'lighten': $data.lighten}]"
    :style="iconStyle()"
    aria-hidden="true"
    @click="handleScrollTop()"
  >
  </i>
</template>

<script>
export default {
  name: 'ScrollTopButton.vue',
  props: {
    icon: {
      default: 'fa fa-arrow-circle-up',
      type: String,
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
      visible: false,
      lighten: false,
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
      this.lighten = false;
    },
    showOrHideScrollTopButton() {
      this.timers.showOrHideButtonTimer = setTimeout(() => {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
          this.visible = true;
          this.lightenScrollTopButton();
        } else {
          this.visible = false;
        }
      }, 100);
    },
    lightenScrollTopButton() {
      // lightens the scroll-top-button after 1 second of button inactivity
      // prevents the button from obscuring the content
      this.timers.lightenButtonTimer = setTimeout(() => {
        if (!this.lighten) {
          this.lighten = true;
        }
      }, 1000);
    },
    iconStyle() {
      const style = {};
      if (this.visible) {
        style.display = 'block';
      } else {
        style.display = 'none';
      }
      if (this.iconColor) {
        style.color = this.iconColor;
      }
      if (this.bottom) {
        style.bottom = this.bottom;
      } else {
        style.bottom = '2%';
      }
      if (this.right) {
        style.right = this.right;
      } else {
        style.right = '2%';
      }
      style.position = 'fixed';
      return style;
    },
    handleScrollTop() {
      document.body.scrollIntoView({ block: 'start', behavior: 'smooth' });
    },
    getIconSize() {
      let iconSize = '';
      if (this.iconSize) {
        iconSize += `fa-${this.iconSize}`;
      }
      return iconSize;
    },
  },
  mounted() {
    this.initScrollTopButton();
  },
  beforeDestroy() {
    this.destroyScrollTopButton();
  },
};
</script>

<style scoped>
</style>
