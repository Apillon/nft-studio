export const colors = {
  transparent: 'transparent',
  current: 'currentColor',
  black: '#06080f',
  white: '#f5f5ee',
  pink: '#FF6188',
  green: '#A9DC76',
  blue: '#78DCE8',

  placeholder: '#313442a3', // rgba(49, 52, 66, 0.64)

  bg: {
    DEFAULT: '#f5f5ee',
    light: '#F0F2DA',
  },
  grey: {
    DEFAULT: '#9c9c95',
    transparent: 'rgba(153, 153, 153, 0.64)', // #99999a3
    dark: '#141721', // rgba(20, 23, 33, 1)
    darker: '#1e212b', // rgba(30, 33, 43, 1)
    darkerTransparent: 'rgba(30, 33, 43, 0.64)', // #1e212ba3
  },
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    `components/**/*.{vue,js}`,
    `layouts/**/*.vue`,
    `pages/**/*.vue`,
    `composables/**/*.{js,ts}`,
    `plugins/**/*.{js,ts}`,
    `App.{js,ts,vue}`,
    `app.{js,ts,vue}`,
  ],
  darkMode: 'class',
  theme: {
    screens: {
      mobile: { max: '767px' },
      tablet: { max: '1023px' },
      xs: '400px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1440px',
      hd: '1920px',
    },

    colors,

    fontFamily: {
      inter: ['Inter', 'ui-sans-serif', 'system-ui'],
      newSpirit: ['New Spirit', 'ui-sans-serif', 'system-ui'],
    },

    container: {
      center: true,
      screens: {
        lx: '1320px',
      },
      padding: {
        DEFAULT: '1rem',
      },
    },

    extend: {
      height: {
        17: '4.25rem',
        18: '4.5rem',
      },
      zIndex: {
        1: 1,
        2: 2,
        3: 3,
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
