<template>
  <transition :name="questions ? 'question' : null" @after-leave="showNextQuestion">
    <div v-if="active" :class="['card', 'question', shakeClass, addClass]">
      <div v-if="$slots.header" class="card-header alert-light border-bottom border-light text-dark">
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
                class="badge rounded-pill bg-light text-dark fw-normal"
              >
                {{ keyword }}
              </span>
            </strong>
          </div>
        </div>
        <div v-if="qState.answered && isTextQuestion()" class="answer">
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

      <!-- This removes the footer for questions where both the hint and check button has been clicked -->
      <div
        v-if="showCardFooter"
        class="card-footer alert-light border-top border-light text-dark"
      >
        <i
          v-if="qState.state === 1"
          class="fa fa-times text-danger border-danger result-icon"
        ></i>
        <i
          v-else-if="qState.state === 2"
          class="fa fa-check text-success border-success result-icon"
        ></i>
        <transition-group
          name="q-btn"
          tag="div"
          class="float-end"
        >
          <button
            v-if="$slots.hint && !showHint"
            key="hint"
            type="button"
            class="btn btn-success q-btn ms-1"
            @click="showHint = true"
          >
            Hint
          </button>
          <button
            v-if="qState.state === 0 && !(isTextWithoutKeywords() && !$slots.answer)"
            key="check"
            type="button"
            class="btn btn-primary q-btn ms-1"
            @click="checkAnswer(!!questions)"
          >
            Check
          </button>
          <button
            v-show="qState.state !== 0 && questions"
            key="active"
            type="button"
            class="btn btn-primary q-btn ms-1"
            @click.once="gotoNextQuestion"
          >
            Next
          </button>
          <button
            v-show="retryState"
            key="show"
            type="button"
            class="btn btn-info q-btn ms-1"
            @click="checkAnswer(true)"
          >
            Show
          </button>
          <button
            v-show="retryState"
            key="retry"
            type="button"
            class="btn btn-primary q-btn ms-1"
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
import box from '../Box.vue';
import QuizQuestionMixin from './QuizQuestionMixin';

export default {
  name: 'Question',
  mixins: [QuizQuestionMixin],
  components: {
    box,
  },
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

    // Blanks question specific prop
    noIntermediateResult: {
      type: Boolean, // Defaults to showing intermediate results for blanks
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
      const isHintNotProvidedOrIsShown = !this.$slots.hint || this.showHint;
      return !(this.isTextWithoutKeywords()
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

    if (this.isMcqOrCheckboxQuestion() || this.isBlanksQuestion()) {
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
    if (this.isBlanksQuestion()) {
      return {
        answers: this.answers,
        qOptionType: this.type,
        qState: this.qState,
        noIntermediateResult: this.noIntermediateResult,
      };
    }
    return {};
  },
  methods: {
    keywordsSplitTrimmed() {
      return this.keywords.split(',').filter(keyword => keyword.trim() !== '');
    },
    isMcqOrCheckboxQuestion() {
      return this.type === 'mcq' || this.type === 'checkbox';
    },
    isBlanksQuestion() {
      return this.type === 'blanks';
    },
    isTextQuestion() {
      return this.type === 'text';
    },
    isTextWithoutKeywords() {
      return this.isTextQuestion() && !this.keywords;
    },
    shakeCard() {
      this.shakeClass = 'shake';
      setTimeout(() => {
        this.shakeClass = null;
      }, 800);
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
        this.shakeCard();
      }
    },
    checkMcqAnswer(markAsAnsweredIfWrong) {
      const selectedAnswer = this.answers.find(answer => answer.selected);
      if (!selectedAnswer) {
        this.shakeCard();
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
    checkBlanksAnswer(markAsAnsweredIfWrong) {
      let numMatching = 0;
      for (let i = 0; i < this.answers.length; i += 1) {
        this.answers[i].checkAnswer();
        if (this.answers[i].ansIsCorrect) {
          numMatching += 1;
        }
      }

      if (numMatching / this.answers.length >= this.threshold) {
        this.markAsCorrect();
      } else {
        this.markAsWrong(markAsAnsweredIfWrong);
      }
    },
    checkTextAnswer(markAsAnsweredIfWrong) {
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
      } else if (this.type === 'blanks') {
        this.checkBlanksAnswer(markAsAnsweredIfWrong);
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
        transition: transform 0.35s ease-out, opacity 0.35s linear;
    }

    .question-enter-active {
        opacity: 0;
        transform: translateY(-2%);
    }

    .question-leave-to {
        opacity: 0;
        transform: translateY(2%);
    }

    .q-btn {
        border-radius: 2.5em;
        transition: opacity 0s, transform 0s;
    }

    /* Todo: Reimplement button animations for Vue 3 without
      hydration issues or warnings.
    */

    /* .q-btn-enter {
        opacity: 0;
        transform: translateY(30px);
    }

    .q-btn-leave-to {
        opacity: 0;
        transform: translateX(calc(-100% - 0.25rem));
    }

    .q-btn-leave-active {
        position: absolute;
    } */

    .card-header {
        font-size: 1.05em;
        font-weight: 400;
    }

    /* For accomodating block markdown nicely */
    .card-header > :last-child,
    .answer > :last-child {
        margin-bottom: 0;
    }

    @keyframes shake {
        50% { transform: translate(-2px, 0); }
        100% { transform: translate(2px, 0); }
    }

    .shake {
        animation: shake 0.15s;
        animation-iteration-count: 1;
    }

    /* text question text area */
    textarea.form-control {
        height: auto;
        min-height: 75px;
        margin-bottom: 10px;
    }
</style>
