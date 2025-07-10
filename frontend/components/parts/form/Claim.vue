<script lang="ts" setup>
import { useMessage } from 'naive-ui';
import { createPublicClient, http, isErc6492Signature } from 'viem';
import { ClaimType } from '~/lib/values/general.values';

const props = defineProps({
  signature: { type: String, default: null },
  timestamp: { type: Number, default: null },
  token: { type: String, default: undefined },
  amount: { type: Number, default: 1 },
  type: { type: Number, default: ClaimType.AIRDROP },
});
const emits = defineEmits(['claim']);

const message = useMessage();
const txWait = useTxWait();
const { handleError } = useErrors();
const { contractError, loadNft, addNftId } = useClaim();
const { network, walletAddress, ensureCorrectNetwork, sign } = useWalletConnect();
const publicClient = createPublicClient({ chain: network.value, transport: http() });

const loading = ref<boolean>(false);
const walletUsed = ref<boolean>(false);

const getURI = () => {
  switch (props.type) {
    case ClaimType.AIRDROP:
      return props.token ? '/claim-airdrop' : '/claim-whitelist';
    default:
      return '/claim';
  }
};

async function claim() {
  loading.value = true;

  try {
    const timestamp = props.timestamp || new Date().getTime();
    const signature = props.signature || (await sign(`test\n${timestamp}`).catch(e => contractError(e)));

    const { data } = await $api.post<ClaimResponse>(getURI(), {
      jwt: props?.token || undefined,
      signature,
      timestamp,
      address: walletAddress.value,
      isSmart: isErc6492Signature(signature as `0x${string}`),
    });
    if (data.success) {
      await ensureCorrectNetwork();
      txWait.hash.value = data.transactionHash;
      message.info('NFT minting has started');

      const receipt: any = await Promise.race([
        txWait.wait(),
        publicClient.waitForTransactionReceipt({ hash: data.transactionHash }),
      ]);
      message.success('You successfully claimed NFT');

      const logs = receipt?.logs || receipt.data?.logs;
      if (logs && logs[0].topics[3]) {
        const nftId = Number(logs[0].topics[3]);
        const metadata = await loadNft(nftId);
        setTimeout(() => addNftId(metadata), 1000);

        emits('claim', metadata, data.transactionHash);
      } else {
        message.error('Mint failed, missing NFT ID!');
      }
    } else {
      message.error('Failed to claim NFT, please try again later.');
    }
    loading.value = false;
  } catch (e: any) {
    handleError(e);
    if (e?.data?.errors?.some((i: any) => i?.code === 400007)) {
      const metadata = await loadNft();
      if (metadata) {
        emits('claim', metadata, '');
      }
    }
    loading.value = false;
  }
}
</script>

<template>
  <div class="max-w-md w-full md:px-9 my-12 mx-auto">
    <div class="my-8 text-center">
      <NuxtIcon name="icon/cube" class="inline-block icon-auto text-9xl lg:text-[150px]" filled />
      <h1 class="mt-4 mb-6 lg:text-3xl">Your NFT is ready for you</h1>
      <p>Click below to reveal your unique digital collectible.</p>
    </div>
    <Btn size="large" :loading="loading" :disabled="walletUsed" @click="claim()">Claim NFT</Btn>
  </div>
</template>
