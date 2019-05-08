<template>
  <v-app>
    <v-navigation-drawer v-model="leftDrawerOpen" fixed app>
      <v-list>
        <v-list-tile router to="/admin/" exact>
          <v-list-tile-action> <v-icon>home</v-icon> </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Home</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile router to="/" exact>
          <v-list-tile-action> <v-icon>public</v-icon> </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Public site</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile router to="/stats" exact>
          <v-list-tile-action> <v-icon>bar_chart</v-icon> </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Statistics</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar fixed app>
      <v-toolbar-side-icon @click="leftDrawerOpen = !leftDrawerOpen" />
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <v-toolbar-items>
        <v-menu open-on-hover bottom offset-y>
          <template v-slot:activator="{ on }">
            <v-btn color="primary" flat v-on="on">
              {{ username }}
            </v-btn>
          </template>
          <v-list>
            <v-list-tile @click="logout">
              <v-list-tile-title>Logout</v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu>
      </v-toolbar-items>
    </v-toolbar>
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
      leftDrawerOpen: false
    }
  },
  computed: {
    ...mapGetters({
      authenticated: 'auth/isAuthenticated',
      username: 'auth/username'
    })
  },
  methods: {
    logout() {
      this.$store.dispatch('auth/logout')
      this.$router.push({
        path: '/admin/login'
      })
    }
  }
}
</script>
