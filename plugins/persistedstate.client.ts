// https://prazdevs.github.io/pinia-plugin-persistedstate/frameworks/nuxt-3.html

import { createPersistedState } from 'pinia-plugin-persistedstate'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.$pinia.use(createPersistedState())
})
