<template>
  <div :class="[addClass]">
    <!-- Nav tabs -->
    <ul class="nav nav-tabs" :class="getNavStyleClass" role="tablist">
      <template v-for="t in headers">
        <li v-if="!t._tabgroup" class="nav-item" @click.prevent="select(t)">
          <a class="nav-link" :class="{active: t.active, disabled:t.disabledBool}" href="#"><span v-html="t.headerRendered"></span></a>
        </li>
        <dropdown v-else class="nav-item nav-link" :header="t.headerRendered" :class="{active:t.active}" :disabled="t.disabled">
          <li v-for="tab in t.tabs"><a class="nav-link" :class="{disabled:tab.disabled}" href="#" @click.prevent="select(tab)" v-html="tab.headerRendered"></a></li>
        </dropdown>
      </template>
    </ul>
    <div class="tab-content" ref="tab-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import {toNumber} from './utils/utils.js'
import dropdown from './Dropdown.vue'

export default {
  components: {
    dropdown
  },
  props: {
    navStyle: {
      type: String,
      default: 'tabs'
    },
    active: {
      type: Number,
      default: 0
    },
    addClass: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      show: null,
      headers: [],
      tabs: []
    }
  },
  created () {
    this._tabset = true
  },
  computed: {
    getNavStyleClass() {
      return `nav-${this.navStyle}`;
    },
    activeNumber () {
       return toNumber(this.active);
    },
  },
  watch: {
    activeNumber (val) {
      this.show = this.tabs[val]
    }
  },
  mounted () {
    this.show = this.tabs[this.activeNumber]
  },
  methods: {
    select (tab) {
      if (!tab.disabled) {
        this.active = tab.index
      }
    }
  }
}
</script>

<style scoped>
.nav-tabs {
  margin-bottom: 15px;
}
</style>
