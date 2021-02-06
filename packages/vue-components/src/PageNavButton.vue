<template>
  <overlay
    v-if="showPageNav"
    type="pageNav"
    fragment="page-nav"
    :src="src"
    :has-identifier="hasIdentifier"
    :get-nav-menu-content="getPageNavContent"
  >
    <span slot="navMenuIcon" :class="['glyphicon', 'toggle-page-nav-button']"></span>
  </overlay>
</template>

<script>
import $ from './utils/NodeList';

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
