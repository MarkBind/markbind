<template>
  <button @click="isExpanded=!isExpanded">
    {{ text }}
  </button>
  <div v-if="isExpanded">
    <slot></slot>>
  </div>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      default: "Click to expand!",
    },
  }
  data() {
    return {
      isExpanded: false,
    };
  }
};
</script>

<style></style>
