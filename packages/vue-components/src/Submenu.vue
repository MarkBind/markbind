<template>
  <li
    ref="submenu"
    :class="[addClass, 'dropdown-submenu',
             { 'dropright': dropright, 'dropleft': dropleft }]"
  >
    <slot name="button">
      <a
        class="submenu-toggle"
        role="button"
        :class="{disabled: disabled}"
      >
        <slot name="_header">
          <slot name="header"></slot>
        </slot>
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

export default {
  props: {
    addClass: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
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
  computed: {
    disabledBool() {
      return toBoolean(this.disabled);
    },
  },
  methods: {
    hideSubmenu() {
      this.show = false;
      $(this.$refs.submenu).findChildren('ul').each(ul => ul.classList.toggle('show', false));
      this.alignMenuRight();
    },
    showSubmenu() {
      this.show = true;
      $(this.$refs.submenu).findChildren('ul').each((ul) => {
        ul.classList.toggle('show', true);
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
      if (e.target !== e.currentTarget) { e.stopPropagation(); }
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

    .submenu-toggle {
        display: inline-block;
        width: 100%;
        padding: .25rem .75rem .25rem 1.5rem;
    }

    .dropdown > ul > .dropdown-submenu:last-child > ul,
    .btn-group > ul > .dropdown-submenu:last-child > ul {
        margin-bottom: -.5rem;
    }

    @media (min-width: 768px) {
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
    }

    @media (max-width: 767px) {
        .dropdown-submenu > ul {
            padding-bottom: 0;
            border-radius: 0;
            margin: -.05rem;
            position: static;
            float: none;
        }

        .submenu-toggle:after {
            display: inline-block;
            width: 0;
            height: 0;
            margin-left: .255em;
            vertical-align: .255em;
            content: "";
            border-top: .3em solid;
            border-right: .3em solid transparent;
            border-bottom: 0;
            border-left: .3em solid transparent;
            float: right;
            margin-top: .5em;
        }
    }
</style>
