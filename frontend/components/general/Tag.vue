<template>
  <strong
    v-bind="$attrs"
    class="inline-flex-cc gap-1 whitespace-nowrap text-grey-dark font-semibold transition-all duration-300"
    :class="[tagClass, sizeClass]"
  >
    <NuxtIcon v-if="type === 'error'" name="icon/alert" class="text-sm" filled />
    <NuxtIcon
      v-else-if="animation"
      name="animation/status"
      class="animation-spinning inline-flex-cc"
      filled
      :style="{ width: `12px`, height: `12px` }"
    />
    <slot />
  </strong>
</template>

<script lang="ts" setup>
import type { Size } from 'naive-ui/es/button/src/interface';

const props = defineProps({
  animation: { type: Boolean, default: false },
  size: { type: String as PropType<Size>, default: 'small' },
  type: { type: String as PropType<TagType>, default: 'default' },
});

const tagClass = computed(() => {
  switch (props.type) {
    case 'error':
      return 'bg-pink';
    case 'info':
      return 'bg-blue';
    case 'success':
      return 'bg-green';
    default:
      return 'bg-grey-transparent';
  }
});

const sizeClass = computed(() => {
  switch (props.size) {
    case 'tiny':
      return 'text-[10px] px-1 h-5 rounded';
    case 'small':
      return 'text-xs px-[6px] h-5 rounded-md';
    case 'large':
      return 'text-lg px-4 h-8 rounded-xl';
    default:
      return 'text-sm px-2 h-6 rounded-lg';
  }
});
</script>
