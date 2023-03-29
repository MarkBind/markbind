<template>
  <div>
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li
          v-for="(item, index) in items"
          :key="index"
          :class="['breadcrumb-item',
                   {'notlink': item.link === null},
          ]"
          :aria-current="{'page': isLast(index, items.length)}"
        >
          <a v-if="item.link === null">
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
    // Identify the first site-nav-list-root
    // In the ideal case, there is only one site-nav-list-root
    // however this is not the case for all pages
    const siteNav = document.querySelector('.site-nav-list-root');

    if (!siteNav) return;

    // Find current link in sitenav
    const currLink = siteNav.querySelector('.current');

    this.items.unshift({
      'title': currLink.textContent,
      'link': null,
    });

    let currentEl = currLink.parentElement;

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
        } else {
          this.items.unshift({
            'title': aElement.textContent,
            'link': aElement.getAttribute('href'),
          });
        }
      }
      currentEl = currentEl.parentElement;
    }
  },
};
</script>

<style scoped>
    .notlink {
        color: #6d757d;
    }
</style>
