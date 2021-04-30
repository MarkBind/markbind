<template>
  <div>
    <nav ref="navbar" :class="['navbar', 'navbar-expand-md', themeOptions, addClass, fixedOptions]">
      <div class="container-fluid">
        <div class="navbar-brand">
          <slot name="brand"></slot>
        </div>
        <button
          v-if="!slots.collapse"
          class="navbar-toggler"
          type="button"
          aria-expanded="false"
          aria-label="Toggle navigation"
          @click="toggleCollapse"
        >
          <span class="navbar-toggler-icon"></span>
          <slot name="collapse"></slot>
        </button>

        <div :class="['navbar-collapse',{collapse:collapsed}]">
          <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
            <slot></slot>
          </ul>
          <ul v-if="slots.right" class="navbar-nav navbar-right">
            <slot name="right"></slot>
          </ul>
        </div>
      </div>
    </nav>
    <div
      v-show="isLowerNavbarShowing"
      ref="lowerNavbar"
      class="lower-navbar-container"
    >
      <slot name="lower-navbar">
        <site-nav-button />
        <page-nav-button />
      </slot>
    </div>
  </div>
</template>

<script>
import $ from './utils/NodeList';
import { toBoolean } from './utils/utils';
import normalizeUrl from './utils/urls';
import SiteNavButton from './SiteNavButton.vue';
import PageNavButton from './PageNavButton.vue';

