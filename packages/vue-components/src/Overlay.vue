<template>
  <div>
    <span
      :class="[{ 'nav-menu-close-icon': show }]"
      @click="toggleNavMenu"
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
    toggleNavMenu(ev) {
      if (ev.target.tagName.toLowerCase() === 'a' || this.show) {
        document.body.style.removeProperty('overflow');
        this.show = false;
      } else {
        publish('closeOverlay');
        // to prevent scrolling of the body when overlay is overscrolled
        document.body.style.overflow = 'hidden';
        this.show = true;
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

    .nav-menu-close-icon > span::before {
        content: "\e014" !important;
    }

    .nav-menu-open {
        display: block !important;
        width: 100% !important;
        background: #fff;
        height: 100%;
        clear: both;
    }
</style>
