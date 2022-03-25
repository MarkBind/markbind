<template>
  <span
    :class="trigger === 'click' ? 'trigger-click' : 'trigger'"
    data-mb-component-type="popover"
    tabindex="0"
  >
    <portal v-if="targetEl.id" :to="'popover:' + targetEl.id">
      <div v-if="hasHeader" class="popover-header">
        <slot name="header"></slot>
      </div>
      <div class="popover-body">
        <slot name="content"></slot>
      </div>
    </portal>

    <v-popover
      v-if="isMounted"
      :triggers="triggers"
      :placement="placement"
      :delay="0"
      popper-class="v-popper__popper--skip-transition"
    >
      <!-- floating-vue triggers must be elements that receive mouse events, hence an empty @click -->
      <!-- https://github.com/Akryum/floating-vue/issues/461 -->
      <span @click.stop>
        <slot></slot>
      </span>
      <template #popper>
        <div class="popover-container">
          <div v-if="hasHeader" class="popover-header">
            <slot name="header"></slot>
          </div>
          <div class="popover-body">
            <slot name="content"></slot>
          </div>
        </div>
      </template>
    </v-popover>
  </span>
</template>

<script>
/* eslint-disable import/no-extraneous-dependencies */
import { Portal } from 'portal-vue';
/* eslint-enable import/no-extraneous-dependencies */

export default {
  name: 'Popover',
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
    hasHeader() {
      return !!this.$slots.header;
    },
  },
  mounted() {
    this.targetEl = this.$el;
    this.isMounted = true;
  },
};
</script>

<style>
    .popover-container {
        overflow: auto;
        max-height: 50vh;
        max-width: 276px;  /* following bootstrap */
    }

    .v-popper {
        display: inline;
    }
</style>
