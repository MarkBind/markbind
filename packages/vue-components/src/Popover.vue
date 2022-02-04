<template>
  <span
    :class="trigger === 'click' ? 'trigger-click' : 'trigger'"
    data-mb-component-type="popover"
    tabindex="0"
  >
    <portal v-if="targetEl.id" :to="targetEl.id">
    this is from portal
      <template #title>
        <slot name="header"></slot>
      </template>
      <template #default>
        in default portal slot
        <slot name="content"></slot>
      </template>
    </portal>

    <b-popover
      :target="targetEl"
      :triggers="trigger"
      :placement="placement"
    >
      this is from popover
      <template #title>
        <slot name="header"></slot>
      </template>
      <template #default>
        in default popover slot
        <slot name="content"></slot>
      </template>
    </b-popover>
    <slot></slot>
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
