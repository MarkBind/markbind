<template>
  <overlay
    v-if="showSiteNav"
    type="siteNav"
    :portal-name="portalName"
  >
    <template #navMenuIcon>
      <span :class="['glyphicon', 'toggle-site-nav-button']"></span>
    </template>
  </overlay>
</template>

<script>
import $ from './utils/NodeList';

export default {
  data() {
    return {
      portalName: undefined,
      show: false,
    };
  },
  computed: {
    showSiteNav() {
      return this.show && this.portalName;
    },
  },
  methods: {
    toggleSiteNavButton() {
      if (window.innerWidth < 992) {
        this.show = true;
      } else {
        this.show = false;
      }
    },
  },
  mounted() {
    if (document.querySelector('#site-nav a') !== null) {
      this.portalName = 'site-nav';
    } else if (document.querySelector('.site-nav-root a') !== null) {
      this.portalName = 'mb-site-nav';
    }

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
