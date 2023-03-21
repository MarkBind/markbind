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

    document.querySelectorAll('ul').forEach((el) => {
      if (firstRootFound) {
        return;
      }
      if (el.classList.contains('site-nav-list-root')) {
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
    window.console.warn(this.items);
  },
};
</script>

<style scoped>
    /* Make cursor default when there is no link */
    .active:hover {
        cursor: default;
    }
</style>
