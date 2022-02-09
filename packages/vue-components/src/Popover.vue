<template>
  <span
    :class="trigger === 'click' ? 'trigger-click' : 'trigger'"
    data-mb-component-type="popover"
    tabindex="0"
  >
    <portal v-if="targetEl.id" :to="targetEl.id">
      <template #title>
        <slot name="header"></slot>
      </template>
      <template #default>
        <div class="popover-content">
          <slot name="content"></slot>
        </div>
      </template>
    </portal>

    <b-popover
      :target="targetEl"
      :triggers="trigger"
      :placement="placement"
    >
      <template #title>
        <slot name="header"></slot>
      </template>
      <template #default>
        <div class="popover-content">
          <slot name="content"></slot>
        </div>
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
