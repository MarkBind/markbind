<template>
  <span
    :class="trigger === 'click' ? 'trigger-click' : 'trigger'"
    tabindex="0"
    @[triggerEventType].stop="toggle()"
  >

    <b-popover
      v-if="popoverOrTooltipType === 'popover'"
      :show="show"
      :target="this.$el"
      triggers="manual"
      :placement="placement"
    >
      <div v-html="contentHtml"></div>
      <template v-if="titleHtml" #title>
        <div v-html="titleHtml"></div>
      </template>
    </b-popover>
    <b-tooltip
      v-else-if="popoverOrTooltipType === 'tooltip'"
      :show="show"
      :target="this.$el"
      triggers="manual"
      :placement="placement"
    >
      <div v-html="contentHtml"></div>
    </b-tooltip>

    <slot></slot>
  </span>
</template>

<script>
export default {
  name: 'Trigger',
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
      contentHtml: '',
      titleHtml: '',
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
        this.setupComponent(targetEl);
      } else {
        this.show = !this.show;
      }
    },
    setupComponent(targetEl) {
      const componentType = targetEl.dataset.mbComponentType;
      /*
       * popoverInnerGetters / tooltipInnerContentGetter are passed down during the Vue App instantiation on
       * client-side (core-web). Thus, we have to access these methods via "this.$root".
       */
      if (componentType === 'popover') {
        this.contentHtml = this.$root.popoverInnerGetters.content(targetEl);
        this.titleHtml = this.$root.popoverInnerGetters.title(targetEl);
      } else if (componentType === 'tooltip') {
        this.contentHtml = this.$root.tooltipInnerContentGetter(targetEl);
      }
      this.popoverOrTooltipType = componentType;
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
