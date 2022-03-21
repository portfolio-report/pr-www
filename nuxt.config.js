const colors = require('vuetify/es5/util/colors').default
const pkg = require('./package')

const cspConnect = ["'self'"]
if (process.env.API_URL) {
  const url = new URL(process.env.API_URL)
  cspConnect.push(url.hostname + (url.port ? ':' + url.port : ''))
}

module.exports = {
  target: 'static',

  /*
   ** Headers of the page
   */
  head: {
    title: 'Portfolio Report',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '180x180',
        href: '/favicon-180.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '192x192',
        href: '/favicon-192.png',
      },
    ],
  },

  generate: {
    exclude: [/^\/admin/, '/stats'],
  },

  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },

  /*
   ** Global CSS
   */
  css: ['@fontsource/roboto'],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [{ src: '~/plugins/chartjs.js', ssr: false }],

  /*
   ** Options for rendering pages
   */
  render: {},

  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    '@nuxtjs/vuetify',
    '@nuxt/typescript-build',
    '@nuxtjs/composition-api/module',
  ],
  /*
   ** Nuxt.js modules
   */
  modules: ['@nuxtjs/axios', '@nuxtjs/auth-next'],

  axios: {
    baseURL: 'https://api.portfolio-report.net/', // Used as fallback if no runtime config is provided
  },

  env: {
    gitSha: process.env.GITHUB_SHA,
  },

  publicRuntimeConfig: {
    axios: {
      browserBaseURL: process.env.API_URL,
    },
  },

  privateRuntimeConfig: {
    axios: {
      baseURL: process.env.API_URL,
    },
  },

  auth: {
    strategies: {
      local: {
        endpoints: {
          login: { url: '/auth/login', method: 'post', property: 'token' },
          logout: { url: '/auth/logout', method: 'post' },
          user: { url: '/auth/users/me', method: 'get' },
        },
        user: {
          property: false,
          autoFetch: true,
        },
        token: {
          property: 'token',
          required: true,
          type: 'Bearer',
        },
      },
    },
  },

  /*
   ** vuetify module configuration
   ** https://github.com/nuxt-community/vuetify-module
   */
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    defaultAssets: { icons: false, font: false },
    icons: {
      iconfont: 'mdiSvg',
    },
    treeShake: true,
    theme: {
      dark: false,
      themes: {
        light: {
          primary: '#006e90', // colors.blue.darken2
          accent: colors.grey.darken3,
          secondary: '#f18f01', // colors.amber.darken3
          info: '#006e90', // colors.teal.lighten1
          warning: '#f18f01', // colors.amber.base
          error: colors.deepOrange.accent4,
          success: '#99C24D', // colors.green.accent3
        },
      },
    },
  },

  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    // extend(config, ctx) {},
  },

  /*
   ** Express middleware
   */
  serverMiddleware: [],

  /**
   * Watch files/folders for changes (and restart server)
   */
  watch: ['~/server'],
}
