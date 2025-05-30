<script lang="ts" setup>
defineEmits(['close']);
defineProps({ title: { type: String, default: '' }, innerClass: { type: String, default: '' } });
</script>

<template>
  <n-modal
    v-bind="$attrs"
    class="min-w-full max-w-full border border-solid border-tq bg-bg dark:bg-bg-darker xs:min-w-[400px] sm:min-w-[487px]"
  >
    <div class="relative" :class="innerClass || 'px-3 py-6 sm:p-10'">
      <!-- Close Button -->
      <!-- eslint-disable vue/require-explicit-emits -->
      <button
        class="absolute right-3 top-2 z-10 block !p-0.5 text-tq hover:text-tq-hover sm:right-5 sm:top-5"
        @click="$emit('close', false)"
      >
        <NuxtIcon name="action/close" class="text-[18px] text-[#34cfc6]" />
      </button>

      <!-- Title -->
      <h2 v-if="title" class="mb-6 text-center text-xl font-medium text-blue sm:mb-10 md:text-3xl">
        {{ title }}
      </h2>

      <!-- Content -->
      <slot />
    </div>
  </n-modal>
</template>
