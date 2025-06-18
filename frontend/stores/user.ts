import { defineStore } from 'pinia';
import { AirdropStatus, WebStorageKeys } from '~/lib/values/general.values';

export const useUserStore = defineStore('user', {
  state: () => ({
    balance: 0,
    loading: false,
    statistics: {} as StatisticsInterface,
    users: [] as UserInterface[],
    promises: {
      users: null as Promise<any> | null,
      statistics: null as Promise<any> | null,
    },
  }),

  getters: {
    hasBalance(state) {
      return state.balance > 0;
    },
    hasStatistics(state) {
      return !!state.statistics && Object.keys(state.statistics).length > 0;
    },
    hasUsers(state) {
      return !!state.users && state.users.length > 0;
    },
    hasPending(state) {
      return state.users.some(u => u.email && u.airdrop_status === AirdropStatus.PENDING);
    },
  },

  actions: {},

  persist: {
    key: WebStorageKeys.USER,
    storage: piniaPluginPersistedstate.sessionStorage(),
    pick: ['balance', 'users', 'statistics'],
  },
});
