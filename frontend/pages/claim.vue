<script lang="ts" setup>
import type { Events } from '@apillon/wallet-sdk';
import { useWallet } from '@apillon/wallet-vue';
import { useMessage } from 'naive-ui';
import { isErc6492Signature } from 'viem';
import SuccessSVG from '~/assets/images/success.svg';
import { ClaimType } from '~/lib/values/general.values';

definePageMeta({
  layout: 'claim',
});
const config = useRuntimeConfig();
const router = useRouter();
const message = useMessage();
const { query } = useRoute();
const { wallet } = useWallet();
const { handleError } = useErrors();
const { nftImported, contractError, loadNft } = useClaim();
const { connected, walletAddress, disconnectWallet, sign } = useWalletConnect();
const timestamp = useTimestamp({ offset: 0 });

const loading = ref<boolean>(false);
const metadata = ref<Metadata | null>(null);
const walletSignature = ref<string | undefined>();

const type = config.public.CLAIM_TYPE;
const timeToStart = computed(() => Number(config.public.CLAIM_START) - timestamp.value);
const isWhitelist = computed(() => Number(type) === ClaimType.AIRDROP && !query?.nftToken);
const isPoap = computed(() => Number(type) === ClaimType.POAP);

onMounted(() => {
  if (wallet.value) {
    wallet.value.events.on('addTokenStatus', ({ success }: Events['addTokenStatus']) => {
      nftImported.value = success;
      success
        ? message.success('NFT successfully imported into the wallet!')
        : message.info('If you want to import NFT to wallet, paste contract address and token ID into your wallet.');
    });
  }
});

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
  const timestamp = new Date().getTime();

  const signature = await sign(`test\n${timestamp}`).catch(e => contractError(e));
  if (!signature) {
    loading.value = false;
    return;
  }

  try {
    const { data } = await $api.post<SuccessResponse>('/claim-validate', {
      signature,
      timestamp,
      address: walletAddress.value,
      isSmart: isErc6492Signature(signature as `0x${string}`),
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
  <div v-if="!query.nftToken && isPoap" class="my-8 text-center max-w-sm mx-auto">
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
    :type="type"
    :token="queryParam(query.nftToken)"
    @claim="onClaim"
  />
</template>
