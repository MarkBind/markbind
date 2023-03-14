<template>
  <div v-if="showBreadcrumb">
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li
          v-for="(item, index) in items"
          :key="item"
          :class="['breadcrumb-item', {'active': isLast(index, items.length)}]"
          :aria-current="{'page': isLast(index, items.length)}"
        >
          <a v-if="isLast(index, items.length)">
            {{ item.title }}
          </a>
          <a v-else :href="item.link">
            {{ item.title }}
          </a>
        </li>
      </ol>
    </nav>
  </div>
</template>

<script>
import normalizeUrl from './utils/urls';

export default {
  data() {
    return {
      showBreadcrumb: true,
      items: [],
    };
  },
  methods: {
    isLast(index, length) {
      return index === length - 1;
    },
  },
  mounted() {
    let siteNav = null;
    // const currentUrl = normalizeUrl(new URL(window.location.href).pathname);
    let firstRootFound = false;

    document.querySelectorAll('ul').forEach((el) => {
      if (firstRootFound) {
        return;
      }
      if (el.classList.contains('site-nav-list-root')) {
        window.console.warn('SITENAV LIST ROOT FOUND');
        siteNav = el;
        firstRootFound = true;
      }
    });

    siteNav.querySelectorAll('a[href]').forEach((el) => {
      window.console.warn(el.textContent);
      const linkUrl = normalizeUrl(el.getAttribute('href'));
      if (!el.classList.contains('current')) {
        return;
      }

      this.items.unshift({
        'title': el.textContent,
        'link': linkUrl,
      });

      let currentEl = el.parentElement;
      while (currentEl !== siteNav) {
        if (currentEl.tagName.toLowerCase() === 'ul') {
          const aElement = currentEl.parentElement.querySelector('a[href]');
          const currUrl = normalizeUrl(aElement.getAttribute('href'));
          this.items.unshift({
            'title': aElement.textContent,
            'link': currUrl,
          });
        }
        currentEl = currentEl.parentElement;
      }
    });
    window.console.warn(this.items);
  },
};
</script>
