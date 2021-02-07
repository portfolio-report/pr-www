<template>
  <v-app>
    <v-navigation-drawer
      v-if="authenticated"
      v-model="leftDrawerOpen"
      fixed
      app
    >
      <v-list>
        <v-list-item
          v-for="menuItem in menuItems"
          :key="menuItem.name"
          router
          :to="menuItem.to"
          exact
        >
          <v-list-item-action>
            <v-icon>{{ menuItem.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ menuItem.name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar fixed app>
      <v-app-bar-nav-icon
        v-if="authenticated"
        @click="leftDrawerOpen = !leftDrawerOpen"
      />
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
      <v-spacer />
      <v-btn v-if="!authenticated" to="/login" text>Log in</v-btn>
      <v-menu v-if="authenticated" open-on-hover bottom offset-y>
        <template #activator="{ on }">
          <v-btn color="primary" text v-on="on">
            <v-icon>{{ mdiAccount }}</v-icon>
            {{ username }}
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="logout">
            <v-list-item-avatar>
              <v-icon>{{ mdiLogoutVariant }}</v-icon>
            </v-list-item-avatar>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
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
import { Component, Vue, mixins } from 'nuxt-property-decorator'

import { IconsMixin } from '@/components/icons-mixin'

@Component
export default class DefaultLayout extends mixins(Vue, IconsMixin) {
  leftDrawerOpen = false

  get menuItems() {
    return [
      { name: 'Home', icon: this.mdiHome, to: '/' },
      { name: 'Statistics', icon: this.mdiPoll, to: '/stats' },
      {
        name: 'Securities',
        icon: this.mdiCurrencyUsd,
        to: '/admin/securities',
      },
      {
        name: 'Taxonomies',
        icon: this.mdiFamilyTree,
        to: '/admin/taxonomies',
      },
      {
        name: 'Statistics (admin)',
        icon: this.mdiPoll,
        to: '/admin/stats',
      },
    ]
  }

  get authenticated() {
    return this.$store.getters['auth/isAuthenticated']
  }

  get username() {
    return this.$store.getters['auth/username']
  }

  logout() {
    this.$store.dispatch('auth/logout')
    this.$router.push({
      path: '/',
    })
  }

  title = 'Portfolio Report'
}
</script>

<style scoped>
.title {
  color: inherit;
  text-decoration: inherit;
}
</style>
