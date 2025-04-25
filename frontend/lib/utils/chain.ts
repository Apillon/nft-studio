import { astar, moonbaseAlpha, moonbeam } from 'viem/chains';

export function contractLink(contractAddress?: string | null, chainId?: number): string {
  return contractAddress ? `${chainRpc(chainId)}address/${contractAddress}` : '';
}

export function transactionLink(transactionHash?: string | null, chainId?: number): string {
  return !transactionHash ? '' : `${chainRpc(chainId)}tx/${transactionHash}`;
}
export function chainRpc(chainId?: number): string {
  switch (chainId) {
    case moonbeam.id:
      return `https://moonbeam.moonscan.io/`;

    case moonbaseAlpha.id:
      return `https://moonbase.moonscan.io/`;

    case astar.id:
      return `https://moonbase.moonscan.io/`;

    default:
      console.warn('Missing chainId');
      return '';
  }
}
