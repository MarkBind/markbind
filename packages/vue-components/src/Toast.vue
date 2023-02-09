<template>
  <button type="button" @click="toast_notify()">
    Toast
  </button>
</template>

<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import { notify } from 'alertifyjs';

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
    toast_notify() {
      notify(this.message, this.type, this.duration, this.onDismiss);
    },
  },
  mounted() {
  },
};

</script>

<style>

    .alertify-notifier {
        position: fixed;
        width: 0;
        overflow: visible;
        z-index: 1982;
        -webkit-transform: translate3d(0, 0, 0);
        transform: translate3d(0, 0, 0);
    }

    .alertify-notifier .ajs-message {
        position: relative;
        width: 260px;
        max-height: 0;
        padding: 0;
        opacity: 0;
        margin: 0;
        -webkit-transform: translate3d(0, 0, 0);
        transform: translate3d(0, 0, 0);
        -webkit-transition-duration: 250ms;
        transition-duration: 250ms;
        -webkit-transition-timing-function: linear;
        transition-timing-function: linear;
        background: rgba(255, 255, 255, 0.95);
        color: #000;
        text-align: center;
        border: solid 1px #ddd;
        border-radius: 2px;
    }

    .alertify-notifier .ajs-message.ajs-visible {
        -webkit-transition-duration: 500ms;
        transition-duration: 500ms;
        -webkit-transition-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
        transition-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
        opacity: 1;
        max-height: 100%;
        padding: 15px;
        margin-top: 10px;
    }

    .alertify-notifier .ajs-message.ajs-success {
        background: rgba(91, 189, 114, 0.95);
        color: #fff;
        text-shadow: -1px -1px 0 rgba(0, 0, 0, 0.5);
    }

    .alertify-notifier .ajs-message.ajs-error {
        background: rgba(217, 92, 92, 0.95);
        color: #fff;
        text-shadow: -1px -1px 0 rgba(0, 0, 0, 0.5);
    }

    .alertify-notifier .ajs-message.ajs-warning {
        background: rgba(252, 248, 215, 0.95);
        border-color: #999;
    }

    .alertify-notifier .ajs-message .ajs-close {
        position: absolute;
        top: 0;
        right: 0;
        width: 16px;
        height: 16px;
        cursor: pointer;
        background-repeat: no-repeat;
        background-position: center center;
        background-color: rgba(0, 0, 0, 0.5);
        border-top-right-radius: 2px;
    }

    .alertify-notifier.ajs-top {
        top: 10px;
    }

    .alertify-notifier.ajs-bottom {
        bottom: 10px;
    }

    .alertify-notifier.ajs-right {
        right: 10px;
    }

    .alertify-notifier.ajs-right .ajs-message {
        right: -320px;
    }

    .alertify-notifier.ajs-right .ajs-message.ajs-visible {
        right: 290px;
    }

    .alertify-notifier.ajs-left {
        left: 10px;
    }

    .alertify-notifier.ajs-left .ajs-message {
        left: -300px;
    }

    .alertify-notifier.ajs-left .ajs-message.ajs-visible {
        left: 0;
    }

    .alertify-notifier.ajs-center {
        left: 50%;
    }

    .alertify-notifier.ajs-center .ajs-message {
        -webkit-transform: translateX(-50%);
        transform: translateX(-50%);
    }

    .alertify-notifier.ajs-center .ajs-message.ajs-visible {
        left: 50%;
        -webkit-transition-timing-function: cubic-bezier(0.57, 0.43, 0.1, 0.65);
        transition-timing-function: cubic-bezier(0.57, 0.43, 0.1, 0.65);
    }

    .alertify-notifier.ajs-center.ajs-top .ajs-message {
        top: -300px;
    }

    .alertify-notifier.ajs-center.ajs-top .ajs-message.ajs-visible {
        top: 0;
    }

    .alertify-notifier.ajs-center.ajs-bottom .ajs-message {
        bottom: -300px;
    }

    .alertify-notifier.ajs-center.ajs-bottom .ajs-message.ajs-visible {
        bottom: 0;
    }

    @media (prefers-reduced-motion: reduce) {
        .alertify .ajs-dimmer,
        .alertify .ajs-modal,
        .alertify .ajs-dialog {
            -webkit-transition: none !important;
            transition: none !important;
            -webkit-animation: none !important;
            animation: none !important;
        }

        .alertify-notifier .ajs-message {
            -webkit-transition: none !important;
            transition: none !important;
            -webkit-animation: none !important;
            animation: none !important;
        }
    }

    /**
 * alertifyjs 1.13.1 http://alertifyjs.com
 * AlertifyJS is a javascript framework for developing pretty browser dialogs and notifications.
 * Copyright 2019 Mohammad Younes <Mohammad@alertifyjs.com> (http://alertifyjs.com)
 * Licensed under GPL 3 <https://opensource.org/licenses/gpl-3.0> */
    .alertify .ajs-dialog {
        background-color: white;
        -webkit-box-shadow: 0 15px 20px 0 rgba(0, 0, 0, 0.25);
        box-shadow: 0 15px 20px 0 rgba(0, 0, 0, 0.25);
        border-radius: 2px;
    }

    .alertify .ajs-header {
        color: black;
        font-weight: bold;
        background: #fafafa;
        border-bottom: #eee 1px solid;
        border-radius: 2px 2px 0 0;
    }

    .alertify .ajs-body {
        color: black;
    }

    .alertify .ajs-body .ajs-content .ajs-input {
        display: block;
        width: 100%;
        padding: 8px;
        margin: 4px;
        border-radius: 2px;
        border: 1px solid #ccc;
    }

    .alertify .ajs-body .ajs-content p {
        margin: 0;
    }

    .alertify .ajs-footer {
        background: #fbfbfb;
        border-top: #eee 1px solid;
        border-radius: 0 0 2px 2px;
    }

    .alertify .ajs-footer .ajs-buttons .ajs-button {
        background-color: transparent;
        color: #000;
        border: 0;
        font-size: 14px;
        font-weight: bold;
        text-transform: uppercase;
    }

    .alertify .ajs-footer .ajs-buttons .ajs-button.ajs-ok {
        color: #3593d2;
    }

</style>
