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
      <template v-if="!!config.public.EMBEDDED_WALLET_CLIENT">
        <Btn class="relative" type="secondary" size="large" @click="openWallet">
          <span class="mr-1">▶◀</span> Apillon Embedded Wallet
          <Tag v-if="!admin" class="absolute -right-4 top-0 rotate-12 z-10" type="info">No setup needed</Tag>
        </Btn>
      </template>
    </FormWallet>
  </modal>
</template>

<script lang="ts" setup>
import type { Size } from 'naive-ui/es/button/src/interface';
import { useAccountEffect, useChains } from '@wagmi/vue';
import { EmbeddedWallet, useWallet, useAccount } from '@apillon/wallet-vue';

const props = defineProps({
  admin: { type: Boolean, default: false },
  size: { type: String as PropType<Size>, default: 'medium' },
});

const config = useRuntimeConfig();
const authStore = useAuthStore();
const chains = useChains();
const { info } = useAccount();
const { wallet } = useWallet();
const { loading, modalWalletVisible, network, connected, walletAddress, disconnectWallet, initEmbeddedWallet, login } =
  useWalletConnect();

useAccountEffect({ onConnect: () => loginDelay() });

onMounted(() => {
  initEmbeddedWallet();
});
watch(
  () => walletAddress.value,
  (newValue, oldValue) => {
    if (oldValue && newValue) {
      modalWalletVisible.value = false;
    }
  }
);
watch(
  () => info.activeWallet?.address,
  address => {
    if (address && props.admin) {
      login();
    }
  }
);

function openWallet() {
  if (info.activeWallet?.address && props.admin) {
    login();
  } else if (wallet.value) {
    wallet.value.events.emit('open', true);
    modalWalletVisible.value = false;
  }
}

function loginDelay() {
  setTimeout(() => login(props.admin), 100);
}
</script>
