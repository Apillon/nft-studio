import { http, createConfig, WagmiPlugin, createStorage } from '@wagmi/vue';
import { mainnet, moonbeam, moonbaseAlpha } from '@wagmi/vue/chains';
import { type Chain } from '@wagmi/vue/chains';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { metaMask, coinbaseWallet, walletConnect } from '@wagmi/vue/connectors';

export default defineNuxtPlugin(nuxtApp => {
  const config = useRuntimeConfig();
  const chains: readonly [Chain, ...Chain[]] = [mainnet, moonbeam, moonbaseAlpha];

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
    transports: {
      [mainnet.id]: http(),
      [moonbaseAlpha.id]: http(),
      [moonbeam.id]: http(),
    },
  });
  const queryClient = new QueryClient();

  nuxtApp.provide('wagmiConfig', wagmiConfig);
  nuxtApp.vueApp.use(WagmiPlugin, { config: wagmiConfig });
  nuxtApp.vueApp.use(VueQueryPlugin, { queryClient });
});
