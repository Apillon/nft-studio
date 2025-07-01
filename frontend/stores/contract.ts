import { defineStore } from 'pinia';
import { WebStorageKeys } from '~/lib/values/general.values';

export const useContractStore = defineStore('contract', {
  state: () => ({
    autoIncrement: null as null | boolean,
    balance: 0n,
    name: '',
    maxSupply: 0,
    totalSupply: 0,
  }),

  getters: {},
  actions: {},
  persist: {
    key: WebStorageKeys.CONTRACT,
    storage: piniaPluginPersistedstate.localStorage(),
  },
});
