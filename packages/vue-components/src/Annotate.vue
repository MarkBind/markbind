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
      default: '',
    },
    y: {
      type: String,
      default: '',
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
    .image-container {
        text-align: center;
        position: relative;
    }

    .image-overlay {
        left: 0;
        top: 0;
        position: absolute;
    }
</style>
