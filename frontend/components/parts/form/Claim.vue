<script lang="ts" setup>
import SuccessSVG from '~/assets/images/success.svg';
import { createPublicClient, http } from 'viem';
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
const { network, walletAddress, sign } = useWalletConnect();
const publicClient = createPublicClient({ chain: network.value, transport: http() });

const loading = ref<boolean>(false);
const walletUsed = ref<boolean>(false);

const getURI = () => {
  switch (props.type) {
    case ClaimType.FREE_MINT:
      return '/claim';
    case ClaimType.WHITELIST:
      return '/claim-whitelist';
    default:
      return '/claim-airdrop';
  }
};

async function claim() {
  loading.value = true;

  try {
    const timestamp = props.timestamp || new Date().getTime();
    const signature =
      props.signature || (await sign(`test\n${timestamp}`).catch(e => contractError(e)));

    const { data } = await $api.post<ClaimResponse>(getURI(), {
      jwt: props.type === ClaimType.AIRDROP ? props.token : undefined,
      signature,
      timestamp,
      address: walletAddress.value,
    });
    if (data.success) {
      txWait.hash.value = data.transactionHash;
      message.info('Your NFT Mint has started');

      const receipt = await txWait.wait();
      const receipt1 = await publicClient.waitForTransactionReceipt({ hash: data.transactionHash });
      message.success('You successfully claimed NFT');

      const logs = receipt1?.logs || receipt.data?.logs;

      if (logs && logs[0].topics[3]) {
        const nftId = Number(logs[0].topics[3]);
        const metadata = await loadNft(nftId);
        setTimeout(() => addNftId(nftId, metadata), 1000);

        emits('claim', metadata, data.transactionHash);
      } else {
        message.error('Mint failed, missing NFT ID!');
      }
    } else {
      message.error('Failed to claim NFT, please try again later.');
    }
    loading.value = false;
  } catch (e) {
    handleError(e);
    // contractError(e);
    loading.value = false;
  }
}
</script>

<template>
  <div class="max-w-md w-full md:px-6 my-12 mx-auto">
    <img :src="SuccessSVG" class="mx-auto" width="165" height="169" alt="airdrop" />

    <div class="my-8 text-center">
      <h3 class="mb-6">Great Success!</h3>
      <p>
        Minting your NFT is almost done. Please sign the message with your wallet to confirm
        ownership of the wallet and claim your NFT.
      </p>
    </div>
    <Btn size="large" :loading="loading" :disabled="walletUsed" @click="claim()">Claim NFT</Btn>
  </div>
</template>
