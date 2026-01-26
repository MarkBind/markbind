<template>
  <!-- NavBar has z-index of 1000, hence the z-index here should exceed that -->
  <!-- SSR property is required for the snapshot tests to work -->
  <vue-final-modal
    v-if="isMounted"
    v-model="show"
    display-directive="if"
    :modal-id="id"
    :class="['modal']"
    :content-class="['modal-dialog', 'modal-dialog-scrollable', optionalModalSize, optionalCentering]"
    overlay-transition="vfm-fade"
    :content-transition="effectClass"
    :click-to-close="backdrop !== 'false'"
    esc-to-close
    :z-index-fn="() => 2000"
    :teleport-to="'body'"
  >
    <div class="modal-content">
      <div v-if="hasHeader" class="modal-header">
        <h5 class="modal-title">
          <slot name="header"></slot>
        </h5>
        <button
          type="button"
          class="btn-close"
          aria-label="Close"
          @click="close()"
        >
        </button>
      </div>
      <div class="modal-body">
        <slot></slot>
      </div>
      <div v-if="hasFooter || hasOk" class="modal-footer">
        <slot v-if="hasFooter" name="footer"></slot>
        <button
          v-else
          class="btn btn-primary"
          @click="close()"
        >
          {{ okText }}
        </button>
      </div>
    </div>
  </vue-final-modal>
</template>

<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import { VueFinalModal } from 'vue-final-modal';

export default {
  name: 'Modal',
  components: {
    VueFinalModal,
  },
  data: () => ({
    show: false,
    isMounted: false,
    zoomEffect: {
      'enter-active-class': 'modal-zoom',
      'enter-to-class': 'modal-zoom-show',
      'leave-active-class': 'modal-zoom',
      'leave-to-class': 'modal-zoom',
    },
  }),
  props: {
    okText: {
      type: String,
      default: '',
    },
    effect: {
      type: String,
      default: 'zoom',
    },
    id: {
      type: String,
      default: '',
    },
    small: {
      type: Boolean,
      default: false,
    },
    large: {
      type: Boolean,
      default: false,
    },
    center: {
      type: Boolean,
      default: false,
    },
    backdrop: {
      type: String,
      default: '',
    },
  },
  computed: {
    hasHeader() {
      return !!this.$slots.header;
    },
    hasFooter() {
      return !!this.$slots.footer;
    },
    hasOk() {
      return this.okText !== '';
    },
    optionalModalSize() {
      if (!this.small && !this.large) {
        return '';
      }
      return this.small ? 'modal-sm' : 'modal-lg';
    },
    optionalCentering() {
      return this.center ? 'modal-dialog-centered' : '';
    },
    effectClass() {
      return this.effect === 'zoom' ? this.zoomEffect : 'vfm';
    },
  },
  methods: {
    close() {
      this.show = false;
    },
  },
  mounted() {
    this.isMounted = true;
  },
};
</script>
<style>
    .modal {
        display: block; /* to disable the display toggling provided by bootstrap. */
    }

    .modal-zoom {
        transform: scale(0.1);
        opacity: 0;
        transition: all 0.3s;
    }

    .modal-zoom-show {
        transform: scale(1);
        opacity: 1;
        transition: all 0.3s;
    }
</style>
