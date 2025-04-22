<script lang="ts" setup>
import type { Address } from 'viem';
import SuccessSVG from '~/assets/images/success.svg';
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
const { contractError, loadNft } = useClaim();
const { walletAddress, sign } = useWalletConnect();

const loading = ref<boolean>(false);
const walletUsed = ref<boolean>(false);

const getURI = () => {
  switch (props.type) {
    case ClaimType.FREE_MINT:
      return '/claim';
    case ClaimType.WHITELIST:
      return 'claim/whitelist';
    default:
      return 'claim/airdrop';
  }
};

async function claim() {
  loading.value = true;

  try {
    const timestamp = props.timestamp || new Date().getTime();
    const signature = props.signature || (await sign(`test\n${timestamp}`).catch(e => contractError(e)));

    const { data } = await $api.post<ClaimResponse>(getURI(), {
      jwt: props.type === ClaimType.AIRDROP ? props.token : undefined,
      signature,
      timestamp,
      address: walletAddress.value,
    });
    if (data.success) {
      txWait.hash.value = data.transactionHash as Address;

      console.debug('Transaction', txWait.hash.value);
      message.info('Your NFT Mint has started');

      const receipt = await txWait.wait();
      console.debug(receipt);
      message.success('You successfully claimed NFT');

      if (receipt.data?.to && receipt.data?.logs[0].topics[3]) {
        const nftId = Number(receipt.data?.logs[0].topics[3]);

        const metadata = await loadNft(nftId);

        emits('claim', metadata, data.transactionHash);
      } else {
        message.error('Mint failed, missing NFT ID!');
      }
    } else {
      message.error('Failed to claim NFT, please try again later.');
    }
    loading.value = false;
  } catch (e) {
    contractError(e);
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
        To join this NFT airdrop, you need to connect your EVM compatible wallet. This step is crucial for securely
        receiving and managing the airdropped NFTs.
      </p>
    </div>
    <Btn size="large" :loading="loading" :disabled="walletUsed" @click="claim()">Claim NFT</Btn>
  </div>
</template>
