<template>
  <div class="flex min-h-full flex-col justify-center text-center">
    <div class="mx-auto my-8 max-w-lg lg:my-16">
      <img :src="SuccessSVG" class="mx-auto" width="165" height="169" alt="airdrop" />

      <h4 class="mt-6">Congrats</h4>
      <p>You successfully added new NFT recipients.</p>
      <p v-if="!isMethodWallet">They received emails with instructions to claim their NFTs.</p>

      <div class="my-8 flex gap-4">
        <Btn class="flex-1" size="large" type="secondary" @click="$emit('close')"> Close </Btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SuccessSVG from '~/assets/images/success.svg';

defineEmits(['close']);
defineProps({
  isMethodWallet: { type: Boolean, default: false },
});
</script>
