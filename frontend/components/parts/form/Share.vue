<script lang="ts" setup>
import type { PropType } from 'vue';
defineProps({
  metadata: { type: Object as PropType<Metadata>, default: null },
  txHash: { type: String, default: null },
});
</script>

<template>
  <div v-if="metadata" class="max-w-md w-full md:px-6 mx-auto">
    <div class="mb-8 text-center">
      <h3>Just minted my #{{ metadata.name }} NFT on Apillon!</h3>
    </div>

    <div class="rounded-lg overflow-hidden mb-6">
      <img :src="parseImage(`${metadata.image}`)" class="w-full" alt="nft" />

      <div class="p-6 bg-grey-dark text-white">
        <h5>{{ metadata.name }}</h5>
      </div>
      <div class="mt-4 text-center">
        <p class="mb-4">{{ metadata.description }}</p>

        <!-- Transaction -->
        <a v-if="txHash" :href="transactionLink(txHash)" class="hover:underline" target="_blank">
          Transaction: {{ shortHash(txHash) }}
        </a>
      </div>
    </div>

    <Btn
      type="secondary"
      size="large"
      :href="`https://twitter.com/intent/tweet?text=Just minted my ${metadata.name} NFT on Apillon!&url=https://apillon.io/`"
    >
      <span class="inline-flex gap-2 items-center">
        <NuxtIcon name="logo/x" class="text-xl" />
        Share on X
      </span>
    </Btn>
  </div>
</template>
