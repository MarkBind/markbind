<template>
  <div>
    <!-- Text Displayed -->
    <p>{{ isExpanded ? expandedText : processedCollapsedText }}</p>

    <!-- Toggle between Collapsed and Expanded -->
    <button @click="toggleExpansion">
      {{ isExpanded ? 'Collapse' : 'Expand' }}
    </button>
  </div>
</template>

<script>
export default {
  props: {
    expandedText: {
      type: String,
      required: true,
    },
    collapsedText: {
      type: String,
      default: '',
    },
    maxChars: {
      type: Number,
      default: 20,
    },
  },
  data() {
    return {
      isExpanded: false,
    };
  },
  computed: {
    processedCollapsedText() {
      const textToProcess = this.collapsedText || this.expandedText || '';
      return textToProcess.length > this.maxChars
        ? `${textToProcess.slice(0, this.maxChars - 3)}...`
        : textToProcess;
    },
  },
  methods: {
    toggleExpansion() {
      this.isExpanded = !this.isExpanded;
    },
  },
};
</script>
