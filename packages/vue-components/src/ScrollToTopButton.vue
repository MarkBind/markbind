<template>
  <div class="scroll-to-top">
    <i
      id="scroll-top-button"
      :class="[icon, iconStyle(), 'd-print-none', {'lighten': $data.lighten}]"
      :style="customStyle()"
      aria-hidden="true"
      @click="handleScrollTop()"
    >
    </i>
  </div>
</template>

<script>
export default {
  name: 'ScrollToTopButton.vue',
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
    customStyle() {
      const style = {};
      if (this.visible) {
        style.display = 'block';
      } else {
        style.display = 'none';
      }
      if (this.iconColor) {
        style.color = this.iconColor;
      }
      return style;
    },
    handleScrollTop() {
      document.body.scrollIntoView({ block: 'start', behavior: 'smooth' });
    },
    iconStyle() {
      let iconStyle = '';
      if (this.iconSize) {
        iconStyle += `fa-${this.iconSize}`;
      }
      return iconStyle;
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
  .scroll-to-top {
    position: fixed;
    bottom: 2%;
    right: 2%;
  }
</style>
