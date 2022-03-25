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
      :triggers="triggers"
      :hideTriggers="_ => triggers"
      :placement="placement"
      :delay="0"
      popper-class="v-popper__popper--skip-transition"
    >
      <template #popper>
        <slot name="content"></slot>
      </template>
      <slot></slot>
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
    this.isMounted = true;
  },
};
</script>

<style>
    .v-popper--theme-tooltip .v-popper__inner {
        /* following bootstrap */
        padding: 4px 8px;
        font-size: 14px;
        max-width: 200px;
        text-align: center;
    }
</style>
