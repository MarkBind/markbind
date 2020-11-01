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
      hasMatchingUrl(elements, currPage) {
        if (!elements || !elements.children) {
          return false;
        }
        // Only check <a> leaf nodes
        if (elements.children.length === 0) {
          if (elements.href) {
            if (elements.href === currPage) {
              return true;
            }
          }
          return false;
        }
        // otherwise, check all children recursively
        return Array.from(elements.children).some(node => this.hasMatchingUrl(node, currPage));
      }
    },
    created () {
      this._navbar = true
      this.highlightCurrentPage();
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
      const navLinks = this.$el.querySelectorAll('.navbar .navbar-nav .nav-link');
      if (!navLinks) {
        return;
      }
      const currPage = window.location.href;
      Array.from(navLinks).forEach((node) => {
        if (this.hasMatchingUrl(node, currPage)) {
          node.classList.add('current');
        }
      });
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
