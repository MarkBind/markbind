<template>
  <span
    :class="trigger === 'click' ? 'trigger-click' : 'trigger'"
    data-mb-component-type="tooltip"
    tabindex="0"
  >
    <portal v-if="targetEl.id" :to="'tooltip:' + targetEl.id">
      <slot name="content"></slot>
    </portal>

    <v-tooltip
      v-if="isMounted"
      :auto-hide="!isInput"
      :triggers="triggers"
      :popper-triggers="triggers"
      :hide-triggers="triggers"
      :placement="placement"
      :delay="0"
      shift-cross-axis
    >
      <template #popper>
        <slot name="content"></slot>
      </template>

      <span v-if="!isInput" @click.stop>
        <slot></slot>
      </span>
      <slot v-else></slot>
    </v-tooltip>
  </span>
</template>

<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import { Portal } from 'portal-vue';

export default {
  name: 'Tooltip',
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
      isInput: false,
      isMounted: false,
    };
  },
  computed: {
    triggers() {
      return this.trigger.split(' ');
    },
  },
  mounted() {
    this.targetEl = this.$el;
    // <input> tags need to be handled separately as they need to retain focus on inputs
    this.isInput = this.$slots.default.some(node => node.tag === 'input');
    this.isMounted = true;
  },
};
</script>

<style>
    .v-popper--theme-tooltip .v-popper__inner {
        /* following bootstrap */
        background: rgba(0, 0, 0, 0.9);
        padding: 4px 8px;
        font-size: 0.875rem;
        max-width: 200px;
        text-align: center;
    }
</style>
