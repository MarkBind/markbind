<template>
  <overlay
    v-if="showPageNav"
    type="pageNav"
    fragment="page-nav"
    :src="src"
    :has-identifier="hasIdentifier"
    :get-nav-menu-content="getPageNavContent"
  >
    <template #navMenuIcon>
      <span :class="['glyphicon', 'toggle-page-nav-button']"></span>
    </template>
  </overlay>
</template>

<script>
import initNodeList from './utils/NodeList';

export default {
  data() {
    return {
      nodeList: {},
      hasPageNav: false,
      hasIdentifier: false,
      show: false,
      src: '',
    };
  },
  computed: {
    showPageNav() {
      return this.show && this.hasPageNav;
    },
  },
  methods: {
    getPageNavContent() {
      const wrapper = document.createElement('div');
      const pageNavTitle = document.getElementsByClassName('page-nav-title')[0];
      const pageNavLinks = document.getElementById('mb-page-nav');
      if (pageNavTitle) {
        wrapper.appendChild(pageNavTitle.cloneNode(true));
      }
      if (pageNavLinks) {
        wrapper.appendChild(pageNavLinks.cloneNode(true));
      }
      return wrapper;
    },
    togglePageNavButton() {
      if (window.innerWidth < 1300) {
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
    this.hasIdentifier = document.getElementById('page-nav') !== null;
    this.hasPageNav = document.getElementById('mb-page-nav') !== null;
    this.togglePageNavButton();
    this.nodeList(window).on('resize', this.togglePageNavButton);
  },
  beforeDestroy() {
    this.nodeList(window).off('resize', this.togglePageNavButton);
  },
};
</script>

<style scoped>
    .toggle-page-nav-button {
        cursor: pointer;
        right: 0;
        padding: 15px;
        position: absolute;
    }

    .toggle-page-nav-button::before {
        content: "\e235";
        font-size: 20px;
    }
</style>
