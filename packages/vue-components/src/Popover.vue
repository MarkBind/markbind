<template>
  <span
    :class="trigger === 'click' ? 'trigger-click' : 'trigger'"
    data-mb-component-type="popover"
    tabindex="0"
  >

    <div v-if="localError" class="popover-error-message">
      {{ localError }}
    </div>

    <portal v-if="targetEl.id && !localError" :to="'popover:' + targetEl.id">
      <h3 v-if="hasHeader" class="popover-header">
        <slot name="header"></slot>
      </h3>
      <div class="popover-body">
        <slot name="content"></slot>
      </div>
    </portal><!-- do not delete this comment, it is for the stray space issue (#2419)
 --><v-popover
      v-if="isMounted && !localError"
      :auto-hide="!isInput"
      :triggers="triggers"
      :popper-triggers="triggers"
      :hide-triggers="triggers"
      :placement="placement"
      :delay="0"
      shift-cross-axis
    >
      <!-- floating-vue triggers must be elements that receive mouse events, hence an empty @click -->
      <!-- However, input elements are handled separately as they will lose focus when wrapped in a span -->
      <slot v-if="isInput"></slot>
      <span v-else @click.stop>
        <slot></slot>
      </span>
      <template #popper>
        <div class="popover-container">
          <h3 v-if="hasHeader" class="popover-header">
            <slot name="header"></slot>
          </h3>
          <div class="popover-body">
            <slot name="content"></slot>
          </div>
        </div>
      </template>
    </v-popover>
  </span>
</template>

<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import { Portal } from 'portal-vue';

export default {
  name: 'Popover',
  components: {
    Portal,
  },
  props: {
    trigger: {
      type: String,
      default: 'hover focus',
    },
    placement: {
      type: String,
      default: 'top',
    },
    src: {
      type: String,
      default: '',
    },
    header: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      targetEl: {},
      isMounted: false,
      localError: '',
    };
  },
  computed: {
    triggers() {
      return this.trigger.split(' ');
    },
    hasHeader() {
      return !!this.$slots.header || this.header;
    },
    isInput() {
      return Boolean(this.$slots.default && this.$slots.default().some(vnode => vnode.type === 'input'));
    },
  },
  mounted() {
    this.targetEl = this.$el;
    this.isMounted = true;
    this.$nextTick(() => {
      this.captureAndLocalizeErrors();
    });
  },
  methods: {
    captureAndLocalizeErrors() {
      // Method 1: Check for common error patterns in the DOM
      this.findAndHandleGlobalErrors();

      // Method 2: Validate proactively
      this.validatePopover();
    },
    findAndHandleGlobalErrors() {
      // Look for error messages that might have been injected elsewhere
      const popoverErrors = Array.from(document.querySelectorAll('.popover-error'))
        .filter(el => el.textContent.includes('popover') || el.textContent.includes('src'));

      popoverErrors.forEach((errorEl) => {
        if (this.$el.contains(errorEl)) {
          // Error is already in the right place
          return;
        }

        // Check if this error belongs to our popover
        if (errorEl.textContent.includes(this.src)
            || errorEl.textContent.includes(this.header)) {
          this.localError = errorEl.textContent;
          errorEl.remove();
        }
      });
    },
    validatePopover() {
      if (!this.src && !this.$slots.content) {
        this.localError = 'Popover requires either a src attribute or content';
        return;
      }
      if (this.src && !this.isValidUrl(this.src)) {
        this.localError = 'Invalid popover source URL';
      }
    },
    isValidUrl(url) {
      try {
        void new URL(url);
        return true;
      } catch (_) {
        return false;
      }
    },
  },
};
</script>

<style>
    .popover-container {
        overflow: auto;
        max-height: 50vh;
        max-width: 276px;  /* following bootstrap */
    }

    .popover-body {
        font-size: 0.875rem;  /* following bootstrap */
    }

    .v-popper {
        display: inline;
    }

    .popover-error-message {
        color: #ff0000;
        font-size: 1.0rem;
        margin-top: 0.25rem;
    }
</style>
