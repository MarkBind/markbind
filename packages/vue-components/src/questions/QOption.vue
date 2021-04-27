<template>
  <!-- Mcq (radio) option -->
  <div
    v-if="qOptionType === 'mcq'"
    :class="['form-control', hintClass]"
    @click="toggleRadioOn"
    @mouseover="hover = true"
    @mouseleave="hover = false"
  >
    <div :class="['row', { 'disabled': qState.answered }]">
      <svg viewBox="0 0 100 100" class="radio-svg">
        <circle
          cx="50"
          cy="50"
          r="47"
          fill="none"
          stroke="black"
          stroke-width="4"
        />
        <circle
          v-show="selected"
          cx="50"
          cy="50"
          r="25"
          fill="dodgerblue"
        />
      </svg>
      <div class="col content">
        <slot></slot>
      </div>
      <div class="col-1">
        <div v-if="qState.answered">
          <i
            v-if="correct"
            class="fa fa-check text-success"
            :class="{ 'align-bottom': $scopedSlots.reason }"
          ></i>
          <i
            v-else
            class="fa fa-times text-danger"
            :class="{ 'align-bottom': $scopedSlots.reason }"
          ></i>
        </div>
      </div>
    </div>

    <div v-if="qState.answered && $scopedSlots.reason">
      <hr />
      <div class="reason">
        <slot name="reason"></slot>
      </div>
    </div>
  </div>

  <!-- Checkbox option -->
  <div
    v-else-if="qOptionType === 'checkbox'"
    :class="['form-control', hintClass]"
    @click="toggleCheckbox"
    @mouseover="hover = true"
    @mouseleave="hover = false"
  >
    <label :class="['checkbox-label', { 'disabled': qState.answered }]" @click.stop>
      <input
        v-model="selected"
        class="checkbox"
        :disabled="qState.answered"
        type="checkbox"
        onclick="event.stopPropagation()"
      />
      <div class="col content">
        <slot></slot>
      </div>
      <div class="col-1">
        <div v-if="qState.answered">
          <i
            v-if="correct"
            class="fa fa-check text-success"
            :class="{ 'align-bottom': $scopedSlots.reason }"
          ></i>
          <i
            v-else
            class="fa fa-times text-danger"
            :class="{ 'align-bottom': $scopedSlots.reason }"
          ></i>
        </div>
      </div>
    </label>

    <div v-if="qState.answered && $scopedSlots.reason">
      <hr />
      <div class="reason">
        <slot name="reason"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'McqOption',
  props: {
    correct: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      selected: false,
      hover: false,
    };
  },
  inject: {
    answers: {
      default: undefined,
    },
    qOptionType: {
      default: undefined,
    },
    qState: {
      default: undefined,
    },
  },
  computed: {
    hintClass() {
      if (this.qState.answered) {
        return this.correct ? 'success' : 'danger';
      }

      return (this.selected || this.hover) ? 'alert-light text-dark border border-secondary' : '';
    },
    answeredCorrectly() {
      return (this.correct && this.selected) || (!this.correct && !this.selected);
    },
  },
  methods: {
    toggleRadioOn() {
      if (this.qState.answered || this.selected) {
        return;
      }

      this.answers.forEach((answer) => {
        answer.selected = false;
      });
      this.selected = true;
    },
    toggleCheckbox() {
      if (this.qState.answered) {
        return;
      }
      this.selected = !this.selected;
    },
  },
  created() {
    this.answers.push(this);
  },
};
</script>

<style scoped>
    .fa-check,
    .fa-times {
        font-size: 1.2em;
    }

    /* For accomodating block markdown nicely */
    .reason :last-child,
    .content :last-child {
        margin-bottom: 0;
    }

    .reason {
        padding: 0 0.5rem;
    }

    .checkbox-label {
        display: flex;
        align-items: center;
        cursor: pointer;
        margin-bottom: 0;
        vertical-align: text-bottom;
    }

    .form-control {
        height: auto;
        margin-bottom: 10px;
        cursor: pointer;
    }

    .form-control.success,
    .form-control.success > .checkbox-label,
    .form-control.danger,
    .form-control.danger > .checkbox-label {
        cursor: default;
    }

    .disabled {
        opacity: 0.9;
    }

    .radio-svg {
        width: 1em;
        height: 1em;
    }

    .checkbox {
        width: 1em;
        height: 1em;
        margin-right: 5px;
        vertical-align: middle;
    }

    .row {
        margin: 0.2rem 0 0 0;
        align-items: center;
    }
</style>
