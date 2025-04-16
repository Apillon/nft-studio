<template>
  <div v-if="connected && (!admin || authStore.loggedIn)" class="flex gap-2 items-center">
    <strong v-if="walletAddress"> ({{ shortHash(walletAddress) }}) </strong>
    <Btn :size="size" type="secondary" :loading="loading" @click="disconnectWallet()"> Disconnect </Btn>
  </div>
  <Btn v-else-if="connected" :size="size" :loading="loading" @click="login(admin)"> Login </Btn>
  <Btn v-else :size="size" :loading="loading" round @click="modalWalletVisible = true"> Connect wallet </Btn>

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
        <span class="mr-1">▶◀</span> Apillon Embedded Wallet
      </Btn>
    </FormWallet>
  </modal>
</template>

<script lang="ts" setup>
import type { Size } from 'naive-ui/es/button/src/interface';
import { useAccountEffect } from '@wagmi/vue';
import { EmbeddedWallet } from '@apillon/wallet-vue';

const props = defineProps({
  admin: { type: Boolean, default: false },
  size: { type: String as PropType<Size>, default: 'medium' },
});

const config = useRuntimeConfig();
const authStore = useAuthStore();
const {
  loading,
  modalWalletVisible,
  network,
  connected,
  isLoggedIn,
  walletAddress,
  disconnectWallet,
  initEmbeddedWallet,
  login,
} = useWalletConnect();

useAccountEffect({ onConnect: () => loginDelay() });

onMounted(() => {
  initEmbeddedWallet();
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
