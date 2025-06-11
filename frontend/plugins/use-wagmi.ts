import { http, createConfig, WagmiPlugin, createStorage } from '@wagmi/vue';
import { type Chain } from '@wagmi/vue/chains';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { metaMask, coinbaseWallet, walletConnect } from '@wagmi/vue/connectors';
import {
  arbitrum,
  arbitrumSepolia,
  astar,
  avalanche,
  avalancheFuji,
  base,
  baseSepolia,
  celo,
  celoAlfajores,
  mainnet,
  moonbaseAlpha,
  moonbeam,
  optimism,
  optimismSepolia,
  polygon,
  polygonAmoy,
  sepolia,
} from 'viem/chains';

export default defineNuxtPlugin(nuxtApp => {
  const config = useRuntimeConfig();
  const chains: readonly [Chain, ...Chain[]] = [
    arbitrum,
    arbitrumSepolia,
    astar,
    avalanche,
    avalancheFuji,
    base,
    baseSepolia,
    celo,
    celoAlfajores,
    mainnet,
    moonbaseAlpha,
    moonbeam,
    optimism,
    optimismSepolia,
    polygon,
    polygonAmoy,
    sepolia,
  ];
  const transports = chains.reduce((acc: Transport, chain) => {
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
  const queryClient = new QueryClient();

  nuxtApp.provide('wagmiConfig', wagmiConfig);
  nuxtApp.vueApp.use(WagmiPlugin, { config: wagmiConfig });
  nuxtApp.vueApp.use(VueQueryPlugin, { queryClient });
});
