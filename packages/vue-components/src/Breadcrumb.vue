<template>
  <div>
    <nav aria-label="breadcrumb" class="breadcrumb-divider">
      <ol class="breadcrumb">
        <li class="notlink breadcrumb-marker">
          ››&nbsp;&nbsp;
        </li>
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

<script lang="ts">
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
    // Get root of site-nav
    const siteNav = Array.from(document.querySelectorAll('ul')).find(el =>
      el.classList.contains('site-nav-list-root'));

    if (!siteNav) return;

    // Find current link in site-nav
    const currLink = siteNav.querySelector('.current');

    if (!currLink) return;

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

    .breadcrumb-divider {
        --bs-breadcrumb-divider: '›';
    }

    /* Change font size to center arrows */
    .breadcrumb-marker {
        font-size: 15px;
    }

    .breadcrumb-item::before {
        font-size: 15px;
    }
</style>
