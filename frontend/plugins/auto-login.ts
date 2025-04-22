import { useAuthStore } from '~/stores/auth';

export default defineNuxtPlugin(() => {
  const authStore = useAuthStore();
  if (authStore.jwt) {
    $api.setToken(authStore.jwt);
  } else {
    authStore.logout();
  }
});
