import { FetchOptions } from 'ohmyfetch'

export async function useApi<T>(path: string, opts?: FetchOptions): Promise<T> {
  const config = useRuntimeConfig()

  return await $fetch<T>(path, {
    baseURL: config.public.baseUrl,
    ...opts,
  })
}
