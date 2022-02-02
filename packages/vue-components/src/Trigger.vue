<template>
  <span
    :class="trigger === 'click' ? 'trigger-click' : 'trigger'"
    tabindex="0"
    @[triggerEventType].stop="toggle()"
  >

    <b-popover
      v-if="popoverOrTooltipType === 'popover'"
      :show="show"
      :target="$el"
      triggers="manual"
      :placement="placement"
    >
      <portal-target :name="this.for" />
    </b-popover>
    <b-tooltip
      v-else-if="popoverOrTooltipType === 'tooltip'"
      :show="show"
      :target="$el"
      triggers="manual"
      :placement="placement"
    >
      <portal-target :name="this.for" />
    </b-tooltip>

    <slot></slot>
  </span>
</template>

<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import { PortalTarget } from 'portal-vue';

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
      show: false,
      popoverOrTooltipType: undefined,
    };
  },
  methods: {
    toggle() {
      if (!this.for) {
        return;
      }

      // show modal, if any
      const modal = this.$root.$refs[this.for];
      if (modal) {
        modal.show();
        return;
      }

      if (this.popoverOrTooltipType === undefined) {
        const targetEl = document.getElementById(this.for);
        if (!targetEl) {
          return;
        }

        this.show = true;
        this.popoverOrTooltipType = targetEl.dataset.mbComponentType;
      } else {
        this.show = !this.show;
      }
    },
  },
  computed: {
    triggerEventType() {
      if (this.trigger === 'click') {
        return this.show ? 'blur' : 'click';
      } else if (this.trigger === 'focus') {
        return this.show ? 'blur' : 'focus';
      }
      return this.show ? 'mouseleave' : 'mouseenter';
    },
  },
};
</script>
