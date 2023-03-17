<template>
  <div v-if="showPageNav" class="page-nav-container" :class="portalName">
    ...
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import $ from './utils/NodeList';

export default {
  setup() {
    const portalName = ref(undefined);
    const show = ref(false);

    const togglePageNavButton = () => {
      if (window.innerWidth < 1300) {
        show.value = true;
      } else {
        show.value = false;
      }
    };

    const showPageNav = computed(() => {
      return show.value && portalName.value;
    });

    onMounted(() => {
      if (document.querySelector('#page-nav a') !== null) {
        portalName.value = 'page-nav';
      } else if (document.querySelector('#mb-page-nav a') !== null) {
        portalName.value = 'mb-page-nav';
      }

      togglePageNavButton();
      $(window).on('resize', togglePageNavButton);
    });

    onUnmounted(() => {
      $(window).off('resize', togglePageNavButton);
    });

    return {
      portalName,
      show,
      showPageNav,
    };
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
