<template>
  <div>
    <span
      :class="[{ 'nav-menu-close-icon': show }]"
      @click="toggleNavMenu"
    >
      <slot name="navMenuIcon"></slot>
    </span>
    <div ref="navMenuContainer" :class="['nav-menu', { 'nav-menu-open': show }]">
      <retriever
        v-if="hasIdentifier"
        :src="src"
        :fragment="fragment"
        @src-loaded="navMenuLoaded"
      />
      <div v-else ref="navigationMenu"></div>
    </div>
  </div>
</template>

<script>
import retriever from './Retriever.vue';
import initNodeList from './utils/NodeList';
import { publish, subscribe } from './utils/pubsub';

export default {
  components: {
    retriever,
  },
  props: {
    type: {
      type: String,
      default: null,
    },
    src: {
      type: String,
      default: null,
    },
    fragment: {
      type: String,
      default: null,
    },
    hasIdentifier: {
      type: Boolean,
      default: false,
    },
    getNavMenuContent: {
      type: Function,
      default: () => {},
    },
  },
  inject: ['toggleLowerNavbar'],
  data() {
    return {
      nodeList: {},
      show: false,
    };
  },
  methods: {
    toggleNavMenu() {
      if (!this.show) {
        publish('closeOverlay');
        // to prevent scrolling of the body when overlay is overscrolled
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.removeProperty('overflow');
      }
      this.show = !this.show;
    },
    navMenuLoaded() {
      this.toggleLowerNavbar();
      this.nodeList(this.$refs.navMenuContainer).find('a').on('click', () => {
        this.toggleNavMenu();
      });
    },
  },
  mounted() {
    /*
     * NodeList requires window and document object but they only exists on browser and not server.
     * Since webpack bundling does not allow undefined variables, we have to define the variables in NodeList
     * by passing them in arguments, and only actually passing the window and document object when they are
     * available on browser.
     */
    this.nodeList = initNodeList(window, document);

    const navMenu = this.$refs.navigationMenu;
    const buildNav = (navMenuItems) => {
      if (!navMenuItems) { return; }
      for (let i = 0; i < navMenuItems.childNodes.length; i += 1) {
        navMenu.appendChild(navMenuItems.childNodes[i].cloneNode(true));
      }
      this.navMenuLoaded();
    };

    if (!this.hasIdentifier) {
      buildNav(this.getNavMenuContent());
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
