<template>
  <overlay
    v-if="showPageNav"
    type="pageNav"
    :portal-name="portalName"
  >
    <template #navMenuIcon>
      <span :class="['glyphicon', 'toggle-page-nav-button']"></span>
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
    showPageNav() {
      return this.show && this.portalName;
    },
  },
  methods: {
    togglePageNavButton() {
      if (window.innerWidth < 1300) {
        this.show = true;
      } else {
        this.show = false;
      }
    },
  },
  mounted() {
    if (document.querySelector('#page-nav a') !== null) {
      this.portalName = 'page-nav';
    } else if (document.querySelector('#mb-page-nav a') !== null) {
      this.portalName = 'mb-page-nav';
    }

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
