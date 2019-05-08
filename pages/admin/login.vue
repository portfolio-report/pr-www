<template>
  <v-layout justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-card class="elevation-12">
        <v-toolbar dark color="primary">
          <v-toolbar-title>Login</v-toolbar-title>
        </v-toolbar>
        <v-form @submit.prevent="login">
          <v-card-text v-if="authenticated">
            <nuxt-link to="/admin/">You are logged in already.</nuxt-link>
          </v-card-text>
          <div v-else>
            <v-card-text>
              <v-alert :value="errorMessage" type="error" outline>
                {{ errorMessage }}
              </v-alert>
              <v-text-field
                v-model="formUsername"
                label="Username"
                prepend-icon="person"
              />
              <v-text-field
                v-model="formPassword"
                label="Password"
                type="password"
                prepend-icon="lock"
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn type="submit" color="primary">Login</v-btn>
            </v-card-actions>
          </div>
        </v-form>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  head() {
    return {
      title: 'Portfolio Report'
    }
  },
  data() {
    return {
      formUsername: '',
      formPassword: '',
      errorMessage: null
    }
  },
  computed: {
    ...mapGetters({
      authenticated: 'auth/isAuthenticated'
    })
  },
  methods: {
    async login() {
      try {
        this.errorMessage = null
        await this.$store.dispatch('auth/login', {
          username: this.formUsername,
          password: this.formPassword
        })
        this.formUsername = ''
        this.formPassword = ''
        this.$router.push({
          path: '/admin/'
        })
      } catch (err) {
        this.errorMessage = err.message
      }
    }
  }
}
</script>
