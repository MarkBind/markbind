<template>
  <button
    type="button"
    :class="['collapse-button',
             'btn',
             isSeamless ? 'btn-seamless' : isLightBg ? 'btn-outline-secondary' : 'btn-outline-light']"
  >
    <span
      :class="['collapse-icon', 'glyphicon', 'glyphicon-menu-down', {'opened': isOpenBool}]"
      aria-hidden="true"
    ></span>
  </button>
</template>

<script lang="ts">
import { toBoolean } from '../utils/utils';

export default {
  props: {
    isOpen: {
      type: [Boolean, String],
      default: false,
    },
    isLightBg: {
      type: Boolean,
      default: true,
    },
    isSeamless: {
      type: Boolean,
      default: false,
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
    .btn-seamless {
        color: inherit;
        border-color: inherit;
    }

    .btn-seamless:hover {
        color: inherit;
        background-color: inherit;
    }

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
