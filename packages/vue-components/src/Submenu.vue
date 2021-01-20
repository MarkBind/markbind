<template>
  <li ref="submenu" :class="classes">
    <slot name="button"></slot>
    <slot name="dropdown-submenu" :class="menuClasses"></slot>
  </li>
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
    addClass: {
      type: String,
      default: ''
    }
  },
  computed: {
    classes () {
      return [this.class, this.addClass, 'dropdown-submenu']
    },
    menuClasses() {
      return [{show: this.showBool}, {'dropdown-menu-right': this.menuAlignRight}];
    },
    disabledBool() {
      return toBoolean(this.disabled);
    },
    showBool() {
      return toBoolean(this.show);
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
        this.hideSubmenu();
      }, 100)
    },
    unblur () {
      if (this._hide) {
        clearTimeout(this._hide)
        this._hide = null
      }
    },
    hideSubmenu() {
      this.hideNestedSubmenus();
      this.show = false;
      $(this.$refs.submenu).findChildren('ul').each(ul => ul.classList.toggle('show', false));
    },
    showSubmenu() {
      this.show = true;
      $(this.$refs.submenu).findChildren('ul').each(ul => ul.classList.toggle('show', true));
    },
    hideNestedSubmenus() {
      $(this.$refs.submenu).findChildren('ul').each(ul => {
        $(ul).findChildren('li.dropdown-submenu').each(sm => {
          $(sm).findChildren('ul').each(ul => ul.classList.toggle('show', false));
        })
      });
    }
  },
  created() {
    this._submenu = true;
  },
  mounted () {
    const $el = $(this.$refs.submenu)
    if (this.show) {
      this.showSubmenu();
    }
    $el.onBlur((e) => { console.log("blurr");this.hideSubmenu(); }, false)
    $el.findChildren('a,button').on('click', e => {
      e.preventDefault()
      if (this.disabledBool) { return false }
      if (this.showBool) {
        this.hideSubmenu();
      } else {
        this.showSubmenu();
      }
      return false
    })
  },
  beforeDestroy () {
    const $el = $(this.$refs.submenu)
    $el.offBlur()
    $el.findChildren('a,button').off()
    $el.findChildren('ul').off()
  }
}
</script>

<style scoped>
.dropdown-submenu {
  color: #000 !important;
  padding: 0 !important;
  position: relative;
}

.dropdown-submenu > ul {
  top: 0;
  left: 100%;
}

@media (min-width: 768px) {
  .dropdown-submenu > ul {
    display: none;
  }

  .dropdown-submenu:hover > ul {
    display: block;
  }
}


</style>