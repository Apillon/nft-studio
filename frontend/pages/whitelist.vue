<script lang="ts" setup>
import { ClaimType } from '~/lib/values/general.values';

definePageMeta({
  layout: 'claim',
});
useHead({
  title: 'Apillon whitelist claim prebuilt solution',
});

const message = useMessage();
const config = useRuntimeConfig();
const { handleError } = useErrors();
const { contractError } = useClaim();
const { connected, walletAddress, sign } = useWalletConnect();

const loading = ref<boolean>(false);
const metadata = ref<Metadata | null>(null);
const txHash = ref<string | undefined>();
const timestamp = ref<number>(new Date().getTime());
const walletSignature = ref<string | undefined>();

const timeToStart = computed(() => Number(config.public?.CLAIM_START) - timestamp.value);

watch(
  () => walletAddress.value,
  _ => {
    if (!walletAddress) {
      metadata.value = null;
    }
  }
);

async function validateWallet() {
  timestamp.value = new Date().getTime();
  const signature = await sign(`test\n${timestamp.value}`).catch(e => contractError(e));
  if (!signature) return;

  loading.value = true;
  try {
    const { data } = await $api.post<SuccessResponse>('/claim/validate', {
      signature,
      address: walletAddress.value,
      timestamp: timestamp.value,
    });
    if (data) {
      message.success('You have successfully validated your wallet and can now claim your NFT.');
      walletSignature.value = signature;
    }
  } catch (e) {
    handleError(e);
  }
  loading.value = false;
}

function onClaim(m: Metadata, hash?: string) {
  metadata.value = m;
  txHash.value = hash;
}
</script>

<template>
  <FormShare v-if="metadata" :metadata="metadata" :tx-hash="txHash" />
  <NftCountdown v-else-if="walletSignature && timeToStart > 0" :timestamp="$config.public.CLAIM_START" />
  <FormClaim
    v-else-if="walletSignature"
    :signature="walletSignature"
    :timestamp="timestamp"
    :type="ClaimType.WHITELIST"
    @claim="onClaim"
  />
  <div v-else class="max-w-md w-full md:px-6 my-12 mx-auto">
    <ConnectWallet v-if="!connected" size="large" />
    <Btn v-else size="large" :loading="loading" @click="validateWallet()"> Wallet eligibility check </Btn>
  </div>
</template>
