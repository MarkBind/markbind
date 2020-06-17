<template>
    <button type="button" :class="['collapse-button', 'btn', isLightBg ? 'btn-outline-secondary' : 'btn-outline-light']">
        <span :class="['glyphicon', {'glyphicon-menu-down': !isOpenBool, 'glyphicon-menu-up': isOpenBool}]"
              aria-hidden="true"></span>
    </button>
</template>

<script>
  import {toBoolean} from '../utils/utils.js'

  export default {
    props: {
      isOpen: {
        type: Boolean,
        default: null
      },
      isLightBg: {
        type: Boolean,
        default: true
      }
    },
    computed: {
      isOpenBool () {
        return toBoolean(this.isOpen);
      }
    },
    methods: {
      toggle () {
        this.isOpen = !this.isOpenBool
      }
    },
    created () {
      if (this.isOpen === null) {
        this.isOpen = false
      }
    }
  }
</script>

<style>
    .collapse-button {
        font-size: 10px !important;
        float: right;
        padding: 3px 8px !important;
        margin-left: 3px;
        margin-top: 2px;
    }
</style>
