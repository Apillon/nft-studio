import { useAuthStore } from '~/stores/auth';

/**
 * Use in page components:
    definePageMeta({
      middleware: 'authenticated',
    });
 */
export default defineNuxtRouteMiddleware(_to => {
  const authStore = useAuthStore();

  if (process?.server) {
    return;
  }

  if (!authStore.loggedIn) {
    return navigateTo('/');
  }
});
