import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import mkcert from 'vite-plugin-mkcert';
import { moonbaseAlpha } from 'viem/chains';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { ClaimType, Environments } from './lib/values/general.values';

const meta = { title: 'NFT Studio', description: 'NFT Studio' };

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },

  devServer: {
    // https: {
    //   key: process.env.USERPROFILE + '\\.vite-plugin-mkcert\\cert.key',
    //   cert: process.env.USERPROFILE + '\\.vite-plugin-mkcert\\cert.crt',
    // },
  },

  runtimeConfig: {
    public: {
      API_BASE: 'http://localhost:3001',
      CHAIN_ID: moonbaseAlpha.id,
      CLAIM_START: 0,
      CLAIM_END: 0,
      CLAIM_TYPE: ClaimType.AIRDROP,
      COLLECTION_LOGO: '',
      CONTRACT_ADDRESS: '',
      EMBEDDED_WALLET_CLIENT: '',
      ENV: process.env.ENV || process.env.NODE_ENV || Environments.dev,
      WALLET_CONNECT_PROJECT: '',
    },
  },

  components: ['~/components/general', '~/components/parts'],

  imports: { dirs: ['composables/', 'stores/', 'lib/utils/**'] },

  modules: [
    '@nuxtjs/google-fonts',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'nuxt-icons',
    'pinia-plugin-persistedstate/nuxt',
  ],

  vite: {
    plugins: [
      AutoImport({
        imports: [{ 'naive-ui': ['useDialog', 'useMessage', 'useNotification', 'useLoadingBar'] }],
      }),

      Components({ resolvers: [NaiveUiResolver()] }),
      mkcert(),
      nodePolyfills(),
      {
        name: 'vite-plugin-glob-transform',
        transform(code: string, id: string) {
          if (id.includes('nuxt-icons')) {
            return code.replace(/as:\s*['"]raw['"]/g, 'query: "?raw", import: "default"');
          }
          return code;
        },
      },
    ],

    optimizeDeps: {
      include:
        // must use NODE_ENV (to build production version with dev config)
        process.env.NODE_ENV === Environments.dev ? ['naive-ui', 'vueuc'] : [],
    },
  },

  build: {
    transpile:
      // must use NODE_ENV (to build production version with dev config)
      process.env.NODE_ENV === Environments.prod
        ? ['naive-ui', 'vueuc', '@css-render/vue3-ssr', '@juggle/resize-observer']
        : ['@juggle/resize-observer'],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      bodyAttrs: { id: 'kalm' },
      title: meta.title,
      titleTemplate: ` %s - ${meta.title}`,
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no',
      meta: [
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'theme-color', content: '#070707' },
        { name: 'description', content: meta.description },
        { name: 'og:title', content: meta.title },
        { name: 'og:description', content: meta.description },
        { name: 'og:type', content: 'website' },
        { name: 'twitter:title', content: meta.title },
        { name: 'twitter:description', content: meta.description },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [{ rel: 'icon', type: 'image/png', href: '/images/favicon.png' }],
    },
  },

  googleFonts: {
    useStylesheet: true,
    display: 'swap',
    download: false,
    families: { Inter: { wght: [400, 600] } },
  },

  tailwindcss: { cssPath: '~/assets/styles/index.css' },

  compatibilityDate: '2025-04-11',
});
