<template>
  <div>
    Loading...
  </div>
</template>

<script>
import {getFragmentByHash, toBoolean} from './utils/utils.js'

export default {
  props: {
    src: {
      type: String
    },
    fragment: {
      type: String // fragment identified (the '#' in URI)
    },
    delay: {
      type: Boolean,
      default: false
    },
    _hasFetched: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    // Vue 2.0 coerce migration
    delayBool () {
      return toBoolean(this.delay);
    }
    // Vue 2.0 coerce migration end
  },
  methods: {
    fetch() {
      if (!this.src) {
        return;
      }
      if (this._hasFetched) {
        return;
      }
      jQuery.get(this.src)
        .done((response) => {
          var result = response;
          if (this.fragment) {
            var tempDom = jQuery('<temp>').append(jQuery.parseHTML(result));
            var appContainer = jQuery('#' + this.fragment, tempDom);
            result = appContainer.html();
          }
          this._hasFetched = true
          // result is empty / undefined
          if (result == void(0) && this.fragment) {
            this.$el.innerHTML = `<strong>Error</strong>: Failed to retrieve page fragment: ${this.src}#${this.fragment}`
            return
          }

          // Mount result in retriever
          let tempComponent = Vue.extend({
            template: `<div>\n${result}\n</div>`,
          })
          new tempComponent().$mount(this.$el);
          this.$emit('src-loaded');
        })
        .fail((error) => {
          console.error(error.responseText)
          this.$el.innerHTML = `<strong>Error</strong>: Failed to retrieve content from source: <em>${this.src}</em>`
          this.$emit('src-loaded');
        });
    }
  },
  mounted() {
    this.$nextTick( function () {
        if (!this.src) {
          this.$el.innerHTML = ''
        } else {
          var hash = getFragmentByHash(this.src)
          if (hash) {
            this.fragment = hash
            this.src = this.src.split('#')[0];
          }
        }

        if (!this.delayBool) {
          this.fetch();
        }
    })
  }
}
</script>
