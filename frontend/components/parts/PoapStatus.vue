<template>
  <div class="inline-block h-6 px-2 py-1 uppercase text-bg-dark font-bold text-[10px] rounded-xl" :class="statusColor">
    <span v-if="status === PoapStatus.WAITING">Waiting</span>
    <span v-else-if="status === PoapStatus.IN_PROGRESS">Event running</span>
    <span v-else>Concluded</span>
  </div>
</template>

<script lang="ts" setup>
import { PoapStatus } from '~/lib/values/general.values';

const props = defineProps({
  status: { type: Number, default: 0 },
});

const statusColor = computed(() => {
  switch (props.status) {
    case 0:
      return 'bg-orange';
    case 1:
      return 'bg-green';

    default:
      return 'bg-bodyDark';
  }
});
</script>
