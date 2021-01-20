<template>
  <li v-if="isLi" ref="dropdown" :class="classes">
    <slot name="button">
      <a class="dropdown-toggle" role="button" :class="{disabled: disabled}" @keyup.esc="hideDropdownMenu()">
        <slot name="_header">
          <slot name="header"></slot>
        </slot>
      </a>
    </slot>
    <slot name="dropdown-menu" :class="menuClasses">
      <ul class="dropdown-menu" :class="menuClasses">
        <slot></slot>
      </ul>
    </slot>
  </li>
  <submenu v-else-if="isSubmenu" ref="submenu">
    <slot slot="button" name=button>
      <a class="submenu-toggle" role="button" :class="{disabled: disabled}">
        <slot name="_header">
          <slot name="header"></slot>
        </slot>
      </a>
    </slot>
    <slot slot="dropdown-submenu" name="dropdown-menu" :class="menuClasses">
      <ul class="dropdown-menu" :class="menuClasses">
        <slot></slot>
      </ul>
    </slot>
  </submenu>
  <div v-else ref="dropdown" :class="classes">
    <slot name="before"></slot>
    <slot name="button">
      <button type="button" class="btn dropdown-toggle" :class="[btnType, btnWithBefore]" @keyup.esc="hideDropdownMenu()" :disabled="disabled">
        <slot name="_header">
          <slot name="header"></slot>
        </slot>
      </button>
    </slot>
    <slot name="dropdown-menu" :class="menuClasses">
      <ul class="dropdown-menu" :class="menuClasses">
        <slot></slot>
      </ul>
    </slot>
  </div>
</template>

<script>
import {toBoolean} from './utils/utils.js'
import $ from './utils/NodeList.js'

export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    'class': null,
    disabled: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'light'
    },
    menuAlignRight: {
      type: Boolean,
      default: false
    },
    addClass: {
      type: String,
      default: ''
    }
  },
  computed: {
    btnType () {
      return `btn-${this.type}`;
    },
    classes () {
      return [{disabled: this.disabledBool}, this.class, this.isLi ? 'dropdown' : 'btn-group', this.addClass]
    },
    menuClasses() {
      return [{show: this.showBool}, {'dropdown-menu-right': this.menuAlignRight}];
    },
    disabledBool() {
      return toBoolean(this.disabled);
    },
    isLi () { return this.$parent._navbar || this.$parent.menu || this.$parent._tabset },
    isSubmenu() { return this.$parent._dropdown || this.$parent._submenu },
    menu () {
      return !this.$parent || this.$parent.navbar
    },
    showBool() {
      return toBoolean(this.show);
    },
    submenu () {
      return this.$parent && (this.$parent.menu || this.$parent.submenu)
    },
    slots () {
      return this.$slots.default
    },
    btnWithBefore () {
      if (this.$slots.before) {
        return 'btn-with-before';
      }
      return '';
    },
  },
  methods: {
    blur () {
      this.unblur()
      this._hide = setTimeout(() => {
        this._hide = null
        this.hideDropdownMenu();
      }, 100)
    },
    unblur () {
      if (this._hide) {
        clearTimeout(this._hide)
        this._hide = null
      }
    },
    hideDropdownMenu() {
      this.hideSubmenu();
      this.show = false;
      $(this.$refs.dropdown).findChildren('ul').each(ul => ul.classList.toggle('show', false));
    },
    showDropdownMenu() {
      this.show = true;
      $(this.$refs.dropdown).findChildren('ul').each(ul => ul.classList.toggle('show', true));
    },
    hideSubmenu() {
      $(this.$refs.dropdown).findChildren('ul').each(ul => {
        $(ul).findChildren('li.dropdown-submenu').each(sm => {
          $(sm).findChildren('ul').each(ul => ul.classList.toggle('show', false));
        })
      });
    }
  },
  created() {
    this._dropdown = true;
  },
  mounted () {
    const $el = $(this.$refs.dropdown)
    if (this.show) {
      this.showDropdownMenu();
    }
    $el.onBlur((e) => { this.hideDropdownMenu() }, false)
    $el.findChildren('a,button.dropdown-toggle').on('click', e => {
      e.preventDefault()
      if (this.disabledBool) { return false }
      if (this.showBool) {
        this.hideDropdownMenu();
      } else {
        this.showDropdownMenu();
      }
      return false
    })
    $el.findChildren('ul').on('click', 'li>.dropdown-item', e => { this.hideDropdownMenu() })
  },
  beforeDestroy () {
    const $el = $(this.$refs.dropdown)
    $el.offBlur()
    $el.findChildren('a,button').off()
    $el.findChildren('ul').off()
  }
}
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

.submenu-toggle {
  display: inline-block;
  width: 100%;
  padding: .25rem .75rem .25rem 1.5rem;
}

.submenu-toggle:after {
  display: inline-block;
  width: 0;
  height: 0;
  vertical-align: .255em;
  content: "";
  border-top: .3em solid transparent;
  border-right: 0;
  border-bottom: .3em solid transparent;
  border-left: .3em solid;
  float: right;
  margin-top: .5em;
}
</style>
