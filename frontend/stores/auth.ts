import { defineStore } from 'pinia';
import { WebStorageKeys } from '~/lib/values/general.values';

export const useAuthStore = defineStore('auth', {
  state: () => ({ jwt: '', userId: 0, username: '' }),

  getters: {
    loggedIn(state) {
      return !!state.jwt;
    },
  },

  actions: {
    login(data: { jwt: string }) {
      if (data.jwt) {
        this.jwt = data.jwt;
        $api.setToken(data.jwt);
      }
    },
    logout() {
      $api.clearToken();
      this.$reset();
    },
  },
  persist: {
    key: WebStorageKeys.AUTH,
    storage: piniaPluginPersistedstate.localStorage(),
    pick: ['jwt', 'userId', 'username'],
  },
});
