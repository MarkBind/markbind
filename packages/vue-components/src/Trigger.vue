<template>
  <span
    :class="trigger === 'click' ? 'trigger-click' : 'trigger'"
    tabindex="0"
    @[triggerEventType].stop="toggle()"
  >

    <b-popover
      v-if="popoverOrTooltipType === 'popover'"
      :target="$el"
      :triggers="trigger === 'click' ? 'click blur' : trigger"
      :placement="placement"
    >
      <template v-if="hasHeader" #title>
        <portal-target :name="'header:' + target" />
      </template>
      <portal-target :name="'content:' + target" />
    </b-popover>

    <b-tooltip
      v-else-if="popoverOrTooltipType === 'tooltip'"
      :target="$el"
      :placement="placement"
      :triggers="trigger"
    >
      <portal-target :name="target" />
    </b-tooltip>

    <slot></slot>
  </span>
</template>

<script>
/* eslint-disable import/no-extraneous-dependencies */
import { PortalTarget, Wormhole } from 'portal-vue';
import { $vfm } from 'vue-final-modal';
/* eslint-enable import/no-extraneous-dependencies */

export default {
  name: 'Trigger',
  components: {
    PortalTarget,
  },
  props: {
    for: {
      type: String,
      default: '',
    },
    trigger: {
      type: String,
      default: 'hover',
    },
    placement: {
      type: String,
      default: 'auto',
    },
  },
  data() {
    return {
      popoverOrTooltipType: undefined,
    };
  },
  methods: {
    toggle() {
      if (!this.for) {
        return;
      }

      // show modal, if any
      $vfm.show(this.for);
    },
  },
  computed: {
    triggerEventType() {
      if (this.trigger === 'click' || this.trigger === 'focus') {
        return this.trigger;
      }
      return 'mouseenter';
    },
    target() {
      return this.for;
    },
    hasHeader() {
      return Wormhole.hasContentFor(`header:${this.target}`);
    },
  },
  mounted() {
    if (!this.for) {
      return;
    }

    if (this.popoverOrTooltipType === undefined) {
      const targetEl = document.getElementById(this.for);
      if (!targetEl) {
        return;
      }

      this.popoverOrTooltipType = targetEl.dataset.mbComponentType;
    }
  },
};
</script>
