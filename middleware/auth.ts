import { useAuthStore } from '~/store/auth'

export default defineNuxtRouteMiddleware((_to, _from) => {
  const auth = useAuthStore()

  if (!auth.loggedIn) {
    return navigateTo('/login')
  }
})
