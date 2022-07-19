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
      <div class="col-auto p-0">
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
      </div>
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
    <label :class="['row', 'checkbox-label', 'm-0', { 'disabled': qState.answered }]" @click.stop>
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
      <div class="col-auto">
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

  <!-- blanks option -->
  <div
    v-else-if="qOptionType === 'blanks'"
    :class="['form-control', 'blanks-form-control', hintClass]"
  >
    <label :class="['row', 'm-0', { 'disabled': qState.answered }]" @click.stop>
      <input
        v-model="inputText"
        class="form-control"
        :disabled="qState.answered"
      />
      <div class="col-auto">
        <!-- for when question is answered -->
        <div v-if="qState.answered">
          <i
            v-if="ansIsCorrect"
            class="fa fa-check text-success"
          ></i>
          <i
            v-else
            class="fa fa-times text-danger blanks-cross"
          ></i>
        </div>

        <!-- for when question is not answered and intermediate result is enabled -->
        <div v-if="isIntermediateResult()">
          <i
            v-if="ansIsCorrect"
            class="fa fa-check text-success"
          ></i>
          <i
            v-else
            class="fa fa-times text-danger blanks-cross"
          ></i>
        </div>
      </div>
      <div v-if="qState.answered" class="col-auto blanks-keywords">
        <strong v-if="keywordsSplitTrimmed().length">
          Keywords:&nbsp;
          <span
            v-for="keyword in keywordsSplitTrimmed()"
            :key="keyword"
            class="badge rounded-pill bg-light text-dark fw-normal"
          >
            {{ keyword }}
          </span>
        </strong>
        <strong v-else>No answer checking keywords provided</strong>
      </div>
    </label>

    <div v-if="qState.answered && $scopedSlots.reason">
      <div class="reason blanks-reason">
        <slot name="reason"></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { STATE_WRONG } from './QuestionConstants';

export default {
  name: 'McqOption',
  props: {
    correct: {
      type: Boolean,
      default: false,
    },
    keywords: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      selected: false,
      hover: false,
      inputText: '',
      ansIsCorrect: false,
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
    noIntermediateResult: {
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
    checkAnswer() {
      let ansIsCorrect = false;
      const lowerCasedText = this.inputText.toLowerCase().trim();
      const keywords = this.keywords.toLowerCase().split(',').filter(keyword => keyword.trim() !== '');
      if (!this.keywords.length) {
        ansIsCorrect = true;
      }
      for (let i = 0; i < keywords.length; i += 1) {
        if (lowerCasedText === keywords[i].trim()) {
          ansIsCorrect = true;
          break;
        }
      }
      this.ansIsCorrect = ansIsCorrect;
    },
    isIntermediateResult() {
      return !this.noIntermediateResult && this.qState.state === STATE_WRONG && !this.qState.answered;
    },
    isBlanksQuestion() {
      return this.type === 'blanks';
    },
    keywordsSplitTrimmed() {
      return this.keywords.split(',').filter(keyword => keyword.trim() !== '');
    },
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
        cursor: pointer;
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
        vertical-align: text-top;
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

    /* for blanks question type */
    input.form-control {
        height: auto;
        min-height: 20px;
        margin-bottom: 0;
        width: 50%;
        cursor: text;
    }

    input.form-control:disabled,
    .blanks-keywords {
        margin-bottom: 0.5rem;
    }

    .blanks-form-control {
        border: none;
        cursor: default;
    }

    .blanks-cross {
        margin-right: 3px;
        margin-left: 3px;
    }
</style>
