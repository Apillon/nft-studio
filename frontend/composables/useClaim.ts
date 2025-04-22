import { useWallet } from '@apillon/wallet-vue';
import { useChainId, useChains, useSwitchChain, useConnectorClient } from '@wagmi/vue';
import type { Address } from 'viem';
import { createPublicClient, getContract, http } from 'viem';
import { abi } from '~/lib/config/abi';

const contract = ref();

export default function useClaim() {
  const message = useMessage();
  const config = useRuntimeConfig();
  const { wallet } = useWallet();
  const { parseIpnsLink } = useIpns();
  const { walletAddress } = useWalletConnect();

  const chainId = useChainId();
  const chains = useChains();
  const { switchChain } = useSwitchChain();
  const { data: walletClient, refetch } = useConnectorClient();

  const chain = computed(() => chains.value.find(c => c.id === config.public.CHAIN_ID));
  const publicClient = createPublicClient({ chain: chain.value, transport: http() });

  const contractAddress = config.public.CONTRACT_ADDRESS as Address;

  async function ensureCorrectNetwork() {
    if (chainId?.value !== config.public.CHAIN_ID) {
      await switchChain({ chainId: config.public.CHAIN_ID });
    }
    return true;
  }

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

  async function getTokenOfOwner(index: number) {
    await initContract();
    return (await contract.value.read.tokenOfOwnerByIndex([walletAddress.value, index])) as number;
  }

  async function getTokenUri(id: number) {
    await initContract();
    const uri = (await contract.value.read.tokenURI([id])) as string;
    return await parseIpnsLink(uri);
  }

  /** Actions */
  async function loadNft(nftId?: string | number) {
    const id = nftId || (await getTokenOfOwner(0));
    const url = await getTokenUri(Number(id));

    return await fetch(url).then(response => {
      return response.json();
    });
  }

  async function addNftId(nftId: string | number) {
    await ensureCorrectNetwork();

    if (wallet.value) {
      wallet.value?.events.emit('addTokenNft', {
        address: contractAddress,
        tokenId: Number(nftId),
      });
    } else {
      try {
        if (!walletClient.value) {
          await refetch();
          await sleep(200);
        }
        // Use the Ethereum provider to watch the NFT asset
        const success = await walletClient.value?.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC721',
            options: {
              address: contractAddress,
              tokenId: nftId.toString(),
            },
          },
        });

        if (success) {
          message.success('NFT successfully imported into the wallet!');
        } else {
          message.error('Failed to import NFT into the wallet.');
        }
      } catch (error) {
        console.error('Error importing NFT:', error);
        message.error('An error occurred while importing the NFT.');
      }
    }
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
    addNftId,
    contractError,
    loadNft,
  };
}
