<template>
  <div class="flex justify-content-center">
    <Card class="p-4 shadow-2" style="width: 40rem">
      <template #title>
        <div class="text-center mb-5">
          <i class="ii i-carbon-user-avatar" style="font-size: 3rem"></i>
          <div class="text-900 text-3xl font-medium mb-3">Welcome Back</div>
        </div>
      </template>

      <template #content>
        <div v-if="authenticated">
          <NuxtLink to="/">You are logged in already.</NuxtLink>
        </div>
        <form v-else @submit.prevent="login">
          <label for="username" class="block text-900 font-medium mb-2">
            Username
          </label>
          <InputText
            id="username"
            ref="username"
            v-model="formUsername"
            autofocus
            type="text"
            class="w-full mb-3"
          />

          <label for="password" class="block text-900 font-medium mb-2">
            Password
          </label>
          <InputText
            id="password"
            v-model="formPassword"
            type="password"
            class="w-full mb-3"
          />

          <Button
            label="Sign In"
            type="submit"
            class="w-full"
            :disabled="loading"
          ></Button>
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast'

import { useAuthStore } from '~/store/auth'

const auth = useAuthStore()
const toast = useToast()

const formUsername = ref('')
const formPassword = ref('')

const loading = ref(false)

const authenticated = computed(() => auth.loggedIn && auth.isAdmin)

async function login() {
  loading.value = true
  try {
    await auth.login({
      username: formUsername.value,
      password: formPassword.value,
    })

    formUsername.value = ''
    formPassword.value = ''

    return navigateTo('/')
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Sign in failed',
      detail: String(err),
      life: 5000,
    })
  }
  loading.value = false
}
</script>
