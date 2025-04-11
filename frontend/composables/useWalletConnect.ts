import { useAccount, useDisconnect, type Config } from '@wagmi/vue';
import { useAccount as useAccountEW, useWallet } from '@apillon/wallet-vue';
import { signMessage } from '@wagmi/vue/actions';
import { moonbeam, moonbaseAlpha } from '@wagmi/vue/chains';

export default function useWalletConnect() {
  const config = useRuntimeConfig();
  const userStore = useUserStore();
  const { handleError } = useErrors();

  /** Apillon Embedded wallet */
  const { info } = useAccountEW();
  const { signMessage: signEW } = useWallet();

  /** Wagmi */
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { $wagmiConfig } = useNuxtApp();

  const loading = ref<boolean>(false);
  const modalWalletVisible = ref<boolean>(false);
  const network = config.public.CHAIN_ID === moonbeam.id ? moonbeam : moonbaseAlpha;

  const connected = computed(() => isConnected.value || !!info.activeWallet?.address);
  const walletAddress = computed(() => (isConnected.value ? address.value : info.activeWallet?.address));

  const sign = async (message: string) => {
    return isConnected.value ? await signMessage($wagmiConfig as Config, { message }) : await signEW(message);
  };

  async function login(admin = false) {
    if (loading.value) return;
    if (!admin) return;

    loading.value = true;
    try {
      const timestamp = new Date().getTime();
      const message = `test\n${timestamp}`;

      const signature = await sign(message);

      const res = await $api.post<LoginResponse>('/login', {
        signature,
        timestamp,
        address: walletAddress.value,
      });
      if (res.data.jwt) {
        userStore.jwt = res.data.jwt;
        $api.setToken(res.data.jwt);
      }
      modalWalletVisible.value = false;
    } catch (e) {
      handleError(e);
    }
    loading.value = false;
  }

  function disconnectWallet() {
    userStore.jwt = '';
    disconnect();
  }

  return {
    loading,
    modalWalletVisible,
    network,
    connected,
    walletAddress,
    disconnectWallet,
    login,
    sign,
  };
}
