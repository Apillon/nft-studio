<template>
  <div v-if="text" class="flex">
    <n-ellipsis class="text-grey-dark align-bottom" :line-clamp="1">{{ text }}</n-ellipsis>
    <button v-if="copy" class="ml-2" @click="copyToClipboard(text)">
      <span class="icon-copy text-grey-dark"></span>
    </button>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  text: { type: String, default: '' },
  copy: { type: Boolean, default: true },
});
</script>
