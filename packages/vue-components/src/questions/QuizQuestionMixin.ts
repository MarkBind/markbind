import { defineComponent } from 'vue';
import { STATE_FRESH } from './QuestionConstants';

export default defineComponent({
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
    showNextQuestion: {
      default: undefined,
    },
  },
  methods: {
    show(this: any) {
      this.active = true;
    },
    hide(this: any) {
      this.active = false;
    },
    reset(this: any) {
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
  created(this: any) {
    if (this.questions) {
      this.active = false;
      this.questions.push(this);
    }
  },
});
