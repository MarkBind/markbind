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
      }
    },
    data () {
      return {
        id: 'bs-example-navbar-collapse-1',
        collapsed: true,
        styles: {}
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
      }
    },
    methods: {
      toggleCollapse (e) {
        e && e.preventDefault()
        this.collapsed = !this.collapsed
      },
      // returns true if url has a common prefix with ancestor url
      // isDescendant(ancestor, url) {
      //   if (!ancestor || !ancestor.children) {
      //     return false;
      //   }
      //   // Only check <a> leaf nodes
      //   if (ancestor.children.length === 0) {
      //     return ancestor.href === url;
      //   }
      //   // otherwise, check all children recursively
      //   return Array.from(ancestor.children).some(node => this.isDescendant(node, url));
      // },
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
        if (this.highlightLinkStrict(url)) {
          return;
        }
        this.hightlightLinkRelaxed(url);
      },
      // Performs a DFS match on links
      highlightLinkStrict(url) {
        const navLis = Array.from(this.$el.querySelector('.navbar-nav').children);
        for (const li of navLis) {
          console.log(li);
          const navLinks = Array.from(li.querySelectorAll('a.nav-link')).filter(a => a.href);
          const navLinks2 = Array.from(li.querySelectorAll('a.dropdown-item')).filter(a => a.href);
          const navnav = navLinks.concat(navLinks2);
          console.log(navnav);
          for (const a of navnav) {
            if (a.href === url) {
              li.classList.add('current');
              console.log(a.href, url);
              return true;
            }
          }
        }
        return false;
      },
      // Performs a common-ancestor match on links
      hightlightLinkRelaxed(url) {
        const navLis = Array.from(this.$el.querySelector('.navbar-nav').children);
        for (const li of navLis) {
          console.log(li);
          const navLinks = Array.from(li.querySelectorAll('a.nav-link')).filter(a => a.href);
          const navLinks2 = Array.from(li.querySelectorAll('a.dropdown-item')).filter(a => a.href);
          const navnav = navLinks.concat(navLinks2);
          console.log(navnav);
          for (const a of navnav) {
            // if (a.href === url) {
            //   li.classList.add('current');
            //   console.log(a.href, url);
            //   return;
            // }
            // check for a common prefix
            const first = new URL(a.href);
            const second = new URL(url);
            const third = `${first.host}${first.pathname}`.split('/');
            const forth = `${second.host}${second.pathname}`.split('/');
            if (third.length > 1 && forth.length > 1 && third[1] === forth[1]) {
              console.log(third, forth);
              li.classList.add('current');
              return true;
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
      // const navLinks = this.$el.querySelectorAll('.navbar .navbar-nav .nav-link');
      // if (!navLinks) {
      //   return;
      // }
      const normUrl = this.normalizeUrl(window.location.href);
      console.log(normUrl);
      this.highlightLink(normUrl);
      // Array.from(navLinks).forEach((node) => {
      //   if (this.isDescendant(node, normUrl)) {
      //     node.classList.add('current');
      //   }
      // });
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
