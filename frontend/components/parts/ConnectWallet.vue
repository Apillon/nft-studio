<template>
  <div v-if="connected && (!admin || authStore.loggedIn)" v-bind="$attrs" class="flex justify-end gap-2 items-center">
    <strong v-if="walletAddress"> ({{ shortHash(walletAddress) }}) </strong>
    <Btn :size="size" type="secondary" :loading="loading" @click="disconnectWallet()"> Disconnect </Btn>
  </div>
  <Btn v-else-if="connected" v-bind="$attrs" :size="size" :loading="loading" @click="login(admin)"> Login </Btn>
  <Btn v-else :size="size" v-bind="$attrs" :loading="loading" round @click="modalWalletVisible = true">
    Connect wallet
  </Btn>

  <EmbeddedWallet
    v-if="!!config.public.EMBEDDED_WALLET_CLIENT && !!network?.id"
    :client-id="config.public.EMBEDDED_WALLET_CLIENT"
    passkey-auth-mode="popup"
    :default-network-id="network.id"
    :networks="
      chains.map(c => ({
        name: c.name,
        id: c.id,
        rpcUrl: c.rpcUrls.default.http[0],
        explorerUrl: c.blockExplorers?.default?.url || '',
      }))
    "
  />

  <modal
    :show="modalWalletVisible"
    @close="() => (modalWalletVisible = false)"
    @update:show="modalWalletVisible = false"
  >
    <FormWallet :admin="admin">
      <Btn v-if="!!config.public.EMBEDDED_WALLET_CLIENT" type="secondary" size="large" @click="openWallet">
        <span class="mr-1">▶◀</span> Apillon Embedded Wallet
      </Btn>
    </FormWallet>
  </modal>
</template>

<script lang="ts" setup>
import type { Size } from 'naive-ui/es/button/src/interface';
import { useAccountEffect, useChains } from '@wagmi/vue';
import { EmbeddedWallet, useWallet } from '@apillon/wallet-vue';

const props = defineProps({
  admin: { type: Boolean, default: false },
  size: { type: String as PropType<Size>, default: 'medium' },
});

const config = useRuntimeConfig();
const authStore = useAuthStore();
const chains = useChains();
const { wallet } = useWallet();
const { loading, modalWalletVisible, network, connected, walletAddress, disconnectWallet, initEmbeddedWallet, login } =
  useWalletConnect();

useAccountEffect({ onConnect: () => loginDelay() });

onMounted(() => {
  initEmbeddedWallet();
});

function openWallet() {
  if (wallet.value) {
    wallet.value.events.emit('open', true);
    modalWalletVisible.value = false;
  }
}

function loginDelay() {
  setTimeout(() => login(props.admin), 100);
}
</script>
