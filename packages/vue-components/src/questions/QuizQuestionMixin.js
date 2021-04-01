import { STATE_FRESH } from './QuestionConstants';

export default {
  data() {
    return {
      active: true,
    };
  },
  inject: {
    questions: {
      default: undefined,
    },
    gotoNextQuestion: {
      default: undefined,
    },
  },
  methods: {
    show() {
      this.active = true;
    },
    hide() {
      this.active = false;
    },
    reset() {
      this.active = false;
      this.qState.answered = false;
      this.qState.state = STATE_FRESH;
      this.showHint = false;

      // Text Questions
      if (this.textareaText) {
        this.textareaText = '';
      }

      // Mcq or checkbox questions
      if (this.answers) {
        this.answers.splice(0, this.answers.length);
      }
    },
  },
  created() {
    if (this.questions) {
      this.active = false;
      this.questions.push(this);
    }
  },
};
