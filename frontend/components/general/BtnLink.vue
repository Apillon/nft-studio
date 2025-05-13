<template>
  <component
    :is="link ? 'a' : 'div'"
    :href="link"
    class="card-white flex gap-4 justify-between items-center text-sm cursor-pointer no-underline"
    target="_blank"
  >
    <n-ellipsis :line-clamp="1"> {{ text || link }}</n-ellipsis>
    <span class="icon-expand text-lg"></span>
  </component>
</template>

<script lang="ts" setup>
defineProps({
  link: { type: String, default: null },
  text: { type: String, default: '' },
});
</script>
