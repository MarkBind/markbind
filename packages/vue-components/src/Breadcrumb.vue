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
            {{ item }}
          </a>
          <a v-else href="#">
            {{ item }}
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
      showBreadcrumb: true,
      items: ['Next', 'NextNext', 'NextNextNext'],
    };
  },
  methods: {
    isLast(index, length) {
      return index === length - 1;
    },
  },
};
</script>
