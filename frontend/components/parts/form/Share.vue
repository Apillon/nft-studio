<script lang="ts" setup>
import { transactionLink } from '~/lib/misc/chain';

const props = defineProps({
  metadata: { type: Object as PropType<Metadata>, default: null },
  txHash: { type: String, default: null },
});
const config = useRuntimeConfig();
const { parseLink } = useIpns();
const { nftImported } = useClaim();

const loading = ref(true);
const imageLink = ref(props.metadata.image);

onMounted(async () => {
  imageLink.value = await parseLink(props.metadata?.image || '');
  loading.value = false;
});
</script>

<template>
  <div v-if="metadata" class="max-w-md w-full md:px-2 mx-auto">
    <div v-if="txHash || true" class="mb-8 text-center">
      <NuxtIcon name="icon/success" class="inline-block text-3xl text-green" filled />
      <h4>Great success!</h4>
      <p class="text-bg-bg">Your NFT has been successfully minted. Share it with the world!</p>
    </div>
    <h1 class="my-4 text-center lg:text-3xl">Your NFT</h1>

    <div class="rounded-lg overflow-hidden mb-6 max-w-64 mx-auto">
      <div v-if="loading" class="w-full h-40 flex-cc">
        <Spinner :size="36" />
      </div>
      <img v-else-if="imageLink" :src="imageLink" class="w-full" alt="nft" />

      <div class="p-3 bg-grey-dark rounded-b-lg text-white">
        <span class="text-cs">{{ metadata.name }}</span>
      </div>
      <div class="mt-4 text-center">
        <a
          v-if="txHash"
          :href="transactionLink(txHash, config.public.CHAIN_ID)"
          class="hover:underline"
          target="_blank"
        >
          Transaction: {{ shortHash(txHash) }}
        </a>
      </div>
      <div v-if="nftImported === false">
        <p class="mt-4 text-center">
          <span class="text-red">NFT not imported</span>
          <br />
          <span class="text-grey">Please import your NFT to see it in your wallet.</span> <br />
          Contract address: <span class="text-blue">{{ config.public.CONTRACT_ADDRESS }}</span> <br />
          NFT ID: <span class="text-blue">{{ metadata.id }}</span>
        </p>
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
