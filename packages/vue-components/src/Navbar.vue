<template>
  <div>
    <nav
      ref="navbar"
      :class="['navbar', 'navbar-expand-md', 'd-print-none', themeOptions, addClass, fixedOptions]"
    >
      <div class="container-fluid">
        <div class="navbar-left">
          <slot name="brand"></slot>
        </div>

        <div class="navbar-right">
          <ul v-if="slots.right" class="navbar-nav">
            <slot name="right"></slot>
          </ul>
          <dark-mode-toggle class="navbar-dark-mode-toggle" />
          <button
            type="button"
            class="navbar-toggler"
            :class="{ 'navbar-toggler-open': isMobileNavOpen }"
            aria-controls="navbar-primary-nav"
            :aria-expanded="isMobileNavOpen ? 'true' : 'false'"
            aria-label="Toggle navigation"
            @click="toggleMobileNav"
          >
            <span class="navbar-toggler-bar"></span>
            <span class="navbar-toggler-bar"></span>
            <span class="navbar-toggler-bar"></span>
          </button>
        </div>
        <div
          id="navbar-primary-nav"
          ref="navbarDefault"
          :class="['navbar-default', { 'navbar-default-open': isMobileNavOpen }]"
        >
          <ul class="navbar-nav me-auto mt-2 mt-lg-0">
            <slot></slot>
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
import DarkModeToggle from './DarkModeToggle.vue';

export default {
  components: {
    SiteNavButton,
    PageNavButton,
    DarkModeToggle,
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
      type: [Boolean, String],
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
      isParentNavbar: true,
    };
  },
  data() {
    return {
      id: 'bs-example-navbar-collapse-1',
      styles: {},
      isLowerNavbarShowing: false,
      isMobileNavOpen: false,
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
      return this.$slots;
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
    // Splits a normalised URL into its parts,
    // e.g http://site.org/foo/bar/index.html -> ['foo','bar','index.html']
    splitUrl(url) {
      const u = new URL(normalizeUrl(url));
      return `${u.pathname}`.slice(1).split('/');
    },
    isEqualExceptLast(hParts, uParts) {
      for (let i = 0; i < hParts.length - 1; i += 1) {
        if (hParts[i] !== uParts[i]) {
          return false;
        }
      }
      return true;
    },
    isSibling(url, href) {
      const hParts = this.splitUrl(href);
      const uParts = this.splitUrl(url);
      if (hParts.length !== uParts.length) {
        return false;
      }
      return this.isEqualExceptLast(hParts, uParts);
    },
    isChild(url, href) {
      const hParts = this.splitUrl(href);
      const uParts = this.splitUrl(url);
      if (uParts.length <= hParts.length) {
        return false;
      }
      return this.isEqualExceptLast(hParts, uParts);
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
      const navLis = [];
      this.$el.querySelectorAll('.navbar-nav').forEach(nav => navLis.push(...Array.from(nav.children)));

      // Each li element in navbar grouped with all its own and children links
      const allNavLinkGroups = [];
      for (let i = 0; i < navLis.length; i += 1) {
        const li = navLis[i];
        const standardLinks = [li];
        const navLinks = Array.from(li.querySelectorAll('a.nav-link'));
        const dropdownLinks = Array.from(li.querySelectorAll('a.dropdown-item'));
        const linksInLi = standardLinks.concat(navLinks).concat(dropdownLinks).filter(a => a.href);

        allNavLinkGroups.push({
          li,
          links: linksInLi,
          dropdownLinks,
        });
      }

      // 1: Check for Exact Match,return immediately if found
      for (let i = 0; i < allNavLinkGroups.length; i += 1) {
        const group = allNavLinkGroups[i];
        for (let j = 0; j < group.links.length; j += 1) {
          const a = group.links[j];
          const hlMode = a.getAttribute('highlight-on') || defHlMode;
          if (hlMode !== 'none' && this.isExact(url, a.href)) {
            group.li.classList.add('current');
            this.addClassIfDropdown(group.dropdownLinks, a, group.li);
            return;
          }
        }
      }

      // 2: Find Best Fuzzy Match
      // Strategies: 'sibling-or-child' (default), 'sibling', 'child'
      // Tie-breaker: Longest path length (most specific match)
      let bestMatch = null;
      let maxPathLength = -1;

      allNavLinkGroups.forEach((group) => {
        group.links.forEach((a) => {
          const hlMode = a.getAttribute('highlight-on') || defHlMode;
          if (hlMode !== 'none') {
            let isMatch = false;
            if (hlMode === 'sibling-or-child') {
              isMatch = this.isSibling(url, a.href) || this.isChild(url, a.href);
            } else if (hlMode === 'sibling') {
              isMatch = this.isSibling(url, a.href);
            } else if (hlMode === 'child') {
              isMatch = this.isChild(url, a.href);
            }

            if (isMatch) {
              const linkParts = this.splitUrl(a.href);
              const pathLength = linkParts.length;

              if (pathLength > maxPathLength) {
                maxPathLength = pathLength;
                bestMatch = {
                  li: group.li,
                  a,
                  dropdownLinks: group.dropdownLinks,
                };
              }
            }
          }
        });
      });

      // Apply the highlight to the best match found (if any)
      if (bestMatch) {
        bestMatch.li.classList.add('current');
        this.addClassIfDropdown(bestMatch.dropdownLinks, bestMatch.a, bestMatch.li);
      }
    },
    toggleLowerNavbar() {
      if (this.$refs.lowerNavbar.childElementCount > 0) {
        this.isLowerNavbarShowing = true;
      } else {
        this.isLowerNavbarShowing = false;
      }
    },
    toggleMobileNav() {
      this.isMobileNavOpen = !this.isMobileNavOpen;
    },
    closeMobileNav() {
      this.isMobileNavOpen = false;
    },
    handleWindowResize() {
      this.toggleLowerNavbar();
      if (window.innerWidth >= 768) {
        this.closeMobileNav();
      }
    },
    bindMobileNavCloseOnNavigate() {
      this.$refs.navbarDefault.querySelectorAll('a.nav-link:not(.dropdown-toggle), a.dropdown-item')
        .forEach((link) => {
          link.addEventListener('click', this.closeMobileNav);
        });
    },
  },
  created() {
    this._navbar = true;
  },
  mounted() {
    const $dropdown = $('.dropdown>[data-bs-toggle="dropdown"]', this.$el).parent();
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

    // highlight current nav link
    this.highlightLink(window.location.href);

    this.toggleLowerNavbar();
    this.bindMobileNavCloseOnNavigate();
    $(window).on('resize', this.handleWindowResize);
  },
  beforeUnmount() {
    $('.dropdown', this.$el).off('click').offBlur();
    $(window).off('resize', this.handleWindowResize);
    if (this.$refs.navbarDefault) {
      this.$refs.navbarDefault.querySelectorAll('a.nav-link:not(.dropdown-toggle), a.dropdown-item')
        .forEach((link) => {
          link.removeEventListener('click', this.closeMobileNav);
        });
    }
  },
};
</script>

