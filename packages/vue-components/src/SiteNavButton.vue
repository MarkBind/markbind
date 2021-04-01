<template>
  <overlay
    v-if="showSiteNav"
    type="siteNav"
    fragment="site-nav"
    :src="src"
    :has-identifier="hasIdentifier"
    :get-nav-menu-content="getSiteNavContent"
  >
    <template #navMenuIcon>
      <span :class="['glyphicon', 'toggle-site-nav-button']"></span>
    </template>
  </overlay>
</template>

<script>
import initNodeList from './utils/NodeList';

export default {
  data() {
    return {
      nodeList: {},
      hasIdentifier: false,
      hasSiteNav: false,
      show: false,
      src: '',
    };
  },
  computed: {
    showSiteNav() {
      return this.show && this.hasSiteNav;
    },
  },
  methods: {
    getSiteNavContent() {
      return document.getElementsByClassName('site-nav-root')[0];
    },
    toggleSiteNavButton() {
      if (window.innerWidth < 992) {
        this.show = true;
      } else {
        this.show = false;
      }
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

    this.src = window.location.pathname;
    this.hasIdentifier = document.getElementById('site-nav') !== null;
    this.hasSiteNav = document.getElementsByClassName('site-nav-root').length !== 0;
    this.toggleSiteNavButton();
    this.nodeList(window).on('resize', this.toggleSiteNavButton);
  },
  beforeDestroy() {
    this.nodeList(window).off('resize', this.toggleSiteNavButton);
  },
};
</script>

<style scoped>
    .toggle-site-nav-button {
        cursor: pointer;
        left: 0;
        padding: 15px;
        position: absolute;
    }

    .toggle-site-nav-button::before {
        content: "\e236";
        font-size: 20px;
    }
</style>
