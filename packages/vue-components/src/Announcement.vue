<!-- Announcement.vue -->
<template>
  <div
    v-if="!dismissed"
    ref="announcement"
    :class="['announcement', 'text-center', themeClass]"
    :style="positionStyle"
  >
    <div class="announcement-content">
      <slot></slot>
    </div>
    <button
      v-if="dismissible"
      type="button"
      class="btn-close"
      aria-label="Close"
      @click="dismiss"
    ></button>
  </div>
</template>

<script>
export default {
  props: {
    dismissible: {
      type: Boolean,
      default: false,
    },
    theme: {
      type: String,
      default: 'warning',
      validator: value => [
        'primary', 'secondary', 'success', 'warning',
        'danger', 'info', 'light', 'dark',
      ].includes(value),
    },
    placement: {
      type: String,
      default: 'top',
      validator: value => [
        'top', 'top-right', 'top-left', 'bottom',
        'bottom-right', 'bottom-left',
      ].includes(value),
    },
  },
  data() {
    return {
      dismissed: false,
      positionStyle: {},
    };
  },
  computed: {
    themeClass() {
      return `bg-${this.theme}`;
    },
  },
  mounted() {
    this.setPosition();
    window.addEventListener('resize', this.setPosition);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.setPosition);
  },
  methods: {
    dismiss() {
      this.dismissed = true;
    },
    setPosition() {
      const announcementElement = this.$refs.announcement;
      if (!announcementElement) return;

      const { width, height } = announcementElement.getBoundingClientRect();

      switch (this.placement) {
      case 'top':
        this.positionStyle = {
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
        };
        break;
      case 'top-right':
        this.positionStyle = {
          top: '20px',
          right: '20px',
          width: `${width}px`,
          height: `${height}px`,
        };
        break;
      case 'top-left':
        this.positionStyle = {
          top: '20px',
          left: '20px',
          width: `${width}px`,
          height: `${height}px`,
        };
        break;
      case 'bottom':
        this.positionStyle = {
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
        };
        break;
      case 'bottom-right':
        this.positionStyle = {
          bottom: '20px',
          right: '20px',
          width: `${width}px`,
          height: `${height}px`,
        };
        break;
      case 'bottom-left':
        this.positionStyle = {
          bottom: '20px',
          left: '20px',
          width: `${width}px`,
          height: `${height}px`,
        };
        break;
      default:
        break;
      }
    },
  },
};
</script>

<style scoped>
    .announcement {
        position: fixed;
        padding: 1rem;
        color: #fff;
        z-index: 9999;
    }

    .announcement-content {
        margin-right: 2rem;
    }

    .btn-close {
        position: absolute;
        top: 50%;
        right: 1rem;
        transform: translateY(-50%);
    }
</style>
