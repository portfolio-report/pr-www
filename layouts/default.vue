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
    <v-footer>
      <v-spacer />
      <v-tooltip top>
        <template #activator="{ on }">
          <v-btn
            href="https://forum.portfolio-performance.info/"
            icon
            v-on="on"
          >
            <v-icon>{{ mdiForum }}</v-icon>
          </v-btn>
        </template>
        <span>Get help and discuss</span>
      </v-tooltip>
      <v-tooltip top>
        <template #activator="{ on }">
          <v-btn to="/contact" icon v-on="on">
            <v-icon>{{ mdiEmail }}</v-icon>
          </v-btn>
        </template>
        <span>Get in contact</span>
      </v-tooltip>
      <v-tooltip top>
        <template #activator="{ on }">
          <v-btn
            href="https://www.github.com/tfabritius/pr-www"
            target="_blank"
            icon
            v-on="on"
          >
            <v-icon>{{ mdiSourceRepository }}</v-icon>
          </v-btn>
        </template>
        <span>Source code</span>
      </v-tooltip>
      <v-spacer></v-spacer>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { mdiEmail, mdiForum, mdiSourceRepository } from '@mdi/js'

@Component
export default class DefaultLayout extends Vue {
  title = 'Portfolio Report'

  mdiForum = mdiForum
  mdiEmail = mdiEmail
  mdiSourceRepository = mdiSourceRepository
}
</script>

<style scoped>
.title {
  color: inherit;
  text-decoration: inherit;
}
</style>
