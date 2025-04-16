import { defineStore } from 'pinia';
import { WebStorageKeys } from '~/lib/values/general.values';

export const useUserStore = defineStore('user', {
  state: () => ({
    statistics: {} as StatisticsInterface,
    users: [] as UserInterface[],
  }),

  getters: {
    hasStatistics(state) {
      return !!state.statistics && Object.keys(state.statistics).length > 0;
    },
    hasUsers(state) {
      return !!state.users && state.users.length > 0;
    },
  },

  actions: {
    logout() {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(WebStorageKeys.USER);
      }

      $api.clearToken();
      this.$reset();
    },
  },

  persist: {
    key: WebStorageKeys.USER,
    storage: persistedState.sessionStorage,
    pick: ['users', 'statistics'],
  },
});
