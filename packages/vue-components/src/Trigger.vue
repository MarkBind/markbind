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
      :delay="0"
      popper-class="v-popper__popper--skip-transition"
    >
      <span @click.stop>
        <slot></slot>
      </span>
      <template #popper>
        <div class="popover-container">
          <portal-target :name="'popover:' + target" />
        </div>
      </template>
    </v-popover>

    <v-tooltip
      v-else-if="popoverOrTooltipType === 'tooltip'"
      :placement="placement"
      :triggers="triggers"
      :delay="0"
      popper-class="v-popper__popper--skip-transition"
    >
      <span @click.stop>
        <slot></slot>
      </span>
      <template #popper>
        <portal-target :name="'tooltip:' + target" />
      </template>
    </v-tooltip>

  </span>
</template>

<script>
/* eslint-disable import/no-extraneous-dependencies */
import { PortalTarget } from 'portal-vue';
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
      default: 'top',
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
