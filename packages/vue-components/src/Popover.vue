<template>
  <span
    :class="trigger === 'click' ? 'trigger-click' : 'trigger'"
    data-mb-component-type="popover"
    tabindex="0"
  >
    <portal v-if="targetEl.id" :to="'header:' + targetEl.id">
      <slot name="header"></slot>
    </portal>
    <portal v-if="targetEl.id" :to="'content:' + targetEl.id">
      <div class="popover-content">
        <slot name="content"></slot>
      </div>
    </portal>

    <b-popover
      v-if="isMounted"
      :target="targetEl"
      :triggers="trigger"
      :placement="placement"
    >
      <template #title>
        <slot name="header"></slot>
      </template>
      <div class="popover-content">
        <slot name="content"></slot>
      </div>
    </b-popover>
    <slot></slot>
  </span>
</template>

<script>
/* eslint-disable import/no-extraneous-dependencies */
import { Portal } from 'portal-vue';
import { BPopover } from 'bootstrap-vue';
/* eslint-enable import/no-extraneous-dependencies */

export default {
  name: 'Popover',
  components: {
    Portal,
    BPopover,
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

<style scoped>
.popover-content {
    overflow: auto;
    max-height: 50vh;
}
</style>
