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
    // during bundling, NodeList requires window object and document object but they don't exist on the server
    // since we can't use undefined variable during the bundling process, we have to create the variable
    // and only pass it in when it is available on the browser 
    $ = initNodeList(window, document);

    this.src = window.location.pathname;
    this.hasIdentifier = document.getElementById('page-nav') !== null;
    this.hasPageNav = document.getElementById('mb-page-nav') !== null;
    this.togglePageNavButton();
    $(window).on('resize', this.togglePageNavButton);
  },
  beforeDestroy() {
    $(window).off('resize', this.togglePageNavButton);
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
