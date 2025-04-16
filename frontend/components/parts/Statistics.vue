<template>
  <div v-if="statistics" class="card-dark small md:min-w-96 inline-flex gap-4">
    <div class="w-24">
      <img v-if="coverImage" :src="coverImage" width="96" height="96" alt="nft simplet collection" />
      <img v-else-if="WarriorPNG" :src="WarriorPNG" width="96" height="96" alt="nft simplet collection" />
      <NuxtIcon v-else name="icon/NFTs" class="text-3xl inline-block" />
    </div>
    <div class="">
      <span v-if="collectionName">{{ collectionName }}</span>
      <span v-else>NFT Collection</span>
      <h3 class="mt-2 mb-1">{{ statistics.airdropped || 0 }}/{{ statistics.total || '?' }}</h3>
      <span class="">available NFTs</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import WarriorPNG from '~/assets/images/warrior.png';
defineProps({
  statistics: { type: Object as PropType<StatisticsInterface>, default: null },
  collectionName: { type: String, default: '' },
  coverImage: { type: String, default: '' },
});
</script>
