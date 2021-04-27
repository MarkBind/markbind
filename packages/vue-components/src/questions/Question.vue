<template>
  <!-- TODO deprecate all isValidQuestionType checks -->
  <transition :name="questions ? 'question' : null">
    <div v-if="active" :class="['card', 'question', shakeClass, addClass]">
      <div v-if="$scopedSlots.header" class="card-header alert-light border-bottom border-light text-dark">
        <slot name="header"></slot>
      </div>
      <div class="card-body">
        <slot></slot>

        <!-- Text Question textarea and answer -->
        <div v-if="isTextQuestion()" class="mb-2">
          <textarea
            v-model="textareaText"
            class="form-control"
            :disabled="qState.answered"
          ></textarea>

          <div v-if="qState.answered">
            <hr />
            <strong v-if="keywordsSplitTrimmed().length">
              Keywords:&nbsp;
              <span
                v-for="keyword in keywordsSplitTrimmed()"
                :key="keyword"
                class="badge badge-pill badge-light font-weight-normal"
              >
                {{ keyword }}
              </span>
            </strong>
            <strong v-else>No answer checking keywords provided</strong>
          </div>
        </div>
        <!--
          Gracefully deprecate invalid question types:
          This allows the old "answer" slot to show for invalid question types, in addition to text questions
        -->
        <div v-if="qState.answered && !isMcqOrCheckboxQuestion()" class="answer">
          <slot name="answer"></slot>
        </div>

        <!-- Hint -->
        <box
          v-if="showHint"
          type="tip"
          class="mb-0 mt-3"
        >
          <slot name="hint"></slot>
        </box>
      </div>

      <!--
        Gracefully deprecate invalid question types (isValidQuestionType):
        This removes the footer for invalid question types,
        where both the hint and check button has been clicked
      -->
      <div
        v-if="showCardFooter"
        class="card-footer alert-light border-top border-light text-dark"
      >
        <!--
          Gracefully deprecate invalid question types (isValidQuestionType):
          This hides the success / wrong circle for invalid question types
        -->
        <i
          v-if="qState.state === 1 && isValidTypeAndNotTextWithoutKeywords()"
          class="fa fa-times text-danger border-danger result-icon"
        ></i>
        <i
          v-else-if="qState.state === 2 && isValidTypeAndNotTextWithoutKeywords()"
          class="fa fa-check text-success border-success result-icon"
        ></i>

        <transition-group
          name="q-btn"
          tag="div"
          class="float-right"
        >
          <button
            v-if="$scopedSlots.hint && !showHint"
            key="hint"
            type="button"
            class="btn btn-success q-btn ml-1"
            @click="showHint = true"
          >
            Hint
          </button>
          <!-- Gracefully deprecate invalid question types without answers -->
          <button
            v-if="qState.state === 0 && !(!isValidTypeAndNotTextWithoutKeywords() && !$scopedSlots.answer)"
            key="check"
            type="button"
            class="btn btn-primary q-btn ml-1"
            @click="checkAnswer(!!questions)"
          >
            Check
          </button>
          <button
            v-if="qState.state !== 0 && questions"
            key="active"
            type="button"
            class="btn btn-primary q-btn ml-1"
            @click="gotoNextQuestion"
          >
            Next
          </button>
          <button
            v-if="retryState"
            key="show"
            type="button"
            class="btn btn-info q-btn ml-1"
            @click="checkAnswer(true)"
          >
            Show
          </button>
          <button
            v-if="retryState"
            key="retry"
            type="button"
            class="btn btn-primary q-btn ml-1"
            @click="checkAnswer(false)"
          >
            Retry
          </button>
        </transition-group>
      </div>
    </div>
  </transition>
</template>

<script>
import { STATE_CORRECT, STATE_FRESH, STATE_WRONG } from './QuestionConstants';
import QuizQuestionMixin from './QuizQuestionMixin';

