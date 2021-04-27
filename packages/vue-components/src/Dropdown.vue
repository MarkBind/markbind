<template>
  <li
    v-if="isLi"
    ref="dropdown"
    :class="[{ 'disabled': disabledBool },
             isLi ? 'dropdown' : 'btn-group', addClass]"
  >
    <slot name="button">
      <a
        class="dropdown-toggle"
        role="button"
        :class="{'disabled': disabledBool}"
        @keyup.esc="hideDropdownMenu()"
      >
        <slot name="header"></slot>
      </a>
    </slot>
    <slot name="dropdown-menu" :class="[{ 'show': show }, { 'dropdown-menu-right': menuAlignRight }]">
      <ul class="dropdown-menu" :class="[{ 'show': show }, { 'dropdown-menu-right': menuAlignRight }]">
        <slot></slot>
      </ul>
    </slot>
  </li>
  <submenu v-else-if="isSubmenu" ref="submenu">
    <template v-for="(node, name) in $scopedSlots" v-slot:[name]>
      <slot :name="name"></slot>
    </template>
  </submenu>
  <div
    v-else
    ref="dropdown"
    :class="[{ 'disabled': disabledBool },
             isLi ? 'dropdown' : 'btn-group', addClass]"
  >
    <slot name="before"></slot>
    <slot name="button">
      <button
        type="button"
        class="btn dropdown-toggle"
        :class="[btnType, btnWithBefore]"
        :disabled="disabledBool"
        @keyup.esc="hideDropdownMenu()"
      >
        <slot name="header"></slot>
      </button>
    </slot>
    <slot name="dropdown-menu" :class="[{ 'show': show }, { 'dropdown-menu-right': menuAlignRight }]">
      <ul class="dropdown-menu" :class="[{ 'show': show }, { 'dropdown-menu-right': menuAlignRight }]">
        <slot></slot>
      </ul>
    </slot>
  </div>
</template>

<script>
import Submenu from './Submenu.vue';
import { toBoolean } from './utils/utils';
import $ from './utils/NodeList';

export default {
  components: {
    Submenu,
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: 'light',
    },
    menuAlignRight: {
      type: Boolean,
      default: false,
    },
    addClass: {
      type: String,
      default: '',
    },
  },
  provide: { hasParentDropdown: true },
  inject: {
    hasParentDropdown: {
      default: undefined,
    },
  },
  data() {
    return {
      show: false,
    };
  },
  computed: {
    btnType() {
      return `btn-${this.type}`;
    },
    disabledBool() {
      return toBoolean(this.disabled);
    },
    isLi() { return this.$parent._navbar || this.$parent.menu || this.$parent._tabset; },
    isSubmenu() { return this.hasParentDropdown; },
    menu() {
      return !this.$parent || this.$parent.navbar;
    },
    submenu() {
      return this.$parent && (this.$parent.menu || this.$parent.submenu);
    },
    slots() {
      return this.$scopedSlots.default;
    },
    btnWithBefore() {
      if (this.$scopedSlots.before) {
        return 'btn-with-before';
      }
      return '';
    },
  },
  methods: {
    blur() {
      this.unblur();
      this._hide = setTimeout(() => {
        this._hide = null;
        this.hideDropdownMenu();
      }, 100);
    },
    unblur() {
      if (this._hide) {
        clearTimeout(this._hide);
        this._hide = null;
      }
    },
    hideDropdownMenu() {
      this.show = false;
      $(this.$refs.dropdown).findChildren('ul').each(ul => ul.classList.toggle('show', false));
    },
    showDropdownMenu() {
      this.show = true;
      $(this.$refs.dropdown).findChildren('ul').each(ul => ul.classList.toggle('show', true));
    },
  },
  mounted() {
    const $el = $(this.$refs.dropdown);
    if (this.show) {
      this.showDropdownMenu();
    }
    $el.onBlur(() => { this.hideDropdownMenu(); }, false);
    $el.findChildren('a,button.dropdown-toggle').on('click', (e) => {
      e.preventDefault();
      if (this.disabledBool) { return false; }
      if (this.show) {
        this.hideDropdownMenu();
      } else {
        this.showDropdownMenu();
      }
      return false;
    });
    $el.findChildren('ul').on('click', 'li>a', (e) => {
      if (e.target.classList.contains('submenu-toggle')) { return; }
      this.hideDropdownMenu();
    });
  },
  beforeDestroy() {
    const $el = $(this.$refs.dropdown);
    $el.offBlur();
    $el.findChildren('a,button').off();
    $el.findChildren('ul').off();
  },
};
</script>

<style scoped>
    .secret {
        position: absolute;
        clip: rect(0 0 0 0);
        overflow: hidden;
        margin: -1px;
        height: 1px;
        width: 1px;
        padding: 0;
        border: 0;
    }

    .btn-with-before {
        padding-left: 0.2rem;
        padding-right: 0.4rem;
    }

    .dropdown-toggle {
        cursor: pointer;
    }

    .navbar .dropdown-toggle {
        color: inherit;
        text-decoration: none;
    }
</style>
