<script lang="ts" setup>
import type { CreateConnectorFn, Connector } from '@wagmi/vue';
import { useConnect, useAccount } from '@wagmi/vue';

const props = defineProps({
  admin: { type: Boolean, default: false },
});

const { isConnecting, isConnected, connector } = useAccount();
const { connect, connectors } = useConnect();
const { login } = useWalletConnect();
const userStore = useUserStore();

const connectorName = ref('');

function connectWallet(conn: Connector<CreateConnectorFn>) {
  if (props.admin) {
    userStore.$reset();
  }
  if (isConnected.value && conn.type === connector.value?.type) {
    login(props.admin);
  } else {
    connectorName.value = conn.name;
    connect({ connector: conn });
  }
}
</script>

<template>
  <div class="max-w-md w-full md:px-6 my-12 mx-auto text-center">
    <NuxtIcon name="icon/studio" class="text-3xl inline-block" />

    <h1 class="my-4">NFT Studio</h1>
    <div>
      <strong>Your NFTs, delivered with style</strong><br />
      Email them. Airdrop them. Share a link. <br />No gas fees. No fuss.
    </div>

    <hr class="my-4 border-grey-transparent dark:border-bg-lighter" />
    <h6 class="my-4">Connect your wallet to get started:</h6>

    <n-space size="large" vertical>
      <slot />
      <Btn
        v-for="(connector, key) in connectors"
        :key="key"
        type="secondary"
        size="large"
        :loading="isConnecting && connectorName === connector.name"
        @click="connectWallet(connector)"
      >
        <span class="inline-flex gap-2 items-center">
          <NuxtIcon :name="`logo/${connector.type}`" class="text-xl" filled />
          <span>{{ connector.name }}</span>
        </span>
      </Btn>
    </n-space>
  </div>
</template>
