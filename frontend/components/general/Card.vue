<template>
  <div class="relative w-full max-w-md border-card border-black p-6">
    <div v-if="icon || img" class="flex-cc h-12 w-12 rounded p-1">
      <NuxtIcon v-if="icon" :name="icon" class="icon-auto text-2xl" />
      <img v-else-if="img" :src="img" alt="" />
    </div>

    <div class="flex w-full flex-col justify-evenly gap-2">
      <slot name="title">
        <h5>{{ title }}</h5>
      </slot>
      <div v-if="content || $slots.default" class="flex flex-col gap-2">
        <slot>
          <p class="text-xs text-black">{{ content }}</p>
        </slot>
        <div v-if="tags" class="flex gap-1">
          <Tag v-for="(tag, key) in tags" :key="key">{{ tag }}</Tag>
        </div>
        <slot name="additional" />
      </div>
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
