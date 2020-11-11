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
      defaultHighlightOn: {
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
      // add directory index, e.g http://foo/ or http://foo becomes http://foo/index.html
      normalizeUrl(url) {
        if (url.endsWith('.html')) {
          return url;
        } else if (url.endsWith('/')) {
          return `${url}index.html`;
        } else {
          return `${url}/index.html`;
        }
      },
      highlightLink(url) {
        // Performs an exact equality match on links
        if (this.hasLinkMatch(url, true)) {
          return;
        }
        return this.hasLinkMatch(url, false);
      },
      hasLinkMatch(url, isStrict) {
        const navLis = Array.from(this.$el.querySelector('.navbar-nav').children);
        for (const li of navLis) {
          // there are two kinds of navlinks, get all
          const navLinks = Array.from(li.querySelectorAll('a.nav-link'));
          const dropdownLinks = Array.from(li.querySelectorAll('a.dropdown-item'));
          const allNavLinks = navLinks.concat(dropdownLinks).filter(a => a.href);
          for (const a of allNavLinks) {
            const aNorm = this.normalizeUrl(a.href);
            const urlNorm = this.normalizeUrl(url);
            if (isStrict) {
              // checks by strict equality of URL
              if (aNorm === urlNorm) {
                li.classList.add('current');
                return true;
              }
            } else {
              const aTagUrl = new URL(aNorm);
              const browserUrl = new URL(urlNorm);
              const aParts = `${aTagUrl.host}${aTagUrl.pathname}`.split('/').slice(1);
              const bParts = `${browserUrl.host}${browserUrl.pathname}`.split('/').slice(1);
              switch (this.defaultHighlightOn) {
                case 'sibling-or-child':
                  // check for same ancestor
                  if (aParts[0] === bParts[0]) {
                    li.classList.add('current');
                    return true;
                  }
                  break;
                case 'sibling':
                  // check for exact same prefix parts in both URLs
                  if (aParts.length === bParts.length) {
                    for (let i = 0; i < aParts.length; i++) {
                      if (aParts[i] !== bParts[i]) {
                        return false;
                      }
                    }
                    li.classList.add('current');
                    return true;
                  }
                  break;
                case 'child':
                  // check for same ancestor, and <a> tag url has more parts
                  if (aParts[0] === bParts[0] && aParts.length > bParts.length) {
                    li.classList.add('current');
                    return true;
                  }
                  break;
                case 'none':
                  return true;
                default:
                  break;
              }
            }
          }
        }
        return false;
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
