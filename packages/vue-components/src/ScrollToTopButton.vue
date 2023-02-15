<template>
  <div
    :class="['scroll-to-top']"
  >
    <i
      id="scroll-top-button"
      :class="['fa', 'fa-arrow-circle-up', 'fa-lg', 'd-print-none', {'lighten': $data.lighten}]"
      :style="customStyle()"
      aria-hidden="true"
      onclick="handleScrollTop()"
    >
    </i>
  </div>
</template>

<script>
export default {
  name: 'ScrollToTopButton.vue',
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
      return style;
    },
    handleScrollTop() {
      document.body.scrollIntoView({ block: 'start', behavior: 'smooth' });
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
