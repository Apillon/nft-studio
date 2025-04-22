<script lang="ts" setup>
import SuccessSVG from '~/assets/images/success.svg';
import { ClaimType } from '~/lib/values/general.values';

const config = useRuntimeConfig();
const router = useRouter();
const message = useMessage();
const type = config.public.CLAIM_TYPE;

definePageMeta({
  layout: 'claim',
});
useHead({
  title:
    type === ClaimType.POAP
      ? 'Apillon POAP prebuilt solution'
      : type === ClaimType.FREE_MINT
        ? 'Apillon Gasless mint prebuilt solution'
        : 'Apillon email airdrop prebuilt solution',
});

const { query } = useRoute();
const { handleError } = useErrors();
const { contractError, loadNft } = useClaim();
const { connected, walletAddress, disconnectWallet, sign } = useWalletConnect();

const loading = ref<boolean>(false);
const metadata = ref<Metadata | null>(null);
const timestamp = ref<number>(new Date().getTime());
const walletSignature = ref<string | undefined>();

const timeToStart = computed(() => Number(config.public.CLAIM_START) - timestamp.value);
const isWhitelist = computed(() => Number(type) === ClaimType.WHITELIST);
const isAirdrop = computed(() => Number(type) === ClaimType.AIRDROP || Number(type) === ClaimType.POAP);

watch(
  () => walletAddress.value,
  async _ => {
    if (walletAddress.value) {
      metadata.value = await loadNft();
    } else {
      metadata.value = null;
    }
  },
  { immediate: true }
);

async function validateWallet() {
  loading.value = true;
  timestamp.value = new Date().getTime();

  const signature = await sign(`test\n${timestamp.value}`).catch(e => contractError(e));
  if (!signature) {
    loading.value = false;
    return;
  }

  try {
    const { data } = await $api.post<SuccessResponse>('/claim/validate', {
      signature,
      address: walletAddress.value,
      timestamp: timestamp.value,
    });
    if (data) {
      message.success('You have successfully validated your wallet and can now claim your NFT.');
      walletSignature.value = signature;
    } else {
      disconnectWallet();
    }
  } catch (e) {
    handleError(e);
  }
  loading.value = false;
}

function onClaim(metadata: Metadata, txHash?: string) {
  router.push({ name: 'share', query: { ...metadata, txHash } });
}
</script>

<template>
  <div v-if="!query.token && isAirdrop" class="my-8 text-center max-w-sm mx-auto">
    <h3 class="mb-6">Claim not available</h3>
    <p>
      To claim your NFT, you need to provide a valid token. Please check the link you received in email and try again.
    </p>
  </div>
  <FormShare v-else-if="metadata" :metadata="metadata" />
  <div v-else-if="!connected" class="max-w-md w-full md:px-6 my-12 mx-auto">
    <img :src="SuccessSVG" class="mx-auto" width="165" height="169" alt="airdrop" />

    <div class="my-8 text-center">
      <h3 class="mb-6">Great Success!</h3>
      <p>
        To join this NFT airdrop, you need to connect your EVM compatible wallet. This step is crucial for securely
        receiving and managing the airdropped NFTs.
      </p>
    </div>

    <ConnectWallet size="large" />
  </div>
  <div v-else-if="isWhitelist && !walletSignature" class="max-w-md w-full md:px-6 my-12 mx-auto">
    <Btn size="large" :loading="loading" @click="validateWallet()"> Wallet eligibility check </Btn>
  </div>
  <NftCountdown v-else-if="timeToStart > 0" :timestamp="config.public.CLAIM_START" />
  <FormClaim
    v-else
    :signature="walletSignature"
    :timestamp="timestamp"
    :type="config.public.CLAIM_TYPE"
    :token="queryParam(query.token)"
    @claim="onClaim"
  />
</template>
