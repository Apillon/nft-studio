import dayjs from 'dayjs';
import { Chains, PoapStatus } from '../values/general.values';

export function sleep(timeMs = 1000) {
  return new Promise(resolve => setTimeout(resolve, timeMs));
}

export function delay(fn: Function, delay = 500) {
  setTimeout(fn, delay);
}

export const placeholderPixel =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP88x8AAv0B/cfFKfIAAAAASUVORK5CYII=';

/**
 * min/max inclusive
 */
export function randomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getEncodedPathAndQuery(route: any) {
  const query = !route.query
    ? ''
    : Object.keys(route.query)
        .map(x => `${x}${route.query[x] ? `=${route.query[x]}` : ''}`)
        .join('&');

  return encodeURIComponent(`${route.path.replace(/\/+$/, '')}/?${query || ''}`);
}

export function getDecodedPathAndQuery(routeStr: string) {
  if (!routeStr || typeof routeStr !== 'string') {
    return '';
  }

  const parts = decodeURIComponent(routeStr).split('?');

  if (parts.length > 1 && !!parts[1]) {
    // Path + query
    const queryStrings = parts[1].split('&');
    const query = {} as any;
    queryStrings.forEach(x => {
      if (x) {
        const sides = x.split('=');
        if (sides.length > 1) {
          query[sides[0]] = sides[1];
        }
      }
    });
    return { path: parts[0], query };
  } else {
    // Just path
    return parts[0];
  }
}

export function areArraysEqual(a1: any, a2: any, sorted = false) {
  if (!a1 || !a2 || !Array.isArray(a1) || !Array.isArray(a2) || a1.length !== a2.length) {
    return false;
  }

  if (sorted) {
    a1 = [...a1].sort();
    a2 = [...a2].sort();
  }

  for (let i = 0; i < a1.length; i++) {
    if (a1[i] !== a2[i]) {
      return false;
    }
  }

  return true;
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
    case Chains.ASTAR:
      return 2;
    default:
      console.warn('Missing chainId');
      return 0;
  }
}
export function formatNumber(n: number) {
  return new Intl.NumberFormat('en-US').format(n);
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
