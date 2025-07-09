<template>
  <div v-if="link" class="flex justify-between text-body">
    <div>
      <span v-if="prefix" class="mr-1 whitespace-nowrap text-white">{{ prefix }}:</span>
      <a :href="link" class="no-underline hover:underline" target="_blank">
        <TableEllipsis :text="textOrLink" :copy="false" />
      </a>
    </div>

    <button class="ml-2" @click="copyToClipboard(link)">
      <span class="icon-copy text-white-primary" :class="color"></span>
    </button>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  prefix: { type: String, default: '' },
  link: { type: String, default: '' },
  text: { type: String, default: '' },
  color: { type: String, default: '' },
});

const textOrLink = computed(() => {
  return props.text || props.link;
});
</script>
