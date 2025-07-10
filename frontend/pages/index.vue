<script lang="ts" setup>
import { useWallet } from '@apillon/wallet-vue';
import { ClaimType } from '~/lib/values/general.values';

const config = useRuntimeConfig();
const { wallet } = useWallet();
const { isLoggedIn, initEmbeddedWallet } = useWalletConnect();

onMounted(() => {
  if (!isLoggedIn.value) {
    initEmbeddedWallet();
  }
});

function openEmbeddedWallet() {
  if (wallet.value) {
    wallet.value.events.emit('open', true);
  }
}
</script>

<template>
  <div v-if="!isLoggedIn">
    <div class="border border-black dark:bg-bg-darker rounded-lg mx-auto max-w-xl">
      <FormWallet admin>
        <Btn v-if="!!config.public.EMBEDDED_WALLET_CLIENT" type="secondary" size="large" @click="openEmbeddedWallet">
          <span class="mr-1">▶◀</span> Apillon Embedded Wallet
        </Btn>
      </FormWallet>
    </div>
    <div class="my-8 text-center max-w-xl mx-auto">
      <h6 class="mb-2 font-semibold">Having trouble logging in?</h6>
      <p class="text-black">
        Only those with secret handshake (the designated wallet) can enter. Contact the master who set up your Simplet
        to request access.
      </p>
    </div>
    <Footer />
  </div>
  <Poap v-else-if="Number(config.public.CLAIM_TYPE) === ClaimType.POAP" />
  <FreeMint v-else-if="Number(config.public.CLAIM_TYPE) === ClaimType.FREE_MINT" />
  <Airdrop v-else />
</template>
