<template>
  <overlay
    v-if="showPageNav"
    type="pageNav"
    :portal-name="portalName"
  >
    <template #navMenuIcon>
      <div :class="['toggle-page-nav-button']">
        <span></span>
        <span></span>
        <span></span>
      </div>
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
        top: 6px;
        padding: 15px;
        position: absolute;
        right: 0;
    }

    .toggle-page-nav-button span {
        background-color: #000;
        border-radius: 50%;
        display: block;
        height: 5px;
        margin-top: 2px;
        position: absolute;
        right: 15px;
        transform: rotate(0deg);
        transition: all 0.25s ease-in-out;
        width: 5px;
    }

    .toggle-page-nav-button > span:nth-child(1) {
        transform: translateY(-8px);
    }

    .toggle-page-nav-button > span:nth-child(2) {
        transform-origin: 100% 50%;
    }

    .toggle-page-nav-button > span:nth-child(3) {
        transform: translateY(8px);
    }

    .nav-menu-close-icon .toggle-page-nav-button > span:nth-child(1) {
        border-radius: 0;
        height: 3px;
        transform: rotate(135deg);
        width: 21px;
    }

    .nav-menu-close-icon .toggle-page-nav-button > span:nth-child(2) {
        transform: scale(0);
    }

    .nav-menu-close-icon .toggle-page-nav-button > span:nth-child(3) {
        border-radius: 0;
        height: 3px;
        transform: rotate(-135deg);
        width: 21px;
    }

</style>
