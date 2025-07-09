import { ClaimType } from '~/lib/values/general.values';

export default function useScreen() {
  const config = useRuntimeConfig();
  const breakpoints = useBreakpoints({
    xs: 400,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1440,
    hd: 1920,
  });

  const claimTypeName =
    config.public.CLAIM_TYPE === ClaimType.FREE_MINT
      ? 'NFT Wild West'
      : config.public.CLAIM_TYPE === ClaimType.POAP
        ? 'NFT Event Edition'
        : 'NFT Brand Booster';

  return {
    claimTypeName,
    breakpoints,

    /**
     * Above 400px
     */
    isXs: breakpoints.greaterOrEqual('xs'),

    /**
     * Above 640px
     */
    isSm: breakpoints.greaterOrEqual('sm'),

    /**
     * Above 768px
     */
    isMd: breakpoints.greaterOrEqual('md'),

    /**
     * Above 1024px
     */
    isLg: breakpoints.greaterOrEqual('lg'),

    /**
     * Above 1440px
     */
    isXl: breakpoints.greaterOrEqual('xl'),

    /**
     * Above 1920px
     */
    isHd: breakpoints.greaterOrEqual('hd'),
  };
}
