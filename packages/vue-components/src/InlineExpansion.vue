<template>
    <div class=inline-panel>
        <slot></slot>
    </div>
</template>

<script>
export default {
  name: 'InlineExpansion',
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