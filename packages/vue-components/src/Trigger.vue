<template>
  <modals-container>
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
  </modals-container>
</template>

<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import { PortalTarget, Wormhole } from 'portal-vue';
import { $vfm, ModalsContainer } from 'vue-final-modal'

export default {
  name: 'Trigger',
  components: {
    PortalTarget,
    ModalsContainer,
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

      /* $vfm.show(this.for, { userName: 'vue-final-modal' }) */

      // show modal, if any
      const modal = this.$root.$refs[this.for];
      if (modal) {
        modal.show();
      }
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
