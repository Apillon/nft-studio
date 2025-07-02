import dayjs from 'dayjs';
import { Chains, PoapStatus } from '../values/general.values';

export function sleep(timeMs = 1000) {
  return new Promise(resolve => setTimeout(resolve, timeMs));
}

export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

/**
 * OG data
 */
export function prepareOG(
  title = 'NFT Brand Booster',
  description = 'Send NFTs via email or wallet. Build a whitelist, reward the most loyal users, grow your email list in exchange for rewards, or hand-pick who gets the drop.',
  image = '/images/logo/apillon.jpg',
  url = 'https://apillon.io/'
) {
  return {
    title,
    ogTitle: title,
    twitterTitle: title,
    description,
    ogDescription: description,
    twitterDescription: description,
    ogImage: image,
    twitterImage: image,
    ogUrl: url,
  };
}

export function mintPrice(chainId?: number): number {
  switch (chainId) {
    case Chains.MOONBEAM:
      return 4;
    case Chains.MOONBASE:
      return 0;
    default:
      console.warn('Missing chainId');
      return 2;
  }
}

export function getPoapStatus(start?: string | number, end?: string | number) {
  if (!start && !end) return PoapStatus.IN_PROGRESS;

  const currDate = dayjs(new Date());
  const startTime = dayjs(start);
  const endTime = dayjs(end);

  if (!endTime) {
    return currDate >= startTime ? PoapStatus.IN_PROGRESS : PoapStatus.WAITING;
  } else if (!startTime) {
    return currDate > endTime ? PoapStatus.FINISHED : PoapStatus.IN_PROGRESS;
  }

  return currDate >= startTime && currDate > endTime
    ? PoapStatus.FINISHED
    : currDate >= startTime
      ? PoapStatus.IN_PROGRESS
      : PoapStatus.WAITING;
}
