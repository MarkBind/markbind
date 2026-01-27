<template>
  <minimal-panel
    v-if="isMinimal"
    :panel-id="panelId"
    v-bind="$attrs"
  >
    <template v-for="(node, name) in $slots" #[name]>
      <slot :name="name"></slot>
    </template>
  </minimal-panel>
  <nested-panel
    v-else
    :panel-id="panelId"
    :type="type"
    v-bind="$attrs"
  >
    <template v-for="(node, name) in $slots" #[name]>
      <slot :name="name"></slot>
    </template>
  </nested-panel>
</template>

<script lang="ts">
import nestedPanel from './panels/NestedPanel.vue';
import minimalPanel from './panels/MinimalPanel.vue';

export default {
  components: {
    nestedPanel,
    minimalPanel,
  },
  props: {
    panelId: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      default: null,
    },
  },
  computed: {
    isMinimal() {
      return this.type === 'minimal';
    },
  },
};
</script>
