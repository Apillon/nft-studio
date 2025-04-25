import { http, createConfig, WagmiPlugin, createStorage } from '@wagmi/vue';
import { moonbeam, moonbaseAlpha } from '@wagmi/vue/chains';
import { type Chain } from '@wagmi/vue/chains';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { metaMask, coinbaseWallet, walletConnect } from '@wagmi/vue/connectors';

export default defineNuxtPlugin(nuxtApp => {
  const config = useRuntimeConfig();
  const chains: readonly [Chain, ...Chain[]] = [moonbeam, moonbaseAlpha];

  const transports = chains.reduce((acc, chain) => {
    acc[chain.id] = http();
    return acc;
  }, {});

  const connectors = [
    metaMask({
      dappMetadata: {
        name: 'LendeeFi Metamask wallet',
      },
    }),
    coinbaseWallet({
      appName: 'Apillon Prebuild solution',
    }),
  ];
  if (config.public.WALLET_CONNECT_PROJECT) {
    connectors.push(walletConnect({ projectId: config.public.WALLET_CONNECT_PROJECT }));
  }

  const wagmiConfig = createConfig({
    chains,
    connectors,
    multiInjectedProviderDiscovery: false,
    storage: createStorage({ storage: window.sessionStorage }),
    transports,
  });
  nuxtApp.provide('wagmiConfig', wagmiConfig);
  nuxtApp.vueApp.use(WagmiPlugin, { config: wagmiConfig });
  nuxtApp.vueApp.use(VueQueryPlugin);
});