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
    const currentUrl = normalizeUrl(new URL(window.location.href).pathname);
    const splitArr = currentUrl.split('/');
    let tempUrl = window.location.href.origin;
    if (tempUrl === undefined) {
      tempUrl = '';
    }
    for (let i = 0; i < splitArr.length; i += 1) {
      if (i === 0) {
        this.items.push({ title: 'Home', link: tempUrl.concat('/index.html') });
      } else {
        tempUrl += '/'.concat(splitArr[i]);
        this.items.push({ title: splitArr[i], link: tempUrl });
      }
    }
  },
};
</script>
