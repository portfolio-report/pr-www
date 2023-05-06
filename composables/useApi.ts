import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'

export async function useApi<T>(
  path: string,
  opts?: NitroFetchOptions<NitroFetchRequest>,
): Promise<T> {
  const config = useRuntimeConfig()

  return await $fetch<T>(path, {
    baseURL: config.public.baseUrl,
    ...opts,
  })
}
