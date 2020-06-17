<template>
    <div :class="['question-wrapper', addClass]">
        <div class="body-wrapper">
            <!-- Default slot is question body -->
            <slot></slot>
            <div v-if="hasInputBool" class="textarea-container">
                <textarea class="form-control question-input" rows="3" placeholder="write your answer here..."></textarea>
            </div>
        </div>
        <panel v-show="hasHintSlot" expandable no-close preload>
            <template slot="header">
                Hint
            </template>
            <template v-if="isEmptyHint">
                No hint is available for this question.
            </template>
            <template v-else>
                <div ref="hintWrapper">
                    <slot name="hint"></slot>
                </div>
            </template>
        </panel>
        <panel v-show="hasAnswerSlot" expandable no-close preload>
            <template slot="header">
                Answer
            </template>
            <template v-if="isEmptyAnswer">
                No answer is provided for this question.
            </template>
            <template v-else>
                <div ref="answerWrapper">
                    <slot name="answer"></slot>
                </div>
            </template>
        </panel>
    </div>
</template>

<script>
  import {toBoolean} from './utils/utils.js'
  import panel from './Panel.vue'

  export default {
    components: {
      panel,
    },
    props: {
      hasInput: {
        type: Boolean,
        default: false
      },
      addClass: {
        type: String,
        default: ''
      }
    },
    computed: {
      // Vue 2.0 coerce migration
      hasInputBool () {
        return toBoolean(this.hasInput);
      }
      // Vue 2.0 coerce migration end
    },
    data () {
      return {
        hasAnswerSlot: true,
        hasHintSlot: true,
        isEmptyAnswer: false,
        isEmptyHint: false
      }
    },
    mounted() {
      this.$nextTick(function() {
        const emptyDiv = '<div></div>';
        this.hasAnswerSlot = !!this.$slots.answer;
        this.hasHintSlot = !!this.$slots.hint;
        if (this.$refs.answerWrapper) {
          this.isEmptyAnswer = this.$refs.answerWrapper.innerHTML === emptyDiv;
        }
        if (this.$refs.hintWrapper) {
          this.isEmptyHint = this.$refs.hintWrapper.innerHTML === emptyDiv;
        }
      })
    }
  }
</script>

<style>
    .body-wrapper {
        padding-bottom: 10px;
    }
    .question-wrapper > .panel-group > .panel-container + .panel-container {
        display: block;
        margin-top: 5px;
    }
    .textarea-container {
        margin: 8px 0;
    }
    .textarea-container > textarea {
        margin: 4px 0;
    }
</style>
