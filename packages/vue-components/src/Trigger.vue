<template>
  <span
    :class="trigger === 'click' ? 'trigger-click' : 'trigger'"
    tabindex="0"
    @[triggerEventType].stop="toggle()"
  >

    <v-popover
      v-if="popoverOrTooltipType === 'popover'"
      :triggers="triggers"
      :placement="placement"
    >
      <span @click>
        <slot />
      </span>
      <template #popper>
        <div class="popover-container">
          <div v-if="hasHeader">
            <portal-target :name="'header:' + target" />
          </div>
          <portal-target :name="'content:' + target" />
        </div>
      </template>
    </v-popover>

    <b-tooltip
      v-else-if="popoverOrTooltipType === 'tooltip'"
      :target="$el"
      :placement="placement"
      :triggers="trigger"
    >
      <portal-target :name="target" />
    </b-tooltip>

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
      default: 'hover focus',
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
    triggers() {
      return this.trigger.split(' ');
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
