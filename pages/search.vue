<script setup lang="ts">
import { useRouteQuery } from '@vueuse/router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'

import Tag from 'primevue/tag'
import type { SecurityV1 } from '~/store/Security.model'

const q = useRouteQuery('q', '', { transform: v => v || '' })
const securityType = useRouteQuery('securityType', '', { transform: v => v || '' })

const route = useRoute()

const canonicalUrl = computed(() => {
  let ret = 'https://www.portfolio-report.net/search'

  if (route.query && route.query.q) {
    ret += `?q=${route.query.q}`

    if (route.query.securityType) {
      ret += `&securityType=${route.query.securityType}`
    }
  }
  return ret
})

useHead({
  title: 'Portfolio Report Search',
  link: [{ rel: 'canonical', href: canonicalUrl.value }],
})

const searchTerm = ref('')
const selectedSecurityType = ref('')

const results = ref<SecurityV1[]>([])
const noResults = ref(false)
const searching = ref(false)
const error = ref(false)
const errorText = ref('')

async function search() {
  searchTerm.value = searchTerm.value.trim()

  q.value = searchTerm.value
  securityType.value = selectedSecurityType.value
}

watch([q, securityType], () => {
  searchTerm.value = q.value
  selectedSecurityType.value = securityType.value

  updateResults()
}, { immediate: true })

async function updateResults() {
  if (!q.value) {
    return
  }
  searching.value = true
  noResults.value = false
  error.value = false

  try {
    const params: Record<string, string> = {
      q: q.value,
    }
    if (selectedSecurityType.value) {
      params.securityType = securityType.value
    }

    const res = await useApi<SecurityV1[]>('/v1/securities/search', { params })

    searching.value = false
    results.value = res
    noResults.value = res.length === 0

    // Forward user to security page if only one result
    if (res.length === 1 && res[0]) {
      await navigateTo(`/securities/${res[0].uuid}`)
    }
  } catch (err) {
    searching.value = false
    results.value = []
    noResults.value = false
    error.value = true
    errorText.value = String(err)
  }
}
</script>

<template>
  <div class="flex justify-center">
    <div style="width: 800px">
      <Card>
        <template #title>
          Security Search
        </template>
        <template #content>
          <form @submit.prevent="search">
            <ClientOnly>
              <InputText
                id="searchTermInput"
                v-model="searchTerm"
                type="search"
                class="mt-2 w-full"
                autofocus
                placeholder="ISIN/WKN/Symbol/Name"
              />

              <SelectSecurityType v-model="selectedSecurityType" class="w-full mt-4" />

              <Button
                type="submit"
                :disabled="!searchTerm || searching"
                class="w-full flex justify-center mt-4"
              >
                <span v-if="!searching" class="font-bold">Search</span>
                <ProgressSpinner v-else style="height: 20px" />
              </Button>
            </ClientOnly>

            <Message v-if="noResults" severity="info" class="mt-4">
              Sorry, no results were found.
            </Message>

            <Message v-if="error" severity="error" class="mt-4">
              Sorry, there was an error:<br>{{ errorText }}
            </Message>
          </form>
        </template>
      </Card>

      <Card v-if="results.length > 0" class="mt-4">
        <template #title>
          Results
        </template>
        <template #content>
          <div v-for="result in results" :key="result.uuid" class="mb-3">
            <div class="text-lg font-medium flex items-center">
              <i
                v-if="result.pricesAvailable"
                v-tooltip.top="'Prices available'"
                class="i-carbon-chart-line mr-1 text-blue-500"
              />

              <NuxtLink
                :to="`/securities/${result.uuid}`"
                class="text-blue-500"
              >
                {{ result.name }}
              </NuxtLink>

              <Tag class="mx-1 p-1 !text-xs !bg-teal-500 !text-white">
                {{ result.securityType }}
              </Tag>

              <SecurityTag v-for="tag in result.tags" :key="tag" :name="tag" />
            </div>
            <div class="text-gray-600 separator-container font-mono">
              <span v-if="result.isin">{{ result.isin }}</span>
              <span v-if="result.wkn">{{ result.wkn }}</span>
              <span v-if="result.code">{{ result.code }}</span>
            </div>
          </div>
        </template>
      </Card>

      <Card class="mt-4">
        <template #title>
          Your contribution is needed 💪
        </template>
        <template #content>
          Your help is needed to keep this website up and running. Have you
          thought about contributing? You could:
          <ul>
            <li>
              Actively maintain and develop the
              <a href="https://www.github.com/portfolio-report" class="text-blue-500">source code on Github</a>.
            </li>
            <li>
              Become member of the
              <a href="https://forum.portfolio-performance.info" class="text-blue-500">forum</a> and
              help other users.
            </li>
            <li>
              Cover monthly costs for server operation and licence fees. Become
              sponsor on
              <a href="https://github.com/sponsors/tfabritius" class="text-blue-500">Github</a>.
            </li>
          </ul>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.separator-container > *:not(:last-child)::after {
  content: ' · ';
}
</style>
