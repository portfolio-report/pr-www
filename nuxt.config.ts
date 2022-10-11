export default defineNuxtConfig({
  build: {
    transpile: [
      'primevue',
      'chart.js',
      //
    ],
  },

  typescript: {
    typeCheck: true,
    strict: true,
  },

  css: [
    'primevue/resources/themes/lara-light-blue/theme.css',
    'primevue/resources/primevue.css',
    'primeflex/primeflex.css',
    'primeicons/primeicons.css',
    '~/assets/styles/main.scss',
  ],

  modules: [
    '@unocss/nuxt',
    //
  ],

  unocss: {
    uno: false, // disable `@unocss/preset-uno`
    icons: true, // enable `@unocss/preset-icons`
  },

  runtimeConfig: {
    public: {
      gitSha: process.env.GITHUB_SHA,
      baseUrl: process.env.API_URL || 'https://api.portfolio-report.net/',
    },
  },

  nitro: {
    prerender: {
      ignore: ['/stats'],
    },
  },
})
