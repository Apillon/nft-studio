<script lang="ts" setup>
import { ClaimType } from '~/lib/values/general.values';

const config = useRuntimeConfig();
const title =
  config.public.type === ClaimType.FREE_MINT
    ? 'NFT Wild West'
    : config.public.type === ClaimType.POAP
      ? 'NFT Event Edition'
      : 'NFT Brand Booster';

useHead({ title });
</script>

<template>
  <div class="h-full">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
