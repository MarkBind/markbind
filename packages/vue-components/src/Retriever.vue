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
  computed: {
    // Vue 2.0 coerce migration
    delayBool() {
      return toBoolean(this.delay);
    },
    // Vue 2.0 coerce migration end
  },
  methods: {
    fetch() {
      if (!this.src) {
        return;
      }
      if (this.hasFetched) {
        return;
      }
      jQuery.get(this.src)
        .done((response) => {
          let result = response;
          if (this.fragment) {
            const tempDom = jQuery('<temp>').append(jQuery.parseHTML(result));
            const appContainer = jQuery(`#${this.fragment}`, tempDom);
            result = appContainer.html();
          }
          this.hasFetched = true;
          // result is empty / undefined
          if (result === undefined && this.fragment) {
            this.$el.innerHTML
                = `<strong>Error</strong>: Failed to retrieve page fragment: ${this.src}#${this.fragment}`;
            return;
          }

          // Mount result in retriever
          const TempComponent = Vue.extend({
            template: `<div>\n${result}\n</div>`,
          });
          new TempComponent().$mount(this.$el);
        })
        .fail((error) => {
          // eslint-disable-next-line no-console
          console.error(error.responseText);
          this.$el.innerHTML
              = `<strong>Error</strong>: Failed to retrieve content from source: <em>${this.src}</em>`;
        });
    },
  },
  mounted() {
    this.$nextTick(function () {
      if (!this.src) {
        this.$el.innerHTML = '';
      } else {
        const hash = getFragmentByHash(this.src);
        if (hash) {
          this.fragment = hash;
          // eslint-disable-next-line prefer-destructuring
          this.src = this.src.split('#')[0];
        }
      }

      if (!this.delayBool) {
        this.fetch();
      }
    });
  },
};
</script>
