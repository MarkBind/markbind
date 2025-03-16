<template>
  <div class="grid-container">
    <span class="search-bar">
      <template v-if="searchable">
        <input
          v-model="value"
          type="text"
          class="form-control search-bar"
          :placeholder="placeholder"
          @input="update"
        />
      </template>
    </span>
    <div class="container">
      <div class="row justify-content-starts gy-3">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    blocks: {
      type: String,
      default: '2',
    },
    placeholder: {
      type: String,
      default: 'Search',
    },
    searchable: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
  },
  methods: {
    update() {
      const regexes = this.value.split(' ')
        .filter(searchKeyword => searchKeyword !== '')
        .map(searchKeyword => searchKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .map(searchKeyword => new RegExp(searchKeyword, 'ig'));

      this.$children.forEach((child) => {
        if (child.$props.disabled) {
          return;
        }

        if (this.value === '' && !child.$props.disabled) {
          child.$data.disableCard = false;
          return;
        }

        const tags = child.computedTags;
        const keywords = child.computedKeywords;
        const header = ''; // child.$slots.header;
        const searchTarget = tags.join(' ') + keywords.join(' ') + header;
        regexes.forEach((regex) => {
          if (searchTarget.match(regex)) {
            child.$data.disableCard = false;
            return true;
          }
          child.$data.disableCard = true;
          return false;
        });
      });
    },
  },
  data() {
    return {
      value: '',
    };
  },
  mounted() {
    this.isMounted = true;
  },
};

</script>

<style scoped>
    .search-bar {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin: 0;
        padding: 5px;
    }

    .row {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
    }

    .grid-container {
        background-color: rgb(231 231 231);
        border-radius: 8px;
        padding: 20px;
        margin: 10px 0;
    }

    .container {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .form-control {
        min-width: 12.7em;
        max-width: 25.4em;
    }
</style>
