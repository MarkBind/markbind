<template>
  <span
    :class="trigger === 'click' ? 'trigger-click' : 'trigger'"
    data-mb-component-type="tooltip"
    tabindex="0"
  >
    <portal v-if="targetEl.id" :to="targetEl.id">
      <template #default>
        <slot name="content"></slot>
      </template>
    </portal>

    <b-tooltip
      :target="targetEl"
      :triggers="trigger"
      :placement="placement"
    >
      <template #default>
        <slot name="content"></slot>
      </template>
    </b-tooltip>
    <slot></slot>
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
      default: 'hover',
    },
    placement: {
      type: String,
      default: 'top',
    },
  },
  data() {
    return {
      targetEl: {},
    };
  },
  mounted() {
    this.targetEl = this.$el;
  },
};
</script>
