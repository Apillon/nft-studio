<template>
  <div
    class="relative my-6 flex w-full cursor-pointer gap-4 rounded-md border p-4 text-sm hover:cursor-pointer"
    :class="[disabled ? 'border-bodyDark' : 'border-bg-lighter', { '!cursor-default opacity-60': disabled }]"
  >
    <span v-if="selected" class="absolute right-0 top-0 z-1 -translate-y-1/2 translate-x-1/2 bg-bg rounded-full">
      <NuxtIcon name="icon/success" class="text-2xl" filled />
    </span>
    <Tag v-if="alert" type="error" class="absolute top-2 right-2">
      {{ alert }}
    </Tag>
    <div v-if="icon || img" class="flex-cc h-12 w-12 rounded p-1">
      <NuxtIcon v-if="icon" :name="icon" class="icon-auto text-2xl" />
      <img v-else-if="img" :src="img" alt="" />
    </div>

    <div class="flex w-full flex-col justify-evenly gap-2">
      <slot name="title">
        <strong>{{ title }}</strong>
      </slot>
      <div v-if="content || $slots.default" class="flex flex-col gap-1">
        <slot>
          <p class="text-xs text-white-secondary">{{ content }}</p>
        </slot>
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
  disabled: { type: Boolean, default: false },
  selected: { type: Boolean, default: false },
  alert: { type: String, default: '' },
});
</script>
