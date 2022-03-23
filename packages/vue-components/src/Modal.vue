<template>
  <vue-final-modal
    v-if="isMounted"
    v-model="show"
    ssr
    :name="id"
    classes="allow-overflow"
    :content-class="['modal-dialog', optionalModalSize, optionalCentering]"
    overlay-transition="none"
    :transition="effectClass"
    :click-to-close="backdrop !== 'false'"
    esc-to-close
  >
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">
          <slot name="header"></slot>
        </h5>
        <button
          type="button"
          class="close"
          aria-label="Close"
          @click="close()"
        >
          <span aria-hidden="true">&times;</span>
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

<script>
export default {
  name: 'Modal',
  data: () => ({
    show: false,
    isMounted: false,
    zoomEffect: {
      'enter-class': 'modal-zoom',
      'enter-to-class': 'modal-zoom-show',
      'leave-to-class': 'modal-zoom',
      'leave-class': 'modal-zoom-show',
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
      return this.center ? 'modal-dialog-centered' : 'modal-dialog-start';
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
<style scoped>
    >>> .modal-dialog-start {
        margin-top: 100px;
    }

    >>> .allow-overflow {
        overflow: auto;
    }

    >>> .modal-zoom {
        -webkit-transform: scale(0.1);
        -moz-transform: scale(0.1);
        -ms-transform: scale(0.1);
        transform: scale(0.1);
        opacity: 0;
        -webkit-transition: all 0.3s;
        -moz-transition: all 0.3s;
        transition: all 0.3s;
    }

    >>> .modal-zoom-show {
        -webkit-transform: scale(1);
        -moz-transform: scale(1);
        -ms-transform: scale(1);
        transform: scale(1);
        opacity: 1;
        -webkit-transition: all 0.3s;
        -moz-transition: all 0.3s;
        transition: all 0.3s;
    }
</style>
