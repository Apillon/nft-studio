import type { LocationQueryValue } from 'vue-router';

export function shortHash(val: string) {
  if (!val || val.length <= 10) {
    return val;
  }
  return `${val.slice(0, 6)}...${val.slice(-4)}`;
}

export function removeLastSlash(val: string) {
  return val.replace(/\/$/, '');
}

export function getFixed(num: number | string, places = 2, round = false, roundToDecimals = false) {
  if (!num) {
    num = 0;
  }

  if (typeof num !== 'number') {
    num = parseFloat(num);
  }

  if (roundToDecimals) {
    num = Math.floor(num * 10 * Math.pow(10, places)) / (10 * Math.pow(10, places));
  } else if (round) {
    return Math.round(num);
  }

  if (!places) {
    places = 0;
  }

  return parseFloat(num.toFixed(places));
}

export const queryParam = (param: LocationQueryValue | LocationQueryValue[]) => {
  return Array.isArray(param) ? String(param.join()) : param ? String(param) : undefined;
};

export function stringifyQuery(query: Record<string, any>, prefix = ''): string {
  const queryString = Object.entries(query)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  return queryString.length > 1 ? prefix + queryString : '';
}