<style scoped>
    .container-fluid {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
    }

    @media (width >= 768px) {
        .container-fluid {
            flex-wrap: nowrap;
        }

        .navbar-left {
            order: 1;
        }

        .navbar-default {
            order: 2;
            display: flex !important;
        }

        .navbar-right {
            order: 3;
        }

        .navbar-toggler {
            display: none;
        }
    }

    @media (width <= 767px) {
        .navbar {
            padding: 0;
        }

        .container-fluid {
            padding: 0.625rem 1rem 0;
            align-items: center;
        }

        .navbar-left {
            order: 1;
            flex: 0 0 auto;
            min-width: 0;
            max-width: none;
            padding: 0;
            align-self: center;
        }

        .navbar-left :deep(*) {
            white-space: normal;
        }

        .navbar-right {
            order: 2;
            flex: 1 1 0%;
            min-width: 0;
            max-width: none;
            padding: 0;
            gap: 0.5rem;
            justify-content: flex-end;
            align-items: center;
            flex-wrap: nowrap;
        }

        .navbar-right :deep(.navbar-nav) {
            flex: 1 1 auto;
            flex-direction: row;
            align-items: center;
            min-width: 0;
            margin: 0;
            padding: 0;
            width: auto;
        }

        .navbar-right :deep(.navbar-nav > li) {
            display: flex;
            align-items: center;
            align-self: center;
            flex: 1 1 auto;
            min-width: 0;
            width: auto;
            position: relative;
        }

        .navbar-right :deep(.navbar-form) {
            margin: 0;
            padding: 0;
            width: 100%;
        }

        .navbar-right :deep(.dropdown) {
            width: 100%;
            min-width: 0;
        }

        .navbar-right :deep(.search-dropdown-menu) {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            margin-top: 0.25rem;
        }

        .navbar-right :deep(.form-control) {
            min-width: 0 !important;
            width: 100%;
            max-width: none;
            height: 2.5rem;
            padding-top: 0.375rem;
            padding-bottom: 0.375rem;
        }

        .navbar-right :deep(.placeholder-div-hidden) {
            display: none !important;
        }

        .navbar-right .navbar-dark-mode-toggle :deep(.dark-mode-toggle) {
            align-self: center;
            height: 2.5rem;
            width: 2.5rem;
            flex-shrink: 0;
        }

        .navbar-toggler {
            display: flex;
            flex-shrink: 0;
            align-self: center;
        }

        .navbar-default {
            order: 3;
            flex: 0 0 100%;
            display: none !important;
            width: auto;
            margin: 0.625rem -1rem 0;
            padding: 0.5rem 1rem 0.75rem;
            border-top: 1px solid rgb(var(--bs-emphasis-color-rgb) / 15%);
            max-height: min(60vh, calc(100vh - 8rem));
            overflow-y: auto;
            overscroll-behavior: contain;
        }

        .navbar-dark .navbar-default {
            border-top-color: rgb(255 255 255 / 15%);
        }

        .navbar-default-open {
            display: block !important;
        }

        .navbar-default :deep(.navbar-nav) {
            flex-direction: column;
            gap: 0.125rem;
            margin: 0 !important;
            padding: 0;
            width: 100%;
        }

        .navbar-default :deep(.navbar-nav > *) {
            background: transparent;
            flex-grow: 0;
            width: 100%;
        }

        .navbar-default :deep(.navbar-nav > .current) {
            background: rgb(var(--bs-emphasis-color-rgb) / 10%);
            border-radius: 0.375rem;
        }

        .navbar-dark .navbar-default :deep(.navbar-nav > .current) {
            background: rgb(255 255 255 / 10%);
        }

        .navbar-default :deep(.nav-link),
        .navbar-default :deep(.dropdown-toggle) {
            display: block;
            margin: 0;
            width: 100%;
            padding: 0.875rem 0.5rem;
            text-align: left;
            line-height: 1.25;
            border-radius: 0.375rem;
        }

        .navbar-default :deep(.dropdown) {
            display: block;
            width: 100%;
        }
    }

    .navbar-brand {
        display: inline-block;
    }

    .navbar-brand > img,
    .navbar-brand > svg {
        display: block;
    }

    .navbar-right {
        align-items: center;
        display: flex;
        gap: 0.5rem;
        padding-right: 0;
    }

    @media (width >= 768px) {
        .navbar-right {
            padding-right: 1rem;
        }
    }

    .navbar-dark-mode-toggle {
        flex: 0 0 auto;
    }

    .navbar-toggler {
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 4px;
        width: 2.5rem;
        height: 2.5rem;
        padding: 0;
        border: 1px solid rgb(var(--bs-emphasis-color-rgb) / 25%);
        border-radius: 0.375rem;
        background: transparent;
        cursor: pointer;
    }

    .navbar-dark .navbar-toggler {
        border-color: rgb(255 255 255 / 35%);
    }

    .navbar-toggler-bar {
        display: block;
        width: 1.125rem;
        height: 2px;
        background-color: var(--bs-emphasis-color);
        transition: transform 0.2s ease, opacity 0.2s ease;
    }

    .navbar-dark .navbar-toggler-bar {
        background-color: rgb(255 255 255 / 85%);
    }

    .navbar-toggler-open .navbar-toggler-bar:nth-child(1) {
        transform: translateY(6px) rotate(45deg);
    }

    .navbar-toggler-open .navbar-toggler-bar:nth-child(2) {
        opacity: 0;
    }

    .navbar-toggler-open .navbar-toggler-bar:nth-child(3) {
        transform: translateY(-6px) rotate(-45deg);
    }

    .navbar-left {
        align-items: center;
        display: flex;
        font-size: 1.25rem;
        line-height: inherit;
        padding: 0.3125rem 0;
        white-space: nowrap;
    }

    @media (width >= 768px) {
        .navbar-left {
            padding: 0.3125rem 1rem;
        }
    }

    .navbar-fixed {
        position: fixed;
        width: 100%;
        z-index: 1000;
    }

    .navbar-default {
        flex-basis: auto;
        flex-grow: 1;
        align-items: center;
    }

    :deep(.dropdown-current) {
        color: var(--bs-white) !important;
        background: var(--bs-primary);
    }

    .lower-navbar-container {
        background-color: var(--bs-body-bg);
        border-bottom: 1px solid var(--bs-border-color);
        height: 50px;
        width: 100%;
        position: relative;
    }

    /* Navbar link highlight for current page */
    .navbar.navbar-dark .navbar-nav :deep(.current:not(.dropdown) a),
    .navbar.navbar-dark .navbar-nav :deep(.dropdown.current > a) {
        color: var(--bs-white);
    }

    .navbar.navbar-light .navbar-nav :deep(.current:not(.dropdown)) a,
    .navbar.navbar-light .navbar-nav :deep(.dropdown.current > a) {
        color: var(--bs-emphasis-color);
    }

    [data-bs-theme="dark"] .navbar {
        border-bottom: 1px solid var(--bs-border-color);
    }
</style>
