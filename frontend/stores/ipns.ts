import { defineStore } from 'pinia';
import { WebStorageKeys } from '~/lib/values/general.values';

export type IPNS = { link: string; token: string };

export const useIpnsStore = defineStore('ipns', {
  state: () => ({
    links: {} as Record<string, IPNS>,
  }),

  getters: {},

  actions: {
    hasIpns(ipns: string) {
      return ipns in this.links;
    },
  },

  persist: {
    key: WebStorageKeys.IPNS,
    storage: persistedState.localStorage,
    pick: ['links'],
  },
});
