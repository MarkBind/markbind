<template>
  <vue-final-modal
    v-if="isMounted"
    v-model="show"
    ssr
    :name="id"
    classes="modal-container"
    :content-class="['modal-dialog', getOptionalModalSize, getOptionalCentering]"
    :click-to-close="backdrop !== 'false'"
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
        <button v-else class="btn btn-primary" @click="close()">
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
  }),
  props: {
    okText: {
      type: String,
      default: '',
    },
    id: {
      type: String,
      default: '',
    },
    center: {
      type: Boolean,
      default: false,
    },
    small: {
      type: Boolean,
      default: false,
    },
    large: {
      type: Boolean,
      default: false,
    },
    backdrop: {
      type: String,
      default: 'true',
    },
  },
  computed: {
    hasFooter() {
      return !!this.$slots.footer;
    },
    hasOk() {
      return this.okText !== '';
    },
    getOptionalModalSize() {
      if (!this.small && !this.large) {
        return '';
      }
      return this.small ? 'modal-sm' : 'modal-lg';
    },
    getOptionalCentering() {
      return this.center ? 'modal-dialog-centered' : 'modal-dialog-start';
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
</style>
