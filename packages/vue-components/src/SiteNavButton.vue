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
    // during bundling, NodeList requires window object and document object but they don't exist on the server
    // since we can't use undefined variable during the bundling process, we have to create the variable
    // and only pass it in when it is available on the browser 
    $ = initNodeList(window, document);

    this.src = window.location.pathname;
    this.hasIdentifier = document.getElementById('site-nav') !== null;
    this.hasSiteNav = document.getElementsByClassName('site-nav-root').length !== 0;
    this.toggleSiteNavButton();
    $(window).on('resize', this.toggleSiteNavButton);
  },
  beforeDestroy() {
    $(window).off('resize', this.toggleSiteNavButton);
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