export default {
  name: 'Question',
  mixins: [QuizQuestionMixin],
  props: {
    type: {
      type: String,
      default: '',
    },
    addClass: {
      type: String,
      default: null,
    },

    // Text question specific props
    hasInput: { // Todo deprecate this
      type: Boolean,
      default: false,
    },
    keywords: {
      type: String,
      default: '',
    },
    threshold: { // The proportion of keywords needed to get the answer correct. Ranges from 0.0 to 1.0.
      type: [
        String, // to accomodate threshold prop being passed down as a string during SSR
        Number,
      ],
      default: 1.0,
    },
  },
  computed: {
    retryState() {
      // ie. answered wrongly but hasn't clicked 'show' yet, and is not part of a quiz
      return this.qState.state === STATE_WRONG && !this.qState.answered && !this.questions;
    },
    showCardFooter() {
      // Hide the card footer when 'there are no more buttons to click',
      // and the tick / cross circle is not shown
      const isInvalidTypeOrTextWithoutKeyword = !this.isValidTypeAndNotTextWithoutKeywords();
      const isHintNotProvidedOrIsShown = !this.$scopedSlots.hint || this.showHint;
      return !(isInvalidTypeOrTextWithoutKeyword
        && isHintNotProvidedOrIsShown
        && this.qState.answered
        && !this.questions);
    },
  },
  data() {
    const defaultData = {
      qState: {
        state: STATE_FRESH,
        answered: false,
      },
      showHint: false,
      shakeClass: null,
    };

    if (this.isMcqOrCheckboxQuestion()) {
      return {
        answers: [],
        ...defaultData,
      };
    }

    if (this.isTextQuestion()) {
      return {
        textareaText: '',
        ...defaultData,
      };
    }

    return defaultData;
  },
  provide() {
    if (this.isMcqOrCheckboxQuestion()) {
      return {
        answers: this.answers,
        qOptionType: this.type,
        qState: this.qState,
      };
    }
    return undefined;
  },
  methods: {
    keywordsSplitTrimmed() {
      return this.keywords.split(',').filter(keyword => keyword.trim() !== '');
    },
    isMcqOrCheckboxQuestion() {
      return this.type === 'mcq' || this.type === 'checkbox';
    },
    isTextQuestion() {
      return this.type === 'text' || this.hasInput;
    },
    isValidQuestionType() {
      return this.isMcqOrCheckboxQuestion() || this.isTextQuestion();
    },
    isValidTypeAndNotTextWithoutKeywords() {
      return this.isValidQuestionType() && !(this.isTextQuestion() && !this.keywords);
    },
    markAsCorrect() {
      this.qState.state = STATE_CORRECT;
      this.qState.answered = true;
    },
    markAsWrong(markAsAnswered) {
      this.qState.state = STATE_WRONG;
      if (markAsAnswered) {
        this.qState.answered = true;
      } else {
        // shake the card
        this.shakeClass = 'shake';
        setTimeout(() => {
          this.shakeClass = null;
        }, 800);
      }
    },
    checkMcqAnswer(markAsAnsweredIfWrong) {
      const selectedAnswer = this.answers.find(answer => answer.selected);
      if (!selectedAnswer) {
        return;
      }

      if (selectedAnswer.$props.correct) {
        this.markAsCorrect();
      } else {
        this.markAsWrong(markAsAnsweredIfWrong);
      }
    },
    checkCheckboxAnswer(markAsAnsweredIfWrong) {
      const correctAnswers = this.answers.filter(answer => answer.answeredCorrectly);

      if (correctAnswers.length === this.answers.length) {
        this.markAsCorrect();
      } else {
        this.markAsWrong(markAsAnsweredIfWrong);
      }
    },
    checkTextAnswer(markAsAnsweredIfWrong) {
      // Todo deprecate this guard clause
      if (!this.keywords.length) {
        this.markAsCorrect();
        return;
      }

      const lowerCasedText = this.textareaText.toLowerCase();
      const keywords = this.keywordsSplitTrimmed();

      let numMatching = 0;
      for (let i = 0; i < keywords.length; i += 1) {
        if (lowerCasedText.includes(keywords[i].toLowerCase())) {
          numMatching += 1;
        }
      }

      if (numMatching / keywords.length >= this.threshold) {
        this.markAsCorrect();
      } else {
        this.markAsWrong(markAsAnsweredIfWrong);
      }
    },
    checkAnswer(markAsAnsweredIfWrong) {
      if (this.type === 'mcq') {
        this.checkMcqAnswer(markAsAnsweredIfWrong);
      } else if (this.type === 'checkbox') {
        this.checkCheckboxAnswer(markAsAnsweredIfWrong);
      } else if (this.isTextQuestion()) {
        this.checkTextAnswer(markAsAnsweredIfWrong);
      } else {
        this.markAsCorrect();
      }
    },
  },
};
</script>

<style scoped>
    .result-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 2em;
        width: 2em;
        border-width: 2px;
        border-style: solid;
        border-radius: 2em;
    }

    .question {
        margin-bottom: 1rem;
        transition: transform 0.5s ease-out, opacity 0.5s linear;
        box-shadow: 0 2px 7px 5px rgba(210, 210, 210, 0.2);
    }

    .question-enter-active {
        opacity: 0;
        transform: translateX(-100%);
    }

    .question-leave-to {
        opacity: 0;
        transform: translateX(100%);
    }

    .q-btn {
        border-radius: 2.5em;
        transition: opacity 0.5s, transform 0.7s;
    }

    .q-btn-enter {
        opacity: 0;
        transform: translateY(30px);
    }

    .q-btn-leave-to {
        opacity: 0;
        transform: translateX(calc(-100% - 0.25rem));
    }

    .q-btn-leave-active {
        position: absolute;
    }

    .card-header {
        font-size: 1.05em;
        font-weight: 500;
    }

    /* For accomodating block markdown nicely */
    .card-header > :last-child,
    .answer > :last-child {
        margin-bottom: 0;
    }

    @keyframes shake {
        20% { transform: translate(-1px, -1px); }
        40% { transform: translate(1px, 1px); }
        60% { transform: translate(0, 0); }
        80% { transform: translate(-1px, 1px); }
        100% { transform: translate(1px, -1px); }
    }

    .shake {
        animation: shake 0.25s;
        animation-iteration-count: 2;
    }

    /* text question text area */
    textarea.form-control {
        height: auto;
        min-height: 75px;
        margin-bottom: 10px;
    }
</style>
