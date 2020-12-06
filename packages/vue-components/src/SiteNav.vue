<template>
  <div class="site-nav-root">
    <slot></slot>
  </div>
</template>

<script>
import normalizeUrl from './utils/urls';

export default {
  name: 'SiteNav',
  mounted() {
    const currentUrl = normalizeUrl(new URL(window.location.href).pathname);

    this.$el.querySelectorAll('a[href]').forEach((el) => {
      const linkUrl = normalizeUrl(el.getAttribute('href'));
      if (currentUrl !== linkUrl) {
        return;
      }

      el.classList.add('current');
      let currentEl = el.parentElement;
      while (currentEl && currentEl !== this.$el) {
        if (currentEl.tagName.toLowerCase() === 'ul'
            && currentEl.classList.contains('site-nav-dropdown-container')) {
          currentEl.classList.add('site-nav-dropdown-container-open');
        }
        currentEl = currentEl.parentElement;
      }
    });
  },
};
</script>

<style>
/* Site navigation */

.site-nav-root a.current {
    color: #0072ec;
}

/* Navigation list */

.site-nav-list {
    list-style-type: none;
    padding-left: 0;
}

.site-nav-list-root {
    margin: 0 -12px;
}

.site-nav-default-list-item {
    display: flex;
    padding: 0.5rem 0 0 2.8rem;
    transition: background-color 0.08s;
    color: #454545;
    cursor: pointer;
}

.site-nav-custom-list-item {
    padding: 0.5rem 0 0 2.8rem;
    color: #454545;
}

.site-nav-list-item-0 {
    padding: 0.8rem 0 0.4rem 0.8rem;
    font-weight: 600;
    font-size: 1.05em;
}

.site-nav-list-item-1 {
    padding: 0.5rem 0 0.3rem 1.3rem;
}

.site-nav-list-item-2 {
    padding: 0.5rem 0 0.2rem 1.8rem;
    font-size: 0.95em;
}

.site-nav-list-item-3 {
    padding: 0.5rem 0 0.2rem 2.4rem;
    font-size: 0.87em;
}

.site-nav-default-list-item:hover {
    background-color: rgba(214, 233, 255, 0.35);
}

.site-nav-default-list-item a {
    display: inline-block;
    height: 100%;
    color: #454545;
}

.site-nav-default-list-item:hover a {
    color: black;
    text-decoration: none;
}

/* Navigation dropdown menu */

.site-nav-dropdown-btn-icon {
    display: inline-block;
    align-self: center;
    width: 1.5em;
    height: 1.5em;
    text-align: center;
    border-radius: 1rem;
    margin: 0 0.5rem 0 auto;
    transition: 0.4s;
    transform: rotate(0deg);
    -webkit-transition: 0.4s;
    -webkit-transform: rotate(0deg);
}

.site-nav-dropdown-btn-icon:hover {
    background-color: #d8e3fb;
}

.site-nav-rotate-icon {
    color: #4c7ff1;
    transform: rotate(-180deg);
    -webkit-transform: rotate(-180deg);
}

.site-nav-dropdown-container {
    background: transparent;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.15s ease-out;
    -webkit-transition: max-height 0.15s ease-out;
}

.site-nav-dropdown-container-open {
    max-height: 1000px;
    transition: max-height 0.25s ease-in;
    -webkit-transition: max-height 0.25s ease-in;
}
</style>
