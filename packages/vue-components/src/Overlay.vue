<template>
  <div>
    <span
      :class="[{ 'nav-menu-close-icon': show }]"
      @click="toggleNavMenu(undefined)"
    >
      <slot name="navMenuIcon"></slot>
    </span>
    <div
      ref="navMenuContainer"
      :class="['nav-menu', { 'nav-menu-open': show }]"
      :style="navbarHeight"
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
      navbarHeight: '',
    };
  },
  methods: {
    toggleNavMenu(contentClickEvent) {
      if ((contentClickEvent && contentClickEvent.target.tagName.toLowerCase() === 'a')
          || (!contentClickEvent && this.show)) {
        document.body.style.removeProperty('overflow');
        this.show = false;
      } else {
        publish('closeOverlay');
        // to prevent scrolling of the body when overlay is overscrolled
        document.body.style.overflow = 'hidden';
        this.show = true;
        this.$nextTick(() => {
          const contentEl = this.$refs.navMenuContainer;
          const height = window.innerHeight - contentEl.getBoundingClientRect().top;
          this.navbarHeight = `height: ${height}px`;
        });
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
        padding: 0 10px 20px;
        position: absolute;
        top: 100%;
        overflow-y: auto;
    }

    .nav-menu-open {
        display: block !important;
        width: 100% !important;
        background: #fff;
        clear: both;
    }
</style>
