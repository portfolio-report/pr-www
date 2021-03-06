<template>
  <v-row align="center" justify="center">
    <v-col cols="12" sm="8" md="6">
      <v-card class="elevation-12">
        <v-toolbar dark color="primary">
          <v-toolbar-title>Login</v-toolbar-title>
        </v-toolbar>

        <v-card-text v-if="authenticated">
          <nuxt-link to="/">You are logged in already.</nuxt-link>
        </v-card-text>
        <div v-else>
          <v-card-text>
            <v-form @submit.prevent="login">
              <v-alert :value="errorMessage" type="error" outlined>
                {{ errorMessage }}
              </v-alert>
              <v-text-field
                ref="username"
                v-model="formUsername"
                label="Username"
                :prepend-icon="mdiAccount"
                outlined
                dense
              />
              <v-text-field
                v-model="formPassword"
                label="Password"
                type="password"
                :prepend-icon="mdiLock"
                outlined
                dense
              />
              <v-btn type="submit" color="primary" block>Login</v-btn>
            </v-form>
          </v-card-text>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Vue, mixins } from 'nuxt-property-decorator'

import { IconsMixin } from '@/components/icons-mixin'

@Component
export default class LoginPage extends mixins(Vue, IconsMixin) {
  $refs!: {
    username: HTMLInputElement
  }

  formUsername = ''
  formPassword = ''
  errorMessage: string | null = null

  get authenticated() {
    return this.$auth.loggedIn && this.$auth.user?.isAdmin
  }

  mounted(): void {
    if (this.$refs.username) {
      this.$refs.username.focus()
    }
  }

  async login() {
    try {
      this.errorMessage = null
      await this.$auth.loginWith('local', {
        data: { username: this.formUsername, password: this.formPassword },
      })

      this.formUsername = ''
      this.formPassword = ''
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
