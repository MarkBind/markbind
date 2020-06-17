<template>
    <minimal-panel v-if="isMinimal" v-bind="$attrs">
        <template v-for="(node, name) in $slots" :slot="name">
            <slot :name="name"></slot>
        </template>
    </minimal-panel>
    <nested-panel v-else :type="type" v-bind="$attrs">
        <template v-for="(node, name) in $slots" :slot="name">
            <slot :name="name"></slot>
        </template>
    </nested-panel>
</template>

<script>
import nestedPanel from "./panels/NestedPanel.vue";
import minimalPanel from "./panels/MinimalPanel.vue";

export default {
  components: {
    nestedPanel,
    minimalPanel,
  },
  props: {
    type: {
      type: String,
      default: null,
    },
  },
  computed: {
    isMinimal() {
      return this.type === 'minimal';
    }
  }
}
</script>
