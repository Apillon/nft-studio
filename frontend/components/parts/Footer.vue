<template>
  <div class="py-8 flex gap-8 justify-center items-center">
    <div class="text-xs">Powered by</div>
    <NuxtIcon name="logo/crust" class="text-3xl" filled />
    <NuxtIcon name="logo/moonbeam" class="text-3xl" filled />
    <NuxtIcon name="logo/phala" class="text-3xl" filled />
  </div>
</template>

<script lang="ts" setup>
defineProps({
  alt: { type: String, default: 'Apillon logo' },
  height: { type: Number, default: 24 },
  width: { type: Number, default: 110 },
});
</script>
