import { defineStore } from 'pinia';
import { WebStorageKeys } from '~/lib/values/general.values';

export const useUserStore = defineStore('user', {
  state: () => ({
    balance: 0,
    loading: false,
    statistics: {} as StatisticsInterface,
    users: [] as UserInterface[],
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
  },

  actions: {},

  persist: {
    key: WebStorageKeys.USER,
    storage: persistedState.sessionStorage,
    pick: ['balance', 'users', 'statistics'],
  },
});
