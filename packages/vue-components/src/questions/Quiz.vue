<template>
  <div :class="['quiz-container', addClass]">
    <div v-if="state === 3" class="card intro-outro-card">
      <div class="card-body">
        <slot name="intro">
          <h4>
            Click start to begin
          </h4>
        </slot>

        <h5>{{ questions.length }} questions</h5>

        <hr />

        <button
          type="button"
          class="btn btn-primary d-inline-block"
          @click="begin"
        >
          Start
        </button>
      </div>
    </div>

    <div
      v-show="state === 4"
      class="progress"
      style="height: 1px;"
    >
      <div
        class="progress-bar"
        role="progressbar"
        :style="{ width: `${currentQuestion / questions.length * 100}%` }"
        aria-valuemin="0"
        :aria-valuemax="questions.length"
        :aria-valuenow="currentQuestion"
      ></div>
    </div>

    <slot></slot>

    <transition name="intro-outro-card" @after-enter="setScoreCircleStyles">
      <div v-if="state === 5" class="card intro-outro-card">
        <div class="card-body">
          <h4 class="mb-3">
            {{ scoreText }}
          </h4>
          <svg
            viewBox="0 0 100 100"
            width="120px"
            height="120px"
          >
            <circle
              cx="50"
              cy="50"
              r="42"
              class="score-background-circle"
            />
            <circle
              ref="score"
              cx="50"
              cy="50"
              r="42"
              transform="rotate(-90, 50, 50)"
              class="score-circle"
              stroke-dashoffset="264"
            />
            <text
              class="score"
              x="22"
              y="57"
              textLength="56"
            >{{ score }} / {{ questions.length }}</text>
          </svg>

          <hr />

          <button
            type="button"
            class="btn btn-outline-primary"
            @click="begin"
          >
            Retry
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import {
  STATE_CORRECT,
} from './QuestionConstants';

const STATE_QUIZ_FRESH = 3;
const STATE_QUIZ_IN_PROGRESS = 4;
const STATE_QUIZ_DONE = 5;

export default {
  name: 'Quiz',
  props: {
    addClass: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      currentQuestion: 0,
      questions: [],
      score: 0,
      state: STATE_QUIZ_FRESH,
    };
  },
  provide() {
    return {
      questions: this.questions,
      gotoNextQuestion: this.gotoNextQuestion,
    };
  },
  computed: {
    scoreText() {
      return (this.score / this.questions.length) > 0.5
        ? 'Well done!'
        : 'Try again?';
    },
  },
  methods: {
    gotoNextQuestion() {
      this.questions[this.currentQuestion - 1].hide();
      this.currentQuestion += 1;
      if (this.currentQuestion <= this.questions.length) {
        this.questions[this.currentQuestion - 1].show();
      } else {
        this.complete();
      }
    },
    begin() {
      this.currentQuestion = 1;
      this.score = 0;
      this.state = STATE_QUIZ_IN_PROGRESS;
      if (this.questions.length) {
        this.questions[0].show();
      }
    },
    reset() {
      this.questions.forEach((question) => question.reset());
    },
    complete() {
      this.score = this.questions.filter((q) => q.qState.state === STATE_CORRECT).length;
      this.state = STATE_QUIZ_DONE;
      this.reset();
    },
    setScoreCircleStyles() {
      const scoreFactor = this.score / this.questions.length;
      this.$refs.score.style.strokeDashoffset = (1 - scoreFactor) * 264;
      this.$refs.score.style.stroke = '#51c2f8';
    },
  },
};
</script>

<style scoped>
.quiz-container {
    overflow: hidden;
}

.intro-outro-card {
    transition: opacity 0.5s;
    box-shadow: 0 2px 7px 5px rgba(210, 210, 210, 0.2);
}

.intro-outro-card-enter-active,
.intro-outro-card-leave-to {
    opacity: 0;
}

.intro-outro-card > .card-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.score {
    font-size: 1.4rem;
    font-weight: bold;
}

.score-circle {
    stroke-dasharray: 264;
    fill: none;
    stroke: rgba(132, 215, 255, 0.8);
    stroke-width: 8;
    transition: stroke-dashoffset 1.5s ease-out, stroke 1.5s linear;
}

.score-background-circle {
    fill: none;
    stroke: rgba(227, 226, 226, 0.5);
    stroke-width: 8;
}

.btn {
    border-radius: 2em;
}

</style>
