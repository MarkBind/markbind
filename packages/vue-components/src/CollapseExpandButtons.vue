<template>
  <div class="button-container">
    <button
      type="button"
      class="btn btn-outline-dark btn-sm"
      @click="expandAll()"
    >
      Expand All
    </button>
    <button
      type="button"
      class="btn btn-outline-dark btn-sm"
      @click="collapseAll()"
    >
      Collapse All
    </button>
  </div>
</template>

<script>
export default {
  name: 'CollapseExpandButtons',
  methods: {
    expandAll() {
      let sitenavEl = this.$el;
      while (!sitenavEl.classList.contains('site-nav-root')) {
        window.console.warn(sitenavEl);
        sitenavEl = sitenavEl.parentElement;
      }
      sitenavEl.querySelectorAll('a[href]').forEach((el) => {
        let currentEl = el.parentElement;
        while (currentEl && currentEl !== sitenavEl.parentElement) {
          if (currentEl.tagName.toLowerCase() === 'ul'
              && currentEl.classList.contains('site-nav-dropdown-container')) {
            currentEl.classList.add('site-nav-dropdown-container-open');
          }
          if (currentEl.tagName.toLowerCase() === 'div'
              && currentEl.querySelector('i')) {
            currentEl.querySelectorAll('i').forEach((e) => { e.classList.add('site-nav-rotate-icon'); });
          }
          currentEl = currentEl.parentElement;
        }
      });
    },
    collapseAll() {
      let sitenavEl = this.$el;
      while (!sitenavEl.classList.contains('site-nav-root')) {
        window.console.warn(sitenavEl);
        sitenavEl = sitenavEl.parentElement;
      }

      sitenavEl.querySelectorAll('a[href]').forEach((el) => {
        let currentEl = el.parentElement;
        while (currentEl && currentEl !== sitenavEl.parentElement) {
          if (currentEl.tagName.toLowerCase() === 'ul'
              && currentEl.classList.contains('site-nav-dropdown-container')) {
            currentEl.classList.remove('site-nav-dropdown-container-open');
          }
          if (currentEl.tagName.toLowerCase() === 'div'
              && currentEl.querySelector('i')) {
            currentEl.querySelectorAll('i').forEach((e) => { e.classList.remove('site-nav-rotate-icon'); });
          }
          currentEl = currentEl.parentElement;
        }
      });
    },
  },
};
</script>

<style>
    /* Button container */

    .button-container {
        display: flex;
        justify-content: space-around;
        padding-bottom: 0.5rem;
    }
</style>
