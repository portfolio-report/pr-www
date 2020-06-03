<template>
  <v-app>
    <v-navigation-drawer v-model="leftDrawerOpen" fixed app>
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
      <v-app-bar-nav-icon @click="leftDrawerOpen = !leftDrawerOpen" />
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <v-menu open-on-hover bottom offset-y>
        <template v-slot:activator="{ on }">
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
    <v-content>
      <v-container>
        <nuxt />
      </v-container>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import {
  mdiAccount,
  mdiBackupRestore,
  mdiCurrencyUsd,
  mdiEarth,
  mdiHome,
  mdiLogoutVariant,
  mdiPoll,
} from '@mdi/js'

@Component({ middleware: 'auth' })
export default class AdminLayout extends Vue {
  // middleware: 'auth',
  mdiAccount = mdiAccount
  mdiLogoutVariant = mdiLogoutVariant

  title = 'Portfolio Report Admin'
  leftDrawerOpen = false
  menuItems = [
    { name: 'Home', icon: mdiHome, to: '/admin/' },
    {
      name: 'Securities',
      icon: mdiCurrencyUsd,
      to: '/admin/securities',
    },
    {
      name: 'Client updates',
      icon: mdiPoll,
      to: '/admin/stats',
    },
    {
      name: 'Backup & Restore',
      icon: mdiBackupRestore,
      to: '/admin/backup',
    },
    { name: 'Public site', icon: mdiEarth, to: '/' },
    { name: 'Statistics', icon: mdiPoll, to: '/stats' },
  ]

  get authenticated() {
    return this.$store.getters['auth/isAuthenticated']
  }

  get username() {
    return this.$store.getters['auth/username']
  }

  logout() {
    this.$store.dispatch('auth/logout')
    this.$router.push({
      path: '/admin/login',
    })
  }
}
</script>
