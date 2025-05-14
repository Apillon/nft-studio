import type { Events } from '@apillon/wallet-sdk';
import type { Config } from '@wagmi/vue';
import type { Address } from 'viem';
import { signMessage } from '@wagmi/vue/actions';
import { isErc6492Signature } from 'viem';
import { useAccount as useAccountEW, useWallet } from '@apillon/wallet-vue';
import { useAccount, useChainId, useChains, useDisconnect, useSwitchChain } from '@wagmi/vue';

export default function useWalletConnect() {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();
  const { handleError } = useErrors();

  /** Apillon Embedded wallet */
  const { info } = useAccountEW();
  const { signMessage: signEW, wallet } = useWallet();

  /** Wagmi */
  const chains = useChains();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { $wagmiConfig } = useNuxtApp();

  const loading = ref<boolean>(false);
  const modalWalletVisible = ref<boolean>(false);

  const network = computed(() => chains.value.find(c => c.id === config.public.CHAIN_ID));
  const connected = computed(() => isConnected.value || !!info.activeWallet?.address);
  const walletAddress = computed<Address>(() =>
    isConnected.value ? (address.value as Address) : (info.activeWallet?.address as Address)
  );
  const isLoggedIn = computed(() => connected.value && authStore.loggedIn);

  const sign = async (message: string) => {
    return isConnected.value
      ? await signMessage($wagmiConfig as Config, { message })
      : await signEW(message);
  };

  async function ensureCorrectNetwork() {
    if (chainId?.value !== config.public.CHAIN_ID) {
      await switchChain({ chainId: config.public.CHAIN_ID });
    }
    return true;
  }

  async function login(admin = false) {
    if (loading.value || authStore.loggedIn || !admin) return;

    loading.value = true;
    try {
      const timestamp = new Date().getTime();
      const signature = await sign(`test\n${timestamp}`);

      const { data } = await $api.post<LoginResponse>('/login', {
        signature,
        timestamp,
        address: walletAddress.value,
        isSmart: isErc6492Signature(signature as `0x${string}`),
      });
      authStore.login(data);

      modalWalletVisible.value = false;
    } catch (e) {
      handleError(e);
      disconnectWallet();
    }
    loading.value = false;
  }

  function disconnectWallet() {
    authStore.logout();
    if (isConnected.value) {
      disconnect();
    } else if (wallet.value && info.activeWallet?.address) {
      wallet.value?.events.emit('disconnect');
    }
  }

  async function initEmbeddedWallet(admin: boolean = false) {
    await sleep(1000);

    if (wallet.value && config.public.EMBEDDED_WALLET_CLIENT) {
      wallet.value?.events.on('connect', () => {
        login(admin);
      });
      wallet.value?.events.on('accountsChanged', async (accounts: Events['accountsChanged']) => {
        if (accounts.length) {
          login(admin);
        }
      });
      wallet.value?.events.on('dataUpdated', ({ name, newValue }) => {
        if (name === 'wallets') {
          login(admin);
        }
      });
      wallet.value?.events.on('disconnect', () => {
        disconnectWallet();
      });
    }
  }

  return {
    connected,
    isLoggedIn,
    loading,
    modalWalletVisible,
    network,
    walletAddress,
    disconnectWallet,
    ensureCorrectNetwork,
    initEmbeddedWallet,
    login,
    sign,
  };
}
