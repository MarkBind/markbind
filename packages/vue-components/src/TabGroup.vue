<template>
  <div>
    <slot></slot>
    <div ref="header" class="d-none">
      <slot name="_header"></slot>
    </div>
  </div>
</template>

<script>
import {coerce} from './utils/utils.js'

export default {
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    header: {
      type: String
    }
  },
  data () {
    return {
      tabs: [],
      show: false
    }
  },
  computed: {
    active () {
      return ~this.tabs.indexOf(this._tabset.show)
    },
    headerRendered () {
      return this.$refs.header.innerHTML
    },
    disabledBool () {
      return coerce.boolean(this.disabled)
    }
  },
  created () {
    this._tabgroup = true
    let tabset = (this.$parent && this.$parent._tabset === true) ? this.$parent : {}
    if (this.$parent && this.$parent._tabgroup) {
      console.error('Can\'t nest tabgroups.')
    }
    while (tabset && !tabset._tabset && tabset.$parent) {
      tabset = tabset.$parent
    }
    if (!tabset._tabset) {
      this._tabset = {}
      this.show = true
      console.warn('Warning: tabgroup depend on tabset to work properly.')
    } else {
      this._tabset = tabset
    }
  },
  methods: {
    blur () {
      this.show = false
    },
    toggle () {
      this.show = !this.show
    }
  }
}
</script>

<style scoped>
.nav-tabs {
  margin-bottom: 15px;
}
</style>
