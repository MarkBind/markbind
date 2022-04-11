<template>
  <li
    ref="submenu"
    :class="[addClass, 'dropdown-submenu',
             { 'dropend': dropright, 'dropstart': dropleft }]"
  >
    <slot name="button">
      <a
        class="dropdown-item submenu-toggle"
        role="button"
        :class="{disabled: disabled}"
        data-bs-toggle="dropdown"
      >
        <slot name="header"></slot>
      </a>
    </slot>
    <slot name="dropdown-menu">
      <ul class="dropdown-menu">
        <slot></slot>
      </ul>
    </slot>
  </li>
</template>

<script>
import { toBoolean } from './utils/utils';
import $ from './utils/NodeList';
import positionSubmenu from './utils/submenu';
import preventOverflowOnMobile from './utils/dropdown';

export default {
  props: {
    addClass: {
      type: String,
      default: '',
    },
    disabled: {
      type: [Boolean, String],
      default: false,
    },
  },
  data() {
    return {
      show: false,
      dropright: true,
      dropleft: false,
    };
  },
  inject: {
    isParentNavbar: {
      default: false,
    },
  },
  computed: {
    disabledBool() {
      return toBoolean(this.disabled);
    },
  },
  methods: {
    hideSubmenu() {
      this.show = false;
      $(this.$refs.submenu).find('ul').each(ul => ul.classList.toggle('show', false));
      this.alignMenuRight();
    },
    showSubmenu() {
      this.show = true;
      $(this.$refs.submenu).findChildren('ul').each((ul) => {
        ul.classList.toggle('show', true);

        // check if submenu is part of the navbar sliding menu on mobile
        if (window.innerWidth < 768 && this.isParentNavbar) {
          preventOverflowOnMobile(ul);
          return;
        }

        if (positionSubmenu.isRightAlign(ul)) {
          this.alignMenuRight();
        } else {
          this.alignMenuLeft();
        }
        positionSubmenu.preventOverflow(ul);
      });
    },
    alignMenuRight() {
      this.dropright = true;
      this.dropleft = false;
    },
    alignMenuLeft() {
      this.dropright = false;
      this.dropleft = true;
    },
  },
  mounted() {
    const $el = $(this.$refs.submenu);
    if (this.show) {
      this.showSubmenu();
    }
    $el.onBlur(() => { this.hideSubmenu(); }, false);
    $el.findChildren('a,button').on('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (window.innerWidth < 768) {
        if (this.disabledBool) { return false; }
        if (this.show) {
          this.hideSubmenu();
        } else {
          this.showSubmenu();
        }
      }
      return false;
    });
    $el.findChildren('a,button').on('mouseover', (e) => {
      e.preventDefault();
      if (window.innerWidth > 767) {
        if (this.show || this.disabledBool) { return false; }
        e.currentTarget.click();
        const fullMenu = this.$parent.$parent;
        fullMenu.$children.forEach((menuItem) => {
          if (menuItem.$el === this.$el) {
            this.showSubmenu();
          } else {
            menuItem.$refs.submenu.hideSubmenu();
          }
        });
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

    .dropdown > ul > .dropdown-submenu:last-child > ul,
    .btn-group > ul > .dropdown-submenu:last-child > ul {
        margin-bottom: -0.5rem;
    }

    @media (min-width: 768px) {
        .submenu-toggle::after {
            display: inline-block;
            width: 0;
            height: 0;
            vertical-align: 0.255em;
            content: "";
            border-top: 0.3em solid transparent;
            border-right: 0;
            border-bottom: 0.3em solid transparent;
            border-left: 0.3em solid;
            float: right;
            margin-top: 0.5em;
        }
    }

    @media (max-width: 767px) {
        .dropdown-submenu > ul {
            padding-bottom: 0;
            border-radius: 0;
            margin: -0.05rem;
            position: static;
            float: none;
        }

        .submenu-toggle::after {
            display: inline-block;
            width: 0;
            height: 0;
            margin-left: 0.255em;
            vertical-align: 0.255em;
            content: "";
            border-top: 0.3em solid;
            border-right: 0.3em solid transparent;
            border-bottom: 0;
            border-left: 0.3em solid transparent;
            float: right;
            margin-top: 0.5em;
        }
    }
</style>
