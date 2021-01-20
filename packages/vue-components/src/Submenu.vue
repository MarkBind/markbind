<template>
  <li ref="submenu" :class="classes">
    <slot name="button"></slot>
    <slot name="dropdown-submenu" :class="menuClasses"></slot>
  </li>
</template>

<script>
import { toBoolean } from './utils/utils';
import $ from './utils/NodeList';

export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    'class': null,
    addClass: {
      type: String,
      default: '',
    },
    menuAlignRight: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    classes() {
      return [this.class, this.addClass, 'dropdown-submenu'];
    },
    menuClasses() {
      return [{ show: this.showBool }, { 'dropdown-menu-right': this.menuAlignRight }];
    },
    disabledBool() {
      return toBoolean(this.disabled);
    },
    showBool() {
      return toBoolean(this.show);
    },
    slots() {
      return this.$slots.default;
    },
  },
  methods: {
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
      $(this.$refs.submenu).findChildren('ul').each((ul) => {
        $(ul).findChildren('li.dropdown-submenu').each((sm) => {
          $(sm).findChildren('ul').each(submenu => submenu.classList.toggle('show', false));
        });
      });
    },
  },
  created() {
    this._submenu = true;
  },
  mounted() {
    const $el = $(this.$refs.submenu);
    if (this.show) {
      this.showSubmenu();
    }
    $el.onBlur(() => { this.hideSubmenu(); }, false);
    $el.findChildren('a,button').on('click', (e) => {
      e.preventDefault();
      if (this.disabledBool) { return false; }
      if (this.showBool) {
        this.hideSubmenu();
      } else {
        this.showSubmenu();
      }
      return false;
    });
  },
  beforeDestroy() {
    const $el = $(this.$refs.submenu);
    $el.offBlur();
    $el.findChildren('a,button').off();
    $el.findChildren('ul').off();
  },
};
</script>

<style scoped>
.dropdown-submenu {
  color: #212529 !important;
  padding: 0 !important;
  position: relative;
}

@media (min-width: 768px) {
  .dropdown-submenu > ul {
    top: 0;
    left: 100%;
  }
}

@media (max-width: 767px) {
  .dropdown-submenu > ul {
    padding-bottom: 0;
    border-radius: 0;
    margin: -.05rem;
  }
}
</style>
