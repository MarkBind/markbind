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
        right: 0;
        padding: 15px;
        position: absolute;
    }

   .toggle-page-nav-button span {
        background-color: #000;
        border-radius: 50%;
        display: block;
        height: 5px;
        right: 15px;
        margin-top: 2px;
        position: absolute;
        transform: rotate(0deg);
        transition: all .25s ease-in-out;
        width: 5px;

    }

   .toggle-page-nav-button > span:nth-child(1) {
        transform: translateY(-6px);
    }

    .toggle-page-nav-button > span:nth-child(2) {
        transform-origin: 100% 50%;
    }

    .toggle-page-nav-button > span:nth-child(3) {
        transform: translateY(6px);
    }

    .toggle-page-nav-button.active > span:nth-child(1)  {
        border-radius: 0px;
        height: 3px;
        -o-transform: rotate(135deg);
        -moz-transform: rotate(135deg);
        transform: all rotate(135deg);
        -webkit-transform: rotate(135deg);
        width: 21px;
    }

    .toggle-page-nav-button.active > span:nth-child(2)  {
        opacity: 0;
        right: -60px;
    }

    .toggle-page-nav-button.active > span:nth-child(3) {
        border-radius: 0px;
        height: 3px;
        -o-transform: rotate(-135deg);
        -moz-transform: rotate(-135deg);
        transform: rotate(-135deg);
        -webkit-transform: rotate(-135deg);
        width: 21px;
    }

</style>
