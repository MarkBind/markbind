<template>
  <overlay
    v-if="showSiteNav"
    type="siteNav"
    :portal-name="portalName"
  >
    <template #navMenuIcon>
      <div
        :class="['toggle-site-nav-button']"
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
    </template>
  </overlay>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import $ from './utils/NodeList';

export default {
  setup() {
    const portalName = ref(undefined);
    const show = ref(false);

    const showSiteNav = computed(() => show.value && portalName.value);

    const toggleSiteNavButton = () => {
      if (window.innerWidth < 992) {
        show.value = true;
      } else {
        show.value = false;
      }
    };

    onMounted(() => {
      if (document.querySelector('#site-nav a') !== null) {
        portalName.value = 'site-nav';
      } else if (document.querySelector('.site-nav-root a') !== null) {
        portalName.value = 'mb-site-nav';
      }

      toggleSiteNavButton();
      $(window).on('resize', toggleSiteNavButton);
    });

    onBeforeUnmount(() => {
      $(window).off('resize', toggleSiteNavButton);
    });

    return {
      portalName,
      show,
      showSiteNav,
      toggleSiteNavButton,
    };
  },
};
</script>

<style scoped>

    .toggle-site-nav-button {
        cursor: pointer;
        height: 53px;
        left: 0;
        padding: 15px;
        position: absolute;
        transform: rotate(0deg);
        transition: all 0.25s ease-in-out;
        width: 52px;
    }

    .toggle-site-nav-button span {
        background-color: #000;
        display: block;
        height: 3px;
        left: 15px;
        position: absolute;
        top: 50%;
        transition: all 0.25s ease-in-out;
        width: 21px;
    }

    .toggle-site-nav-button > span:nth-child(1) {
        transform: translateY(-8px);
    }

    .toggle-site-nav-button > span:nth-child(2) {
        transform-origin: 100% 50%;
    }

    .toggle-site-nav-button > span:nth-child(3) {
        transform: translateY(8px);
    }

    .nav-menu-close-icon .toggle-site-nav-button > span:nth-child(1) {
        transform: rotate(135deg);
    }

    .nav-menu-close-icon .toggle-site-nav-button > span:nth-child(2) {
        left: -60px;
        opacity: 0;
    }

    .nav-menu-close-icon .toggle-site-nav-button > span:nth-child(3) {
        transform: rotate(-135deg);
    }

</style>
