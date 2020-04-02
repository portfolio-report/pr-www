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
            <v-icon>mdi-account</v-icon>
            {{ username }}
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="logout">
            <v-list-item-avatar>
              <v-icon>mdi-logout-variant</v-icon>
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

@Component({ middleware: 'auth' })
export default class AdminLayout extends Vue {
  // middleware: 'auth',

  title = 'Portfolio Report Admin'
  leftDrawerOpen = false
  menuItems = [
    { name: 'Home', icon: 'mdi-home', to: '/admin/' },
    {
      name: 'Securities',
      icon: 'mdi-currency-usd',
      to: '/admin/securities',
    },
    {
      name: 'Client updates',
      icon: 'mdi-poll',
      to: '/admin/stats',
    },
    {
      name: 'Backup & Restore',
      icon: 'mdi-backup-restore',
      to: '/admin/backup',
    },
    { name: 'Public site', icon: 'mdi-earth', to: '/' },
    { name: 'Statistics', icon: 'mdi-poll', to: '/stats' },
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
