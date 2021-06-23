<template>
  <overlay
    v-if="showSiteNav"
    type="siteNav"
    :portal-name="portalName"
  >
    <template #navMenuIcon>
      <div
        :class="['toggle-page-site-button']"
      >
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

    .toggle-page-site-button {
        cursor: pointer;
        height: 53px;
        left: 0;
        padding: 15px;
        position: absolute;
        transform: all rotate(0deg);
        transition: all 0.25s ease-in-out;
        width: 52px;
    }

    .toggle-page-site-button span {
        background-color: #000;
        display: block;
        height: 3px;
        left: 15px;
        position: absolute;
        top: 50%;
        transform: all rotate(0deg);
        transition: all 0.25s ease-in-out;
        width: 21px;
    }

    .toggle-page-site-button > span:nth-child(1) {
        transform: translateY(-6px);
    }

    .toggle-page-site-button > span:nth-child(2) {
        transform-origin: 100% 50%;
    }

    .toggle-page-site-button > span:nth-child(3) {
        transform: translateY(6px);
    }

    .toggle-page-site-button.active > span:nth-child(1) {
        -o-transform: rotate(135deg);
        -moz-transform: rotate(135deg);
        transform: all rotate(135deg);
        -webkit-transform: rotate(135deg);
    }

    .toggle-page-site-button.active > span:nth-child(2) {
        left: -60px;
        opacity: 0;
    }

    .toggle-page-site-button.active > span:nth-child(3) {
        -o-transform: rotate(-135deg);
        -moz-transform: rotate(-135deg);
        transform: rotate(-135deg);
        -webkit-transform: rotate(-135deg);
    }

</style>
