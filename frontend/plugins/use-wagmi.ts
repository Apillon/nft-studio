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
  const transports = chains.reduce((acc: Record<number, ReturnType<typeof http>>, chain: Chain) => {
    acc[chain.id] = http();
    return acc;
  }, {});

  const walletConnectProject = config.public.WALLET_CONNECT_PROJECT;
  const connectors = walletConnectProject
    ? [
        metaMask({ dappMetadata: { name: 'NFT Studio - Metamask' } }),
        coinbaseWallet({ appName: 'NFT Studio - Coinbase' }),
        walletConnect({ projectId: config.public.WALLET_CONNECT_PROJECT }),
      ]
    : [
        metaMask({ dappMetadata: { name: 'NFT Studio - Metamask' } }),
        coinbaseWallet({ appName: 'NFT Studio - Coinbase' }),
      ];

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
