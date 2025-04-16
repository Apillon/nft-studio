import { useUserStore } from '~/stores/user';

export default defineNuxtPlugin(() => {
  const authStore = useAuthStore();
  if (authStore.jwt) {
    $api.setToken(authStore.jwt);
  } else {
    authStore.logout();
  }
});
