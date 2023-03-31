<template>
  <div class="button-container">
    <div
      class="collapse-expand-button"
      @click="expandAll()"
    >
      <i :class="['fas fa-caret-down fa-2x']"></i>
    </div>
    <div
      class="collapse-expand-button"
      @click="collapseAll()"
    >
      <i :class="['fas fa-caret-up fa-2x']"></i>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CollapseExpandButtons',
  methods: {
    expandAll() {
      const sitenavEl = document.querySelector('.site-nav-root').parentElement;
      sitenavEl.querySelectorAll('a[href]').forEach((el) => {
        let currentEl = el.parentElement;
        while (currentEl && currentEl !== sitenavEl.parentElement) {
          if (currentEl.tagName.toLowerCase() === 'ul'
              && currentEl.classList.contains('site-nav-dropdown-container')) {
            currentEl.classList.add('site-nav-dropdown-container-open');
          }
          if (currentEl.tagName.toLowerCase() === 'div'
              && currentEl.querySelector('i')) {
            currentEl.querySelectorAll('i').forEach((e) => {
              if (e.classList.contains('site-nav-dropdown-btn-icon')) {
                e.classList.add('site-nav-rotate-icon');
              }
            });
          }
          currentEl = currentEl.parentElement;
        }
      });
    },
    collapseAll() {
      const sitenavEl = document.querySelector('.site-nav-root').parentElement;

      sitenavEl.querySelectorAll('a[href]').forEach((el) => {
        let currentEl = el.parentElement;
        while (currentEl && currentEl !== sitenavEl.parentElement) {
          if (currentEl.tagName.toLowerCase() === 'ul'
              && currentEl.classList.contains('site-nav-dropdown-container')) {
            currentEl.classList.remove('site-nav-dropdown-container-open');
          }
          if (currentEl.tagName.toLowerCase() === 'div'
              && currentEl.querySelector('i')) {
            currentEl.querySelectorAll('i').forEach((e) => {
              if (e.classList.contains('site-nav-dropdown-btn-icon')) {
                e.classList.remove('site-nav-rotate-icon');
              }
            });
          }
          currentEl = currentEl.parentElement;
        }
      });
    },
  },
};
</script>

<style>
    .button-container {
        display: flex;
        justify-content: space-evenly;
        padding: 0.75rem 0 0 0;
    }

    .collapse-expand-button {
        opacity: 0.4;
        transition: opacity 0.25s ease-in-out;
    }

    .collapse-expand-button:hover {
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.25s ease-in-out;
    }
</style>
