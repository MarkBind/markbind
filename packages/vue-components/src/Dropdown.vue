<template>
  <li
    v-if="isLi"
    ref="dropdown"
    :class="[{ 'disabled': disabledBool }, 'dropdown', addClass]"
  >
    <slot name="button">
      <a
        class="dropdown-toggle nav-link"
        role="button"
        :class="{'disabled': disabledBool}"
        data-bs-toggle="dropdown"
      >
        <slot name="header"></slot>
        <span>{{ tabGroupHeader }}</span>
      </a>
    </slot>
    <slot name="dropdown-menu" :class="[{ 'show': show }, { 'dropdown-menu-end': menuAlignRight }]">
      <ul class="dropdown-menu" :class="[{ 'show': show }, { 'dropdown-menu-end': menuAlignRight }]">
        <slot></slot>
      </ul>
    </slot>
  </li>
  <submenu
    v-else-if="isSubmenu"
    ref="submenu"
    @submenu-show="handleSubmenuShow"
    @submenu-register="handleSubmenuRegister"
  >
    <template v-for="(node, name) in $slots" #[name]>
      <slot :name="name"></slot>
    </template>
  </submenu>
  <div
    v-else
    ref="dropdown"
    :class="[{ 'disabled': disabledBool }, 'btn-group', addClass]"
  >
    <slot name="before"></slot>
    <slot name="button">
      <button
        type="button"
        class="btn dropdown-toggle"
        :class="[btnType, btnWithBefore, { 'dropdown-toggle-split': hasBefore }]"
        :disabled="disabledBool"
        data-bs-reference="parent"
        data-bs-toggle="dropdown"
      >
        <slot name="header"></slot>
      </button>
    </slot>
    <slot name="dropdown-menu" :class="[{ 'show': show }, { 'dropdown-menu-end': menuAlignRight }]">
      <ul class="dropdown-menu" :class="[{ 'show': show }, { 'dropdown-menu-end': menuAlignRight }]">
        <slot></slot>
      </ul>
    </slot>
  </div>
</template>

<script>
import Submenu from './Submenu.vue';
import { toBoolean } from './utils/utils';
import $ from './utils/NodeList';
import preventOverflowOnMobile from './utils/dropdown';

export default {
  components: {
    Submenu,
  },
  props: {
    disabled: {
      type: [Boolean, String],
      default: false,
    },
    type: {
      type: String,
      default: 'light',
    },
    tabGroupHeader: {
      type: String,
      default: '',
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
  provide() {
    const registry = {
      submenus: [],
      registerSubmenu: (submenu) => {
        registry.submenus.push(submenu);
      },
      hideAllExcept: (exceptSubmenu) => {
        registry.submenus.forEach((submenu) => {
          if (submenu !== exceptSubmenu) {
            submenu.hideSubmenu();
          } else {
            submenu.showSubmenu();
          }
        });
      },
    };
    return {
      // Indicate to children that exists this parent dropdown
      hasParentDropdown: true,
      // provide this layer registry to direct children
      submenuRegistry: registry,
    };
  },
  inject: {
    hasParentDropdown: {
      default: undefined,
    },
    isParentNavbar: {
      default: false,
    },
    submenuRegistry: {
      default: undefined,
    },
  },
  data() {
    return {
      show: false,
    };
  },
  computed: {
    parentRegistry() {
      // If this is a nested dropdown, submenuRegistry
      // will be provided by parent dropdown.
      return this.hasParentDropdown ? this.submenuRegistry : null;
    },
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
      return this.$slots.default;
    },
    hasBefore() {
      return !!this.$slots.before;
    },
    btnWithBefore() {
      return this.hasBefore ? 'btn-with-before' : '';
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
      $(this.$refs.dropdown).findChildren('ul').each((ul) => {
        ul.classList.toggle('show', false);

        if (window.innerWidth < 768 && this.isParentNavbar) {
          ul.style.removeProperty('left');
        }
      });
    },
    showDropdownMenu() {
      this.show = true;
      $(this.$refs.dropdown).findChildren('ul').each((ul) => {
        ul.classList.toggle('show', true);

        // check if the dropdown is part of the sliding menu on mobile
        if (window.innerWidth < 768 && this.isParentNavbar) {
          preventOverflowOnMobile(ul);
        }
      });
    },
    handleSubmenuShow(submenu) {
      // Tell parent dropdown to hide other submenus
      if (this.hasParentDropdown && this.parentRegistry) {
        this.parentRegistry.hideAllExcept(submenu);
      }
    },
    handleSubmenuRegister(submenu) {
      // Tell parent dropdown to register this submenu
      if (this.hasParentDropdown && this.parentRegistry) {
        this.parentRegistry.registerSubmenu(submenu);
      }
    },
  },
  mounted() {
    const $el = $(this.$refs.dropdown);
    if (this.$slots.button) {
      // If the button is passed via props, manually add a data-bs-toggle
      $el.findChildren('.dropdown-toggle').forEach(child => child.setAttribute('data-bs-toggle', 'dropdown'));
    }
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
  beforeUnmount() {
    const $el = $(this.$refs.dropdown);
    $el.offBlur();
    $el.findChildren('a,button').off();
    $el.findChildren('ul').off();
  },
};
</script>

<style scoped>
    @media (width <= 767px) {
        .navbar-default .dropdown {
            position: static;
        }

        .navbar-default .dropdown-menu {
            position: absolute;
            max-width: 100%;
            max-height: 75vh;
            overflow-y: auto;
            overscroll-behavior: contain;
        }

        .navbar-default .dropdown-menu-end {
            right: auto;
        }
    }

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
        display: block;
        width: max-content;
    }

    .navbar .dropdown-toggle {
        text-decoration: none;
    }

    .nav-link > .nav-link {
        padding: 0;
    }
</style>
