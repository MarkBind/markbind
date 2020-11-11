<template>
  <nav ref="navbar" :class="['navbar', 'navbar-expand-md', themeOptions, addClass, fixedOptions]">
    <div class="container-fluid">
      <div class="navbar-brand">
        <slot name="brand"/>
      </div>
      <button v-if="!slots.collapse" class="navbar-toggler" type="button" aria-expanded="false" aria-label="Toggle navigation" @click="toggleCollapse">
        <span class="navbar-toggler-icon"/>
        <slot name="collapse"/>
      </button>

      <div :class="['navbar-collapse',{collapse:collapsed}]">
        <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
          <slot/>
        </ul>
        <ul v-if="slots.right" class="navbar-nav navbar-right">
          <slot name="right"/>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
  import $ from './utils/NodeList.js'
  import { toBoolean } from './utils/utils';
  export default {
    props: {
      type: {
        type: String,
        default: 'primary'
      },
      addClass: {
        type: String,
        default: ''
      },
      fixed: {
        type: Boolean,
        default: false
      },
      highlightOn: {
        type: String,
        default: 'sibling-or-child'
      }
    },
    data () {
      return {
        id: 'bs-example-navbar-collapse-1',
        collapsed: true,
        styles: {},
      }
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
      slots () {
        return this.$slots
      },
      themeOptions () {
        switch (this.type) {
        case 'none':
          return ''
        case 'light':
          return 'navbar-light bg-light'
        case 'dark':
          return 'navbar-dark bg-dark'
        case 'primary':
        default:
          return 'navbar-dark bg-primary'
        }
      },
    },
    methods: {
      toggleCollapse (e) {
        e && e.preventDefault()
        this.collapsed = !this.collapsed
      },
      // Adds dir index and lowercases url, e.g http://foo/ or http://foo becomes http://foo/index.html
      normalizeUrl(url) {
        if (url.endsWith('.html')) {
          return url.toLowerCase();
        } else if (url.endsWith('/')) {
          return `${url}index.html`.toLowerCase();
        } else {
          return `${url}/index.html`.toLowerCase();
        }
      },
      // Splits a normalised URL into its parts, e.g http://site.org/foo/bar/index.html -> ['foo','bar','index.html']
      splitUrl(url) {
        const u = new URL(this.normalizeUrl(url));
        return `${u.pathname}`.substr(1).split('/');
      },
      isSibling(url, href) {
        const hParts = this.splitUrl(href);
        const uParts = this.splitUrl(url);
        if (hParts.length !== uParts.length) {
          return false;
        }
        for (let i = 0; i < hParts.length - 1; i++) {
          if (hParts[i] !== uParts[i]) {
            return false;
          }
        }
        return true;
      },
      isChild(url, href) {
        const hParts = this.splitUrl(href);
        const uParts = this.splitUrl(url);
        if (hParts.length <= uParts.length) {
          return false;
        }
        for (let i = 0; i < uParts.length - 1; i++) {
          if (hParts[i] !== uParts[i]) {
            return false;
          }
        }
        return true;
      },
      highlightLink(url) {
        const hlMode = this.highlightOn;
        if (hlMode === 'none') {
          return;
        }
        const navLis = Array.from(this.$el.querySelector('.navbar-nav').children);
        // attempt an exact match first
        for (const li of navLis) {
          const navLinks = Array.from(li.querySelectorAll('a.nav-link'));
          const dropdownLinks = Array.from(li.querySelectorAll('a.dropdown-item'));
          const allNavLinks = navLinks.concat(dropdownLinks).filter(a => a.href);
          for (const a of allNavLinks) {
            const aNorm = this.normalizeUrl(a.href);
            const urlNorm = this.normalizeUrl(url);
            // terminate early on an exact match
            if (aNorm === urlNorm) {
              li.classList.add('current');
              return;
            }
          }
        }
        // fallback to user preference, otherwise
        for (const li of navLis) {
          const navLinks = Array.from(li.querySelectorAll('a.nav-link'));
          const dropdownLinks = Array.from(li.querySelectorAll('a.dropdown-item'));
          const allNavLinks = navLinks.concat(dropdownLinks).filter(a => a.href);
          for (const a of allNavLinks) {
            if (hlMode === 'sibling-or-child') {
              if (this.isSibling(url, a.href) || this.isChild(url, a.href)) {
                li.classList.add('current');
                return;
              }
            } else if (hlMode === 'sibling') {
              if (this.isSibling(url, a.href)) {
                li.classList.add('current');
                return;
              }
            } else if (hlMode === 'child') {
              if (this.isChild(url, a.href)) {
                li.classList.add('current');
                return;
              }
            } else {
              // invalid option, ignore
              return;
            }
          }
        }
      }
    },
    created () {
      this._navbar = true
    },
    mounted () {
      let $dropdown = $('.dropdown>[data-toggle="dropdown"]',this.$el).parent()
      $dropdown.on('click', '.dropdown-toggle', (e) => {
        e.preventDefault()
        $dropdown.each((content) => {
          if (content.contains(e.target)) content.classList.toggle('open')
        })
      }).on('click', '.dropdown-menu>li>a', (e) => {
        $dropdown.each((content) => {
          if (content.contains(e.target)) content.classList.remove('open')
        })
      }).onBlur((e) => {
        $dropdown.each((content) => {
          if (!content.contains(e.target)) content.classList.remove('open')
        })
      })
      $(this.$el).on('click','li:not(.dropdown)>a', e => {
        setTimeout(() => { this.collapsed = true }, 200)
      }).onBlur(e => {
        if (!this.$el.contains(e.target)) { this.collapsed = true }
      })
      if (this.slots.collapse) $('[data-toggle="collapse"]',this.$el).on('click', (e) => this.toggleCollapse(e))

      // highlight current nav link
      this.highlightLink(window.location.href);
    },
    beforeDestroy () {
      $('.dropdown',this.$el).off('click').offBlur()
      if (this.slots.collapse) $('[data-toggle="collapse"]',this.$el).off('click')
    }
  }
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
</style>
