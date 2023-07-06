<script setup lang="ts">
import { differenceInCalendarDays } from 'date-fns'

const route = useRoute()
const router = useRouter()

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
const securityType = ref('')

interface SecuritySearchResult {
  uuid: string
  name: string
  isin: string
  wkn: string
  securityType: string
  markets: Array<{
    firstPriceDate: string
    lastPriceDate: string
    symbol: string | null
  }>
  tags: string[]
}

const results = ref<SecuritySearchResult[]>([])
const noResults = ref(false)
const searching = ref(false)
const error = ref(false)
const errorText = ref('')

readQueryParameters()
updateResults()

watch(
  () => route.query.q,
  () => {
    if (route.query.q) {
      readQueryParameters()
      updateResults()
    }
  },
)

async function search() {
  updateQueryParameters()
  await updateResults()
}

function readQueryParameters() {
  searchTerm.value = route.query.q as string
  securityType.value = (route.query.securityType || '') as string
}

function updateQueryParameters() {
  // Update query parameter in URL
  const query: {
    q: string
    securityType?: string
  } = { q: searchTerm.value }
  if (securityType.value) {
    query.securityType = securityType.value
  }
  router.push({
    path: route.path,
    query,
  })
}

async function updateResults() {
  if (!searchTerm.value) {
    return
  }
  searching.value = true
  noResults.value = false
  error.value = false

  try {
    const params: { securityType?: string } = {}
    if (securityType.value) {
      params.securityType = securityType.value
    }

    const res = await useApi<SecuritySearchResult[]>(
      `/securities/search/${encodeURIComponent(searchTerm.value.trim())}`,
      {
        params,
      })

    searching.value = false
    results.value = res
    noResults.value = res.length === 0
  } catch (err) {
    searching.value = false
    results.value = []
    noResults.value = false
    error.value = true
    errorText.value = String(err)
  }
}

function getPricesAvailable(result: SecuritySearchResult): boolean {
  return result.markets.some(
    market => market.firstPriceDate && market.lastPriceDate,
  )
}

function getRecentPricesAvailable(result: SecuritySearchResult): boolean {
  return result.markets.some(
    market =>
      market.lastPriceDate
      && differenceInCalendarDays(new Date(), new Date(market.lastPriceDate)) < 30,
  )
}

function getUniqueSymbols(result: SecuritySearchResult) {
  return [
    ...new Set(
      result.markets?.map(m => m.symbol),
    ),
  ].filter(s => !!s)
}
</script>

<template>
  <div class="flex justify-content-center">
    <div style="width: 800px">
      <Card>
        <template #title>
          Security Search
        </template>
        <template #content>
          <form @submit.prevent="search">
            <ClientOnly>
              <div class="p-float-label mt-2">
                <InputText
                  id="searchTermInput"
                  v-model="searchTerm"
                  type="search"
                  class="w-full"
                  autofocus
                />
                <label for="searchTermInput">ISIN/WKN/Symbol/Name</label>
              </div>

              <SelectSecurityType v-model="securityType" class="w-full mt-4" />

              <Button
                type="submit"
                :disabled="!searchTerm || searching"
                class="w-full flex justify-content-center mt-4"
              >
                <span v-if="!searching" class="font-bold">Search</span>
                <ProgressSpinner v-else style="height: 20px" />
              </Button>
            </ClientOnly>

            <Message v-if="noResults" severity="info">
              Sorry, no results were found.
            </Message>

            <Message v-if="error" severity="error">
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
            <div class="text-lg font-medium flex align-items-center">
              <i
                v-if="getPricesAvailable(result)"
                v-tooltip.top="'Prices available'"
                class="i-carbon-chart-line mr-1" :class="[
                  { 'text-primary': getRecentPricesAvailable(result) },
                ]"
              />

              <NuxtLink
                v-tooltip.top="'Drag and drop me to Portfolio Performance!'"
                :to="`/securities/${result.uuid}`"
              >
                {{ result.name }}
              </NuxtLink>

              <Tag class="mx-1 bg-teal-500">
                {{ result.securityType }}
              </Tag>

              <SecurityTag v-for="tag in result.tags" :key="tag" :name="tag" />
            </div>
            <div class="text-600">
              {{ result.isin }} · {{ result.wkn }}
              <span
                v-for="(symbol, idx) in getUniqueSymbols(result)"
                :key="idx"
              >
                · {{ symbol }}
              </span>
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
              <a href="https://www.github.com/portfolio-report">source code on Github</a>.
            </li>
            <li>
              Become member of the
              <a href="https://forum.portfolio-performance.info">forum</a> and
              help other users.
            </li>
            <li>
              Cover monthly costs for server operation and licence fees. Become
              sponsor on
              <a href="https://github.com/sponsors/tfabritius">Github</a>.
            </li>
          </ul>
        </template>
      </Card>
    </div>
  </div>
</template>
