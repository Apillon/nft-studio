<template>
  <Btn
    v-if="connected && (!admin || userStore.jwt)"
    :size="size"
    :color="colors.blue"
    :loading="loading"
    @click="disconnectWallet()"
  >
    Disconnect
    <small v-if="walletAddress"> ({{ shortHash(walletAddress) }}) </small>
  </Btn>
  <Btn v-else-if="connected" :size="size" :color="colors.blue" :loading="loading" @click="login()"> Login </Btn>
  <Btn v-else :size="size" :color="colors.blue" :loading="loading" round @click="modalWalletVisible = true">
    Connect wallet
  </Btn>

  <EmbeddedWallet
    :client-id="config.public.EMBEDDED_WALLET_CLIENT"
    passkey-auth-mode="tab_form"
    :default-network-id="network.id"
    :networks="[
      {
        name: network.name,
        id: network.id,
        rpcUrl: network.rpcUrls.default.http[0],
        explorerUrl: network.blockExplorers.default.url,
      },
    ]"
  />

  <modal
    :show="modalWalletVisible"
    @close="() => (modalWalletVisible = false)"
    @update:show="modalWalletVisible = false"
  >
    <FormWallet>
      <Btn type="secondary" size="large" @click="openWallet">
        <span class="text-white mr-1">▶◀</span> Apillon Embedded Wallet
      </Btn>
    </FormWallet>
  </modal>
</template>

<script lang="ts" setup>
import type { Size } from 'naive-ui/es/button/src/interface';
import { type Events } from '@apillon/wallet-sdk';
import { useAccountEffect } from '@wagmi/vue';
import { EmbeddedWallet, useWallet } from '@apillon/wallet-vue';
import { colors } from '~/tailwind.config';

const props = defineProps({
  admin: { type: Boolean, default: false },
  size: { type: String as PropType<Size>, default: 'small' },
});

const config = useRuntimeConfig();
const userStore = useUserStore();
const { loading, modalWalletVisible, network, connected, walletAddress, login, disconnectWallet } = useWalletConnect();

/** Apillon Embedded wallet */
const { wallet } = useWallet();

useAccountEffect({ onConnect: () => loginDelay() });

onMounted(async () => {
  await sleep(1000);

  if (wallet.value) {
    wallet.value?.events.on('connect', () => {
      console.debug('connect');
      login(props.admin);
    });
    wallet.value?.events.on('accountsChanged', async (accounts: Events['accountsChanged']) => {
      console.debug('accountsChanged');
      if (accounts.length) {
        login(props.admin);
      }
    });
    wallet.value?.events.on('dataUpdated', ({ name, newValue }) => {
      console.debug('data', name, newValue);
      if (name === 'wallets') {
        login(props.admin);
      }
    });
    wallet.value?.events.on('disconnect', () => {
      console.debug('disconnect');
      disconnectWallet();
    });
  }
});

function openWallet() {
  const btnWallet = document.querySelector('#oaw-wallet-widget-btn') as HTMLButtonElement;
  if (btnWallet) {
    btnWallet.click();
    modalWalletVisible.value = false;
  }
}

function loginDelay() {
  setTimeout(() => login(props.admin), 100);
}
</script>
