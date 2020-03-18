<template>
  <v-app>
    <v-app-bar fixed app>
      <nuxt-link to="/">
        <v-img
          class="mx-2"
          src="/favicon-192.png"
          max-height="50"
          max-width="50"
          contain
          to="/"
        />
      </nuxt-link>
      <nuxt-link to="/" class="title">
        <v-toolbar-title v-text="title" />
      </nuxt-link>
    </v-app-bar>
    <v-content>
      <v-container>
        <nuxt />
      </v-container>
    </v-content>
  </v-app>
</template>

<style scoped>
.title {
  color: inherit;
  text-decoration: inherit;
}
</style>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class DefaultLayout extends Vue {
  title = 'Portfolio Report'
}
</script>
