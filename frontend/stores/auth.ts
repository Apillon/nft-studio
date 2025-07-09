import { defineStore } from 'pinia';
import { WebStorageKeys } from '~/lib/values/general.values';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    jwt: '',
    userId: 0,
    username: '',
    smtpConfigured: null as boolean | null,
    smtpConfiguredAlert: true,
  }),

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

    async getConfig() {
      if (this.smtpConfigured === null) {
        await this.fetchConfig();
      }
      return this.smtpConfigured;
    },

    async fetchConfig() {
      try {
        const { data } = await $api.get<ConfigResponse>('/config');
        this.smtpConfigured = data.isCustomSmtp;
      } catch (error) {
        console.error(error);
      }
      return this.smtpConfigured;
    },
  },
  persist: {
    key: WebStorageKeys.AUTH,
    storage: piniaPluginPersistedstate.localStorage(),
    pick: ['jwt', 'userId', 'username', 'smtpConfiguredAlert'],
  },
});
