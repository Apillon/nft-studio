import { defineStore } from 'pinia';
import { WebStorageKeys } from '~/lib/values/general.values';

export const useContractStore = defineStore('conract', {
  state: () => ({
    autoIncrement: null as null | boolean,
    balance: 0n,
    name: '',
    maxSupply: 0,
  }),

  getters: {},
  actions: {},
  persist: {
    key: WebStorageKeys.CONTRACT,
    storage: persistedState.localStorage,
  },
});
