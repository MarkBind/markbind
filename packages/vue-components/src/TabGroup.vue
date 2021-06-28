<template>
  <div :class="['printable-tab-group', {'d-print-none': noPrint}]">
    <div ref="header" class="printable-tab-group-header d-none d-print-block">
      <slot name="header"></slot>
    </div>
    <slot></slot>
  </div>
</template>

<script>
import { coerce } from './utils/utils';

export default {
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    header: {
      type: String,
      default: '',
    },
    noPrint: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      tabs: [],
      show: false,
    };
  },
  computed: {
    active() {
      // eslint-disable-next-line no-bitwise
      return ~this.tabs.indexOf(this._tabset.show);
    },
    headerRendered() {
      return this.$refs.header.innerHTML;
    },
    disabledBool() {
      return coerce.boolean(this.disabled);
    },
  },
  created() {
    this._tabgroup = true;
    let tabset = (this.$parent && this.$parent._tabset === true) ? this.$parent : {};

    // Tabgroups cannot be nested

    while (tabset && !tabset._tabset && tabset.$parent) {
      tabset = tabset.$parent;
    }
    if (!tabset._tabset) {
      this._tabset = {};
      this.show = true;
      // Warning: tabgroup depend on tabset to work properly.
    } else {
      this._tabset = tabset;
    }
  },
  methods: {
    blur() {
      this.show = false;
    },
    toggle() {
      this.show = !this.show;
    },
  },
};
</script>

<style scoped>
    .nav-tabs {
        margin-bottom: 15px;
    }

    @media print {
        .printable-tab-group {
            border: 1px solid #dee2e6;
            border-radius: 5px;
            padding: 10px;
            margin: 10px 0;
        }

        .printable-tab-group-header {
            margin-bottom: 10px;
            text-decoration: underline;
        }
    }
</style>
