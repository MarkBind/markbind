<template>
  <p>TEMP</p>
</template>

<script>

// var alertify = require('alertify.js');

export default {
  name: 'Toast',
  props: {
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: 'success',
    },
    position: {
      type: String,
      default: 'top-right',
    },
    duration: {
      type: Number,
      default: 5,
    },
    dismissable: {
      type: Boolean,
      default: true,
    },
    onDismiss: {
      type: Function,
      default: () => { },
    },
    onClick: {
      type: Function,
      default: () => { },
    },
  },
  data() {
    return {
      isActive: false,
      parentTop: null,
      parentBottom: null,
      isHovered: false,
    };
  },
  methods: {
    notify() {
      // const logDismiss = () => console.log('dismissed');
      // alertify.notify(this.message, this.type, this.duration, !!logDismiss ? logDismiss : this.onDismiss);
      console.log('THIS IS A NOTIFY TEST FOR TOAST');
    },
  },
  mounted() {
    console.log('THIS IS A MOUNT TEST FOR TOAST');
  },
};

// var notification = alertify.notify('sample', 'success', 5, function(){  console.log('dismissed'); });

</script>

<style>

</style>
