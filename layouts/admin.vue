<template>
  <v-app>
    <v-navigation-drawer v-model="leftDrawerOpen" fixed app>
      <v-list>
        <v-list-item router to="/admin/" exact>
          <v-list-item-action> <v-icon>mdi-home</v-icon> </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item router to="/admin/securities" exact>
          <v-list-item-action>
            <v-icon>mdi-currency-usd</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Securities</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item router to="/admin/backup" exact>
          <v-list-item-action>
            <v-icon>mdi-backup-restore</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Backup & Restore</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item router to="/" exact>
          <v-list-item-action> <v-icon>mdi-earth</v-icon> </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Public site</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item router to="/stats" exact>
          <v-list-item-action> <v-icon>mdi-poll</v-icon> </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Statistics</v-list-item-title>
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

<script>
import { mapGetters } from 'vuex'

export default {
  middleware: 'auth',
  data() {
    return {
      title: 'Portfolio Report Admin',
      leftDrawerOpen: false,
    }
  },
  computed: {
    ...mapGetters({
      authenticated: 'auth/isAuthenticated',
      username: 'auth/username',
    }),
  },
  methods: {
    logout() {
      this.$store.dispatch('auth/logout')
      this.$router.push({
        path: '/admin/login',
      })
    },
  },
}
</script>
