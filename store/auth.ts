import { defineStore } from 'pinia'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const loggedIn = ref(false)
    const username = ref('')
    const token = ref('')
    const isAdmin = ref(false)

    function logout() {
      useApi('/auth/logout', { method: 'post' })

      loggedIn.value = false
      username.value = ''
      token.value = ''
      isAdmin.value = false

      navigateTo('/')
    }

    async function login(credentials: { username: string; password: string }) {
      const session = await useApi<{
        token: string
        note: string
        createdAt: string
        lastActivityAt: string
      }>('/auth/login', {
        method: 'post',
        body: credentials,
      })

      loggedIn.value = true
      token.value = session.token

      const user = await useApi<{ username: string; isAdmin: boolean }>(
        '/auth/users/me'
      )

      username.value = user.username
      isAdmin.value = user.isAdmin
    }

    return { login, logout, loggedIn, username, isAdmin, token }
  },
  { persist: true }
)
