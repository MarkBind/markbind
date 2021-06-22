<template>
  <div>
    <span
      @click="toggleNavMenu(undefined)"
    >
      <slot name="navMenuIcon"></slot>
    </span>
    <div
      ref="navMenuContainer"
      :class="['nav-menu', { 'nav-menu-open': show }]"
      @click="toggleNavMenu"
    >
      <portal-target :name="portalName" multiple />
    </div>
  </div>
</template>

<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import { PortalTarget } from 'portal-vue';

import { publish, subscribe } from './utils/pubsub';

export default {
  components: {
    PortalTarget,
  },
  props: {
    type: {
      type: String,
      default: null,
    },
    portalName: {
      type: String,
      default: null,
    },
  },
  inject: {
    toggleLowerNavbar: {
      default: undefined,
    },
  },
  data() {
    return {
      show: false,
    };
  },
  methods: {
    toggleNavMenu(contentClickEvent) {
      const siteNavButton = document.querySelector('.toggle-page-site-button');
      const pageNavButton = document.querySelector('.toggle-page-nav-button');

      if ((contentClickEvent && contentClickEvent.target.tagName.toLowerCase() === 'a')
          || (!contentClickEvent && this.show)) {
        document.body.style.removeProperty('overflow');
        this.show = false;

        siteNavButton.classList.remove('active');
        pageNavButton.classList.remove('active');
      } else {
        publish('closeOverlay');
        // to prevent scrolling of the body when overlay is overscrolled
        document.body.style.overflow = 'hidden';
        this.show = true;

        if (this.portalName === 'page-nav') {
          siteNavButton.classList.remove('active');
          pageNavButton.classList.add('active');
        } else if (this.portalName === 'site-nav') {
          siteNavButton.classList.add('active');
          pageNavButton.classList.remove('active');
        }
      }
    },
  },
  mounted() {
    if (this.toggleLowerNavbar) {
      this.toggleLowerNavbar();
    }

    subscribe('closeOverlay', () => { this.show = false; });
  },
};
</script>

<style scoped>
    .nav-menu {
        display: none;
        padding: 50px 10px 20px;
        position: fixed;
        overflow-y: auto;
        z-index: -1;
    }

    .nav-menu-open {
        display: block !important;
        width: 100% !important;
        background: #fff;
        height: 100%;
        clear: both;
    }
</style>
