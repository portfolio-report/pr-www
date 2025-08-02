import process from 'node:process'

export default defineNuxtConfig({
  devtools: { enabled: true },

  spaLoadingTemplate: 'spa-loading-template.html',

  typescript: {
    typeCheck: true,
    strict: true,
  },

  css: [
    '~/assets/styles/main.scss',
    '@fontsource/fira-mono',
    '@fontsource/fira-sans',
  ],

  modules: [
    '@unocss/nuxt',
    '@primevue/nuxt-module',
    //
  ],

  primevue: {
    importTheme: { from: '@/theme.ts' },
    directives: {
      include: ['Tooltip', 'Badge', 'StyleClass', 'Ripple'],
    },
  },

  runtimeConfig: {
    public: {
      baseUrl: process.env.API_URL || 'https://api.portfolio-report.net/',
    },
  },

  nitro: {
    prerender: {
      autoSubfolderIndex: false,
      failOnError: false,
      ignore: [
        '/securities',
      ],
    },
  },
})
