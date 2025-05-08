import { ClaimType } from '~/lib/values/general.values';

/**
 * Use in page components:
    definePageMeta({
      middleware: 'poap',
    });
 */
export default defineNuxtRouteMiddleware(_ => {
  if (process?.server) {
    return;
  }

  const config = useRuntimeConfig();
  if (config.public.CLAIM_TYPE !== ClaimType.POAP) {
    return navigateTo('/');
  }
});
