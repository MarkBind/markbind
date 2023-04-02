<template>
  <div class="button-container">
    <div
      class="expand-all-button"
      @click="expandAll()"
    >
      <i :class="['far fa-plus-square']"></i>
    </div>
    <div
      class="collapse-all-button"
      @click="collapseAll()"
    >
      <i :class="['far fa-minus-square']"></i>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CollapseExpandButtons',
  methods: {
    applyAllDropdown(el, sitenavEl, toExpand) {
      let currentEl = el.parentElement;
      while (currentEl && currentEl !== sitenavEl.parentElement) {
        if (currentEl.tagName.toLowerCase() === 'ul'
                && currentEl.classList.contains('site-nav-dropdown-container')) {
          if (toExpand) {
            currentEl.classList.add('site-nav-dropdown-container-open');
          } else {
            currentEl.classList.remove('site-nav-dropdown-container-open');
          }
        }

        if (currentEl.tagName.toLowerCase() === 'div'
            && currentEl.querySelector('i')) {
          currentEl.querySelectorAll('i').forEach((e) => {
            if (e.classList.contains('site-nav-dropdown-btn-icon')) {
              if (toExpand) {
                e.classList.add('site-nav-rotate-icon');
              } else {
                e.classList.remove('site-nav-rotate-icon');
              }
            }
          });
        }
        currentEl = currentEl.parentElement;
      }
    },
    expandAll() {
      const sitenavEl = document.querySelector('.site-nav-root').parentElement;

      sitenavEl.querySelectorAll('a[href]').forEach((el) => {
        this.applyAllDropdown(el, sitenavEl, true);
      });
    },
    collapseAll() {
      const sitenavEl = document.querySelector('.site-nav-root').parentElement;

      sitenavEl.querySelectorAll('a[href]').forEach((el) => {
        this.applyAllDropdown(el, sitenavEl, false);
      });
    },
  },
};
</script>

<style>
    /* Button Positioning */

    .button-container {
        position: absolute;
        top: 5px;
        right: 30px;
        display: flex;
        padding: 0.75rem 0 0 0;
    }

    .expand-all-button {
        margin-right: 15px;
    }

    /* Change alignment when SiteNav is hidden */
    @media screen and (max-width: 991.98px) {
        .button-container {
            top: 15px;
        }
    }

    /* Button Design */

    .collapse-all-button,
    .expand-all-button {
        opacity: 0.5;
        transition: opacity 0.25s ease-in-out;
    }

    .collapse-all-button:hover,
    .expand-all-button:hover {
        cursor: pointer;
        opacity: 0.8;
        transition: opacity 0.25s ease-in-out;
    }
</style>