export default {
  components: {
    SiteNavButton,
    PageNavButton,
  },
  props: {
    type: {
      type: String,
      default: 'primary',
    },
    addClass: {
      type: String,
      default: '',
    },
    fixed: {
      type: Boolean,
      default: false,
    },
    defaultHighlightOn: {
      type: String,
      default: 'sibling-or-child',
    },
  },
  provide() {
    return {
      toggleLowerNavbar: this.toggleLowerNavbar,
    };
  },
  data() {
    return {
      id: 'bs-example-navbar-collapse-1',
      collapsed: true,
      styles: {},
      isLowerNavbarShowing: false,
    };
  },
  computed: {
    fixedBool() {
      return toBoolean(this.fixed);
    },
    fixedOptions() {
      if (this.fixedBool) {
        return 'navbar-fixed';
      }
      return '';
    },
    slots() {
      return this.$scopedSlots;
    },
    themeOptions() {
      switch (this.type) {
      case 'none':
        return '';
      case 'light':
        return 'navbar-light bg-light';
      case 'dark':
        return 'navbar-dark bg-dark';
      case 'primary':
      default:
        return 'navbar-dark bg-primary';
      }
    },
  },
  methods: {
    toggleCollapse(e) {
      if (e) { e.preventDefault(); }
      this.collapsed = !this.collapsed;
    },
    // Splits a normalised URL into its parts,
    // e.g http://site.org/foo/bar/index.html -> ['foo','bar','index.html']
    splitUrl(url) {
      const u = new URL(normalizeUrl(url));
      return `${u.pathname}`.substr(1).split('/');
    },
    isSibling(url, href) {
      const hParts = this.splitUrl(href);
      const uParts = this.splitUrl(url);
      if (hParts.length !== uParts.length) {
        return false;
      }
      for (let i = 0; i < hParts.length - 1; i += 1) {
        if (hParts[i] !== uParts[i]) {
          return false;
        }
      }
      return true;
    },
    isChild(url, href) {
      const hParts = this.splitUrl(href);
      const uParts = this.splitUrl(url);
      if (uParts.length <= hParts.length) {
        return false;
      }
      for (let i = 0; i < hParts.length; i += 1) {
        if (hParts[i] !== uParts[i]) {
          return false;
        }
      }
      return true;
    },
    isExact(url, href) {
      return normalizeUrl(url) === normalizeUrl(href);
    },
    addClassIfDropdown(dropdownLinks, a, li) {
      if (dropdownLinks.includes(a)) {
        a.classList.add('dropdown-current');
        this.addClassIfSubmenu(a, li);
      }
    },
    addClassIfSubmenu(a, li) {
      let el = a.parentElement;
      while (el !== li) {
        if (el.classList.contains('dropdown-submenu')) {
          $(el).findChildren('a').each(aChild => aChild.classList.add('dropdown-current'));
        }
        el = el.parentElement;
      }
    },
    highlightLink(url) {
      const defHlMode = this.defaultHighlightOn;
      const navLis = Array.from(this.$el.querySelector('.navbar-nav').children);
      // attempt an exact match first
      for (let i = 0; i < navLis.length; i += 1) {
        const li = navLis[i];
        const standardLinks = [li];
        const navLinks = Array.from(li.querySelectorAll('a.nav-link'));
        const dropdownLinks = Array.from(li.querySelectorAll('a.dropdown-item'));
        const allNavLinks = standardLinks.concat(navLinks).concat(dropdownLinks).filter(a => a.href);
        for (let j = 0; j < allNavLinks.length; j += 1) {
          const a = allNavLinks[j];
          const hlMode = a.getAttribute('highlight-on') || defHlMode;
          if (hlMode === 'none') {
            // eslint-disable-next-line no-continue
            continue;
          }
          // terminate early on an exact match
          if (this.isExact(url, a.href)) {
            li.classList.add('current');
            this.addClassIfDropdown(dropdownLinks, a, li);
            return;
          }
        }
      }
      // fallback to user preference, otherwise
      for (let i = 0; i < navLis.length; i += 1) {
        const li = navLis[i];
        const standardLinks = [li];
        const navLinks = Array.from(li.querySelectorAll('a.nav-link'));
        const dropdownLinks = Array.from(li.querySelectorAll('a.dropdown-item'));
        const allNavLinks = standardLinks.concat(navLinks).concat(dropdownLinks).filter(a => a.href);
        for (let j = 0; j < allNavLinks.length; j += 1) {
          const a = allNavLinks[j];
          const hlMode = a.getAttribute('highlight-on') || defHlMode;
          if (hlMode === 'none') {
            // eslint-disable-next-line no-continue
            continue;
          }
          // Ignores invalid navbar highlight rule
          if (hlMode === 'sibling-or-child') {
            if (this.isSibling(url, a.href) || this.isChild(url, a.href)) {
              li.classList.add('current');
              this.addClassIfDropdown(dropdownLinks, a, li);
              return;
            }
          } else if (hlMode === 'sibling') {
            if (this.isSibling(url, a.href)) {
              li.classList.add('current');
              this.addClassIfDropdown(dropdownLinks, a, li);
              return;
            }
          } else if (hlMode === 'child') {
            if (this.isChild(url, a.href)) {
              li.classList.add('current');
              this.addClassIfDropdown(dropdownLinks, a, li);
              return;
            }
          }
        }
      }
    },
    toggleLowerNavbar() {
      if (this.$refs.lowerNavbar.childElementCount > 0) {
        this.isLowerNavbarShowing = true;
      } else {
        this.isLowerNavbarShowing = false;
      }
    },
  },
  created() {
    this._navbar = true;
  },
  mounted() {
    const $dropdown = $('.dropdown>[data-toggle="dropdown"]', this.$el).parent();
    $dropdown.on('click', '.dropdown-toggle', (e) => {
      e.preventDefault();
      $dropdown.each((content) => {
        if (content.contains(e.target)) content.classList.toggle('open');
      });
    }).on('click', '.dropdown-menu>li>a', (e) => {
      $dropdown.each((content) => {
        if (content.contains(e.target)) content.classList.remove('open');
      });
    }).onBlur((e) => {
      $dropdown.each((content) => {
        if (!content.contains(e.target)) content.classList.remove('open');
      });
    });
    $(this.$el).on('click', 'li:not(.dropdown)>a', (e) => {
      if (e.target.classList.contains('submenu-toggle')) { return; }
      setTimeout(() => { this.collapsed = true; }, 200);
    }).onBlur((e) => {
      if (!this.$el.contains(e.target)) { this.collapsed = true; }
    });
    if (this.slots.collapse) $('[data-toggle="collapse"]', this.$el).on('click', e => this.toggleCollapse(e));

    // highlight current nav link
    this.highlightLink(window.location.href);

    this.toggleLowerNavbar();
    $(window).on('resize', this.toggleLowerNavbar);
  },
  beforeDestroy() {
    $('.dropdown', this.$el).off('click').offBlur();
    if (this.slots.collapse) $('[data-toggle="collapse"]', this.$el).off('click');
    $(window).off('resize', this.toggleLowerNavbar);
  },
};
</script>

<style scoped>
    @media (max-width: 767px) {
        .navbar-collapse {
            max-height: 80vh !important;
            overflow-x: hidden !important;
            overflow-y: scroll !important;
        }
    }

    .navbar-fixed {
        position: fixed;
        width: 100%;
        z-index: 1000;
    }

    >>> .dropdown-current {
        color: #fff !important;
        background: #007bff;
    }

    .lower-navbar-container {
        background-color: #fff;
        border-bottom: 1px solid #c1c1c1;
        height: 50px;
        width: 100%;
        position: relative;
    }
</style>
