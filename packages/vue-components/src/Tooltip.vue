<template>
  <span
    :class="trigger === 'click' ? 'trigger-click' : 'trigger'"
    data-mb-component-type="tooltip"
    tabindex="0"
  >
    <portal v-if="targetEl.id" :to="targetEl.id">
      <slot name="content"></slot>
    </portal>

    <b-tooltip
      :target="targetEl"
      :triggers="trigger"
      :placement="placement"
    >
      <slot name="content"></slot>
    </b-tooltip>
    <slot></slot>
  </span>
</template>

<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import { Portal } from 'portal-vue';
import { BTooltip } from 'bootstrap-vue';

export default {
  name: 'Tooltip',
  components: {
    Portal,
    BTooltip,
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
    console.log(this.targetEl);
  },
};
</script>
