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
      :placement="placement"
      popper-class="v-popper__popper--skip-transition"
    >
      <template #popper>
        <slot name="content"></slot>
      </template>
      <span @click.stop>
        <slot></slot>
      </span>
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
