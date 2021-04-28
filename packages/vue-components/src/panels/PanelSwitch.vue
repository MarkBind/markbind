<template>
  <button
    type="button"
    :class="['collapse-button', 'btn', isLightBg ? 'btn-outline-secondary' : 'btn-outline-light']"
  >
    <span
      :class="['collapse-icon', 'glyphicon', 'glyphicon-menu-down', {'opened': isOpenBool}]"
      aria-hidden="true"
    ></span>
  </button>
</template>

<script>
import { toBoolean } from '../utils/utils';

export default {
  props: {
    isOpen: {
      type: Boolean,
      default: null,
    },
    isLightBg: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    isOpenBool() {
      return toBoolean(this.isOpen);
    },
  },
};
</script>

<style>
    .collapse-button {
        font-size: 10px !important;
        float: right;
        padding: 3px 8px !important;
        margin-left: 3px;
        margin-top: 2px;
    }

    .collapse-icon {
        transition: transform 0.4s ease-in-out;
    }

    .collapse-icon.opened {
        transform: rotate(-180deg);
    }
</style>
