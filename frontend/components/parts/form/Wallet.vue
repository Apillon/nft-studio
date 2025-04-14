<script lang="ts" setup>
import type { CreateConnectorFn, Connector } from '@wagmi/vue';
import { useConnect, useAccount } from '@wagmi/vue';
import WalletSVG from '~/assets/images/wallet.svg';

const { isConnecting } = useAccount();
const { connect, connectors } = useConnect();

const connectorName = ref('');

function connectWallet(connector: Connector<CreateConnectorFn>) {
  connectorName.value = connector.name;
  connect({ connector });
}
</script>

<template>
  <div class="max-w-md w-full md:px-6 my-12 mx-auto">
    <img :src="WalletSVG" class="mx-auto" width="241" height="240" alt="wallet" />

    <div class="my-8 text-center">
      <h3 class="mb-6">Choose wallet</h3>
      <p>
        To join this NFT airdrop, you need to connect your EVM compatible wallet. This step is crucial for securely
        receiving and managing the airdropped NFTs.
      </p>
    </div>

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
          <NuxtIcon :name="connector.type" class="text-xl" filled />
          <span>{{ connector.name }}</span>
        </span>
      </Btn>
    </n-space>
  </div>
</template>
