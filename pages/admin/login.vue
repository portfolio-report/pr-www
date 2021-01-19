<template>
  <v-row align="center" justify="center">
    <v-col cols="12" sm="8" md="6">
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
              <v-alert :value="errorMessage" type="error" outlined>
                {{ errorMessage }}
              </v-alert>
              <v-text-field
                v-model="formUsername"
                label="Username"
                :prepend-icon="mdiAccount"
              />
              <v-text-field
                v-model="formPassword"
                label="Password"
                type="password"
                :prepend-icon="mdiLock"
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn type="submit" color="primary">Login</v-btn>
            </v-card-actions>
          </div>
        </v-form>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Vue, mixins } from 'nuxt-property-decorator'

import { IconsMixin } from '@/components/icons-mixin'

@Component
export default class LoginPage extends mixins(Vue, IconsMixin) {
  formUsername = ''
  formPassword = ''
  errorMessage: string | null = null

  get authenticated() {
    return this.$store.getters['auth/isAuthenticated']
  }

  async login() {
    try {
      this.errorMessage = null
      await this.$store.dispatch('auth/login', {
        username: this.formUsername,
        password: this.formPassword,
      })
      this.formUsername = ''
      this.formPassword = ''
      this.$router.push({
        path: '/admin/',
      })
    } catch (err) {
      this.errorMessage = err.message
    }
  }

  head() {
    return {
      title: 'Portfolio Report',
    }
  }
}
</script>
