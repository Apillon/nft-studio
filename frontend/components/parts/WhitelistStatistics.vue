<template>
  <div v-if="statistics" class="flex gap-8 mb-8">
    <div class="px-4 py-3 bg-grey-dark rounded-lg min-w-[13em]">
      <h2 class="inline-block">{{ statistics.generatedSignature }}</h2>
      <span class="text-grey ml-1">/{{ statistics.total || '?' }}</span>
      <p class="">claimed/available NFTs</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue';
defineProps({ statistics: { type: Object as PropType<WhitelistStatisticsInterface>, default: null } });
</script>
