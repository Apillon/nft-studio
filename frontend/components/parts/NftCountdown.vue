<script lang="ts" setup>
import AirdropSVG from '~/assets/images/airdrop.svg';

defineEmits(['proceed']);
defineProps({ timestamp: { type: [String, Number, Date], default: '' } });

const { getMaxSupply, getTotalSupply, getName } = useClaim();

const allNfts = await getMaxSupply();
const mintedNfts = await getTotalSupply();
const name = await getName();
</script>

<template>
  <div class="max-w-md w-full md:px-6 my-12 mx-auto">
    <img :src="AirdropSVG" class="mx-auto" width="202" height="240" alt="airdrop claim" />

    <div class="my-8 text-center">
      <h3 class="mb-6">{{ name }}</h3>
      <n-tag class="mb-6" type="info" size="small" :bordered="false" round>
        Only {{ allNfts - mintedNfts }} available
      </n-tag>
      <p>Connect your wallet to claim ˝{{ name }}˝ NFTs.</p>
    </div>

    <div class="">
      <div class="text-center mb-4">
        <strong>Time left to claim</strong>
      </div>
      <Timer :date-time-to="timestamp" />
    </div>
  </div>
</template>
