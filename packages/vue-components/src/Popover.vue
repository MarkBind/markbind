<template>
  <span
    :class="trigger === 'click' ? 'trigger-click' : 'trigger'"
    data-mb-component-type="popover"
    tabindex="0"
  >
    <portal v-if="targetEl.id" :to="'popover:' + targetEl.id">
      <h3 v-if="hasHeader" class="popover-header">
        <slot name="header"></slot>
      </h3>
      <div class="popover-body">
        <slot name="content"></slot>
      </div>
    </portal>

    <v-popover
      v-if="isMounted"
      :auto-hide="!isInput"
      :triggers="triggers"
      :popper-triggers="triggers"
      :hide-triggers="triggers"
      :placement="placement"
      :delay="0"
      shift-cross-axis
    >
      <!-- floating-vue triggers must be elements that receive mouse events, hence an empty @click -->
      <span v-if="!isInput" @click.stop>
        <slot></slot>
      </span>
      <!-- However, input elements are handled separately as they will lose focus when wrapped in a span -->
      <slot v-else></slot>
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
  },
  data() {
    return {
      targetEl: {},
      isMounted: false,
    };
  },
  computed: {
    triggers() {
      return this.trigger.split(' ');
    },
    hasHeader() {
      return !!this.$slots.header;
    },
  },
  mounted() {
    this.targetEl = this.$el;
    // <input> tags need to be handled separately as they need to retain focus on inputs
    this.isInput = this.$slots.default && this.$slots.default.some(node => node.tag === 'input');
    this.isMounted = true;
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
</style>
