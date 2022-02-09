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
      v-if="isMounted"
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
/* eslint-disable import/no-extraneous-dependencies */
import { Portal } from 'portal-vue';
import { BTooltip } from 'bootstrap-vue';
/* eslint-enable import/no-extraneous-dependencies */

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
      isMounted: false,
    };
  },
  mounted() {
    this.targetEl = this.$el;
    this.isMounted = true;
  },
};
</script>
