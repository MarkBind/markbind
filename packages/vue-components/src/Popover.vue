<template>
  <span
    :class="trigger === 'click' ? 'trigger-click' : 'trigger'"
    data-mb-component-type="popover"
    tabindex="0"
  >
    <span data-mb-slot-name="header">
      <slot name="header"></slot>
    </span>
    <span data-mb-slot-name="content">
      <slot name="content"></slot>
    </span>

    <b-popover
      :target="targetEl"
      :triggers="trigger"
      :placement="placement"
    >
      <template #title>
        <slot name="header"></slot>
      </template>
      <slot name="content"></slot>
    </b-popover>
    <slot></slot>
  </span>
</template>

<script>
export default {
  name: 'Popover',
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
