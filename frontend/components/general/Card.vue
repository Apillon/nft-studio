<template>
  <div class="relative w-full max-w-md border-card border-black p-6">
    <div class="h-full w-full flex flex-col justify-between gap-2">
      <div v-if="icon || img" class="flex-cc h-12 w-12 rounded -mb-2">
        <NuxtIcon v-if="icon" :name="icon" class="icon-auto text-2xl" />
        <img v-else-if="img" :src="img" alt="" />
      </div>
      <slot name="title">
        <h5>{{ title }}</h5>
      </slot>
      <template v-if="content || $slots.default">
        <slot>
          <p class="text-xs text-black">{{ content }}</p>
        </slot>
        <div v-if="tags" class="flex gap-1">
          <Tag v-for="(tag, key) in tags" :key="key">{{ tag }}</Tag>
        </div>
        <slot name="additional" />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  icon: { type: String, default: '' },
  img: { type: String, default: '' },
  title: { type: String, default: '' },
  content: { type: String, default: '' },
  tags: { type: Array<String>, default: [] },
});
</script>
