<template>
    <div>
        <button v-if="!isShowInlineText" v-on:click="isShowInlineText = !isShowInlineText;" class=inline-panel>
            {{ header }}
        </button>
        <div v-else>
            <slot></slot>
        </div>
    </div>
</template>

<script>
export default {
  name: 'InlineExpansion',
  props: {
    header: {
      type: String,
      default: 'Header',
    },
  },
  data() {
    return {
        isShowInlineText : false,
    }
  },
}
</script>

<style>
.inline-panel {
    border: 1px solid #ddd;
    padding: 4px 6px;
    border-radius: 3px;
    color: #333;
    margin: 0 6px 4px 0;
    display: inline-block;
}
</style>