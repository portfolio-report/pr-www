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
                :prepend-icon="icons.mdiAccount"
                outlined
                dense
              />
              <v-text-field
                v-model="formPassword"
                label="Password"
                type="password"
                :prepend-icon="icons.mdiLock"
                outlined
                dense
              />
              <v-btn
                type="submit"
                color="primary"
                :loading="loading"
                :disabled="loading"
                block
              >
                Login
              </v-btn>
            </v-form>
          </v-card-text>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  ref,
  useContext,
} from '@nuxtjs/composition-api'

import icons from '@/components/icons'

export default defineComponent({
  name: 'LoginPage',

  setup() {
    const { $auth } = useContext()

    const username = ref<HTMLInputElement | null>(null)

    const formUsername = ref('')
    const formPassword = ref('')
    const errorMessage = ref<string | null>(null)

    const loading = ref(false)

    const authenticated = computed(() => $auth.loggedIn && $auth.user?.isAdmin)

    onMounted(() => username.value?.focus())

    async function login() {
      loading.value = true
      try {
        errorMessage.value = null
        await $auth.loginWith('local', {
          data: { username: formUsername.value, password: formPassword.value },
        })

        formUsername.value = ''
        formPassword.value = ''
      } catch (err) {
        errorMessage.value = String(err)
      }
      loading.value = false
    }

    return {
      authenticated,
      formUsername,
      formPassword,
      errorMessage,
      loading,
      login,
      username,
      icons,
    }
  },

  head() {
    return {
      title: 'Portfolio Report',
    }
  },
})
</script>
