<template>
  <transition name="fade">
    <div
      v-show="show"
      role="tabpanel"
      class="tab-pane active printable-tab-pane d-print-block"
      :class="{hide:!show}"
    >
      <div class="nav-tabs printable-tab-header d-none d-print-flex">
        <div ref="header" class="nav-link active">
          <slot name="header"></slot>
        </div>
      </div>
      <slot></slot>
      <hr />
    </div>
  </transition>
</template>

<script>
import { toBoolean } from './utils/utils';

export default {
  props: {
    header: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    headerRendered() {
      return this.$refs.header.innerHTML;
    },
    active() {
      return this._tabset.show === this;
    },
    index() {
      return this._tabset.tabs.indexOf(this);
    },
    show() {
      return this._tabset && this._tabset.show === this;
    },
    transition() {
      return this._tabset ? this._tabset.effect : null;
    },
    disabledBool() {
      return toBoolean(this.disabled);
    },
  },
  created() {
    this._ingroup = this.$parent && this.$parent._tabgroup;
    let tabset = this;
    while (tabset && tabset._tabset !== true && tabset.$parent) {
      tabset = tabset.$parent;
    }
    if (!tabset._tabset) {
      this._tabset = {};
      // Warning: "tab" depend on "tabset" to work properly.
    } else {
      tabset.tabs.push(this);
      if (!this._ingroup) {
        tabset.headers.push(this);
      // eslint-disable-next-line no-bitwise
      } else if (!~tabset.headers.indexOf(this.$parent)) {
        tabset.headers.push(this.$parent);
      }
      this._tabset = tabset;
    }
    if (this._ingroup) {
      this.$parent.tabs.push(this);
    }
  },
  beforeDestroy() {
    if (this._tabset.active === this.index) { this._tabset.active = 0; }
    if (this._ingroup) {
      const tabIndex = this.$parent.tabs.indexOf(this);
      this.$parent.tabs.splice(tabIndex, 1);
    }
    this._tabset.tabs.splice(this.index, 1);
  },
};
</script>
<style>
    .tab-pane > hr {
        margin: 0;
    }

    .fade-enter-active {
        transition: opacity 0.5s;
    }

    .fade-leave-active {
        transition: opacity 0s;
    }

    @media print {
        .printable-tab-header {
            margin-bottom: 15px;
            border-bottom: 1px solid #dee2e6;
        }

        .printable-tab-header > div {
            margin-bottom: -2px;
        }

        .printable-tab-pane {
            padding: 10px;
        }
    }
</style>
