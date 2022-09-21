import { FetchOptions } from 'ohmyfetch'

import { useAuthStore } from '~/store/auth'

export async function useApi<T>(path: string, opts?: FetchOptions): Promise<T> {
  const config = useRuntimeConfig()
  const auth = useAuthStore()

  let headers
  if (auth.loggedIn) {
    headers = { ...opts?.headers, authorization: 'Bearer ' + auth.token }
  }

  return await $fetch<T>(path, {
    baseURL: config.public.baseUrl,
    ...opts,
    headers,
  })
}
