<template>
  <div>
    Loading...
  </div>
</template>

<script>
import { getFragmentByHash, toBoolean } from './utils/utils';

export default {
  props: {
    src: {
      type: String,
      default: null,
    },
    fragment: {
      type: String, // fragment identified (the '#' in URI)
      default: null,
    },
    delay: {
      type: Boolean,
      default: false,
    },
    hasFetched: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      /*
       * hasFetched is passed down as a prop. In order to not mutate props (causes Vue warning),
       * we create a copy of hasFetched in the local data to update the value.
       */
      hasFetchedCopy: this.hasFetched,
    };
  },
  computed: {
    // Vue 2.0 coerce migration
    delayBool() {
      return toBoolean(this.delay);
    },
    // Vue 2.0 coerce migration end
    hash() {
      return getFragmentByHash(this.src) || this.fragment;
    },
    srcWithoutHash() {
      return this.src.split('#')[0];
    },
  },
  methods: {
    fetch() {
      if (!this.srcWithoutHash) {
        return;
      }
      if (this.hasFetchedCopy) {
        return;
      }
      jQuery.get(this.srcWithoutHash)
        .done((response) => {
          let result = response;
          if (this.hash) {
            const tempDom = jQuery('<temp>').append(jQuery.parseHTML(result));
            const appContainer = jQuery(`#${this.hash}`, tempDom);
            result = appContainer.html();
          }
          this.hasFetchedCopy = true;
          // result is empty / undefined
          if (result === undefined && this.hash) {
            this.$el.innerHTML = '<strong>Error</strong>: Failed to retrieve page fragment:'
                + ` ${this.srcWithoutHash}#${this.hash}`;
            return;
          }

          const rootData = {
            /*
             * Vue wraps $data as an observer object, we have to "unwrap" it and assign to a
             * variable first before we pass the $data object into the new Vue instance below.
             */
            ...this.$root.$data,
          };

          // Mount result in retriever
          const TempComponent = Vue.extend({
            template: `<div>\n${result}\n</div>`,
            data() {
              return rootData;
            },
          });
          new TempComponent().$mount(this.$el);
          this.$emit('src-loaded');
        })
        .fail((error) => {
          // eslint-disable-next-line no-console
          console.error(error.responseText);
          this.$el.innerHTML = '<strong>Error</strong>: Failed to retrieve content from source: '
              + `<em>${this.srcWithoutHash}</em>`;
          this.$emit('src-loaded');
        });
    },
  },
  mounted() {
    this.$nextTick(function () {
      if (!this.srcWithoutHash) {
        this.$el.innerHTML = '';
      }

      if (!this.delayBool) {
        this.fetch();
      }
    });
  },
};
</script>
