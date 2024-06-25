import process from 'node:process'

export default defineNuxtConfig({
  devtools: { enabled: true },

  spaLoadingTemplate: 'spa-loading-template.html',

  build: {
    transpile: [
      'chart.js',
      //
    ],
  },

  typescript: {
    typeCheck: true,
    strict: true,
  },

  css: [
    '~/assets/styles/main.scss',
    '@fontsource/fira-mono',
    '@fontsource-variable/inter',
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

  unocss: {
    uno: true, // enable `@unocss/preset-uno`
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
      autoSubfolderIndex: false,
      failOnError: false,
      ignore: [
        '/stats',
      ],
    },
  },
})
