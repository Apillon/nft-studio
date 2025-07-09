import { useAccount, useWallet } from '@apillon/wallet-vue';
import { useConnectorClient } from '@wagmi/vue';
import { useMessage } from 'naive-ui';
import type { Address } from 'viem';
import { createPublicClient, getContract, http, maxUint32 } from 'viem';
import { abi } from '~/lib/config/abi';

const contract = ref();
const nftImported = ref<boolean | null>(null);

export default function useClaim() {
  const message = useMessage();
  const config = useRuntimeConfig();
  const contractStore = useContractStore();

  const { wallet } = useWallet();
  const { parseLink } = useIpns();
  const { network, walletAddress, ensureCorrectNetwork } = useWalletConnect();

  const { info } = useAccount();
  const { data: walletClient, refetch } = useConnectorClient();
  const publicClient = createPublicClient({ chain: network.value, transport: http() });

  const contractAddress = config.public.CONTRACT_ADDRESS as Address;

  /**
   * Read contract
   */
  async function initContract() {
    if (contract.value) return;

    await ensureCorrectNetwork();
    contract.value = getContract({
      address: contractAddress,
      abi,
      client: {
        public: publicClient,
      },
    });
  }

  async function getBalance(): Promise<bigint> {
    if (!contractStore.balance) {
      await initContract();
      contractStore.balance = await contract.value.read.balanceOf([walletAddress.value]);
    }
    return contractStore.balance;
  }

  async function getMaxSupply(): Promise<number> {
    if (!contractStore.maxSupply) {
      await initContract();
      const max = await contract.value.read.maxSupply([]);
      contractStore.maxSupply = max >= maxUint32 ? Number.MAX_SAFE_INTEGER : Number(max);
    }
    return contractStore.maxSupply;
  }
  async function getName(): Promise<string> {
    if (!contractStore.name) {
      await initContract();
      contractStore.name = await contract.value.read.name([]);
    }
    return contractStore.name;
  }

  async function getTokenOfOwner(index: number) {
    await initContract();
    return await contract.value.read.tokenOfOwnerByIndex([walletAddress.value, index]);
  }

  async function getTokenUri(id: number): Promise<string> {
    await initContract();
    const uri = await contract.value.read.tokenURI([id]);
    return await parseLink(uri);
  }
  async function getTotalSupply(): Promise<number> {
    if (!contractStore.totalSupply) {
      await initContract();
      const max = await contract.value.read.totalSupply([]);
      contractStore.totalSupply = max >= maxUint32 ? Number.MAX_SAFE_INTEGER : Number(max);
    }
    return contractStore.totalSupply;
  }

  async function isAutoIncrement(): Promise<boolean> {
    if (contractStore.autoIncrement === null) {
      await initContract();
      contractStore.autoIncrement = await contract.value.read.isAutoIncrement([]);
    }
    return contractStore.autoIncrement || true;
  }

  /** Actions */
  async function loadNft(nftId?: string | number) {
    try {
      if (!nftId) {
        const balance = await getBalance();
        if (Number(balance) === 0) return null;
      } else {
        const totalSupply = await getTotalSupply();
        if (totalSupply === 0) return null;
      }

      const id = nftId || (await getTokenOfOwner(0));
      const url = await getTokenUri(Number(id));
      const parsedUrl = await parseLink(url);

      const metadata = await fetch(parsedUrl).then(response => {
        return response.json();
      });
      return { id, ...metadata };
    } catch (e) {
      console.error('Error loading NFT:', e);
    }
    return null;
  }

  async function addNftId(metadata: Metadata): Promise<boolean> {
    await ensureCorrectNetwork();
    let success: any = false;
    const image = await parseLink(metadata?.image || '');
    contractStore.totalSupply += 1;

    try {
      if (!metadata?.id) {
        console.warn('Missing NFT ID!');
      } else if (wallet.value && info.activeWallet?.address) {
        success = wallet.value?.events.emit('addTokenNft', {
          address: contractAddress,
          tokenId: Number(metadata.id),
          imageUrl: image,
          name: metadata.name || '',
        });
      } else {
        if (!walletClient.value) {
          await refetch();
          await sleep(200);
        }
        // Use the Ethereum provider to watch the NFT asset
        // TS-ignore
        success = await walletClient.value?.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC721',
            options: {
              address: contractAddress,
              tokenId: `${metadata.id}`,
              image,
            },
          },
        } as any);
      }
      nftImported.value = !!success;
    } catch (e) {
      console.error('Error importing NFT:', e);
      message.info('If you want to import NFT to wallet, paste contract address and token ID into your wallet.');
    }

    return success;
  }

  function contractError(e: any, showError = true) {
    console.error('Use contracts error', e.code, e);

    // ignore user declined
    const errorData = e?.reason || e?.data?.message || e?.error?.data?.message || e?.error?.message || e?.message || '';
    let msg = '';

    if (errorData.includes('insufficient funds')) {
      // Insufficient funds
      msg = 'Wallet account does not have enough funds.';
    } else if (errorData.includes('Purchase would exceed max supply')) {
      // Max supply exceeded
      msg = 'Tokens depleted. You have requested too many or there is no more supply.';
    } else if (errorData.includes('Wallet already used')) {
      // Wallet already used
      msg = 'Wallet already used. This token has a limit of mints per wallet.';
    } else if (errorData.includes('Only WL addresses allowed.')) {
      // Wallet not whitelisted
      msg = 'Wallet not on whitelist. Only whitelisted wallet addresses are currently permitted.';
    } else if (errorData.includes('transfer caller is not owner nor approved')) {
      // Wallet not approved to use functionality
      msg = 'Wallet has not been approved to use this functionality.';
    } else if (errorData.includes('Character with these traits already minted')) {
      // Character already minted
      msg = 'A character with selected traits has already been minted.';
    } else if (errorData.includes('valid recovery code')) {
      // Problem with embedded signature
      msg = 'Problem with embedded wallet';
    } else if (errorData.includes('Suggested NFT is not owned by the selected account ')) {
      msg = 'Suggested NFT is not owned by the selected account, please try again with other wallet.';
    } else if (errorData.includes('user rejected transaction') || errorData.includes('User rejected the request')) {
      // User rejected the transaction
      msg = 'Transaction was rejected.';
    } else {
      // Blockchain communication error
      msg = 'Blockchain error. Please retry or contact support if the issue persists.';
    }

    if (showError) {
      message.error(msg);
    } else {
      return msg;
    }
  }

  return {
    contract,
    nftImported,
    addNftId,
    contractError,
    getMaxSupply,
    getTotalSupply,
    getName,
    isAutoIncrement,
    loadNft,
  };
}
