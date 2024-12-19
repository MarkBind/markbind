<template>
  <div>
    <!-- Toggle between Collapsed and Expanded -->
    <button class="inline-panel" @click="toggleExpansion">
      {{ isExpanded ? expandedText : processedCollapsedText }}
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

<style>
    .inline-panel {
        border: 1px solid #ccc;
        background-color: #f9f9f9;
        padding: 6px 8px;
        border-radius: 5px;
        color: #444;
        margin: 0 8px 6px 0;
        display: inline-block;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
