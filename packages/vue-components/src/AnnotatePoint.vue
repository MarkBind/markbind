<template>
  <span
    id="annotateData"
    :x="x"
    :y="y"
    :text="text"
  >
  </span>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      default: '',
    },
    x: {
      type: String,
      default: '0',
    },
    y: {
      type: String,
      default: '0',
    },
  },
  data() {
    return {
    };
  },
  methods: {
    sendDataToCanvas() {
      this.$emit('data', { x: this.x, y: this.y, text: this.text });
    },
  },
  mounted() {
    this.sendDataToCanvas();
  },
};
</script>

<style>
</style>
