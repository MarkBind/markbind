<template>
  <span
    class="popover-annotation"
    :x="x"
    :y="y"
    :text="text"
    :style="pointStyle"
  >
  asdasdasd
  </span>
</template>

<script>
import { toNumber } from './utils/utils';

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
  computed: {
    pointStyle() {
      return {
        left: `${toNumber(this.x)}px`,
        top: `${toNumber(this.y)}px`,
      };
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
    .popover-annotation {
      position: absolute;
      /* top: 50px;
      left: 100px; */
      width: 100%;
      height: 100%;
    }
</style>
