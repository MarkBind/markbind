<template>
  <div>
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li
          v-for="(item, index) in items"
          :key="item"
          :class="['breadcrumb-item',
                   {'active': isLast(index, items.length) || item.link === null},
          ]"
          :aria-current="{'page': isLast(index, items.length)}"
        >
          <a v-if="isLast(index, items.length) || item.link === null">
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
    let firstRootFound = false;

    // Identify the first site-nav-list-root
    // In the ideal case, there is only one site-nav-list-root
    // however this is not the case for all pages
    document.querySelectorAll('ul').forEach((el) => {
      if (firstRootFound) {
        return;
      }
      if (el.classList.contains('site-nav-list-root')) {
        siteNav = el;
        firstRootFound = true;
      }
    });

    if (!siteNav) return;

    // Look at all links in the sitenav
    siteNav.querySelectorAll('a[href]').forEach((el) => {
      const linkUrl = normalizeUrl(el.getAttribute('href'));
      // Skip the link if it is not the current link
      if (!el.classList.contains('current')) {
        return;
      }

      // Push the current link and title
      this.items.unshift({
        'title': el.textContent,
        'link': linkUrl,
      });

      // Push all parent links and titles
      let currentEl = el.parentElement;
      while (currentEl !== siteNav) {
        if (currentEl.tagName.toLowerCase() === 'ul') {
          const divElement = currentEl.parentElement.querySelector('div');
          const aElement = divElement.querySelector('a[href]');
          // if does not contain link
          if (aElement === null) {
            this.items.unshift({
              'title': divElement.textContent,
              'link': null,
            });
          }
          this.items.unshift({
            'title': aElement.textContent,
            'link': aElement.getAttribute('href'),
          });
        }
        currentEl = currentEl.parentElement;
      }
    });
  },
};
</script>

<style scoped>
    /* Make cursor default when there is no link */
    .active:hover {
        cursor: default;
    }
</style>
