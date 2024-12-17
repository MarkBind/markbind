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
      default: '',
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
  methods: {
    toggleExpansion() {
      this.isExpanded = !this.isExpanded;
    },
    processedCollapsedText() {
      // If collapsedText is provided
      if (this.collapsedText) {
        return this.collapsedText.length > this.maxChars
          ? `${this.collapsedText.slice(0, this.maxChars - 3)}...`
          : this.collapsedText;
      }
      // If collapsedText is not provided
      if (this.expandedText.length > this.maxChars) {
        return `${this.expandedText.slice(0, this.maxChars - 3)}...`;
      }

      return this.expandedText;
    },
  },
};
</script>
