<script setup lang="ts">
import type { SecurityAPI } from '~/store/Security.model'
import { useApi } from '~/composables/useApi'
import type { Taxonomy } from '~/store/Taxonomy.model'

const selectedMarketcode = ref('')
const selectedMarket = ref<{
  currencyCode: string
  marketCode: string
  firstPriceDate: string | null
  lastPriceDate: string | null
  symbol: string | null
  prices: Array<{ date: string; close: number }>
} | null>(null)

const route = useRoute()

const { data: rawSecurity, error } = await useAsyncData(
  `security:${route.params.uuid}`,
  () => useApi<SecurityAPI>(`/securities/uuid/${route.params.uuid}`),
)
if (error.value || !rawSecurity.value) {
  throw createError({
    statusCode: 404,
    message: 'This page could not be found',
    fatal: true,
  })
}
const security = ref(rawSecurity.value)

const markets = computed(() => {
  return security.value?.markets?.map((market) => {
    let marketName
    if (market.marketCode === 'XETR') {
      marketName = 'XETRA (Frankfurt)'
    } else if (market.marketCode === 'XFRA') {
      marketName = 'Frankfurt'
    } else if (market.marketCode === 'XNAS') {
      marketName = 'NASDAQ'
    } else if (market.marketCode === 'XNYS') {
      marketName = 'NYSE'
    }
    return {
      ...market,
      name: marketName,
    }
  })
})

const { data: rawTaxonomies } = await useAsyncData('taxonomies', () =>
  useApi<Taxonomy[]>('/taxonomies/'),
)

if (!rawTaxonomies.value) {
  throw createError({
    statusCode: 404,
    message: 'This page could not be found',
    fatal: true,
  })
}
const taxonomies = ref(rawTaxonomies.value)

const securityTaxonomies = computed(() =>
  security.value.securityTaxonomies.map(st => ({
    ...st,
    weight: Number(st.weight),
    // Join taxonomies to securityTaxonomies
    taxonomy: taxonomies.value.find(t => t.uuid === st.taxonomyUuid),
  })),
)

const countries = computed(() =>
  securityTaxonomies.value.filter(
    st => st.rootTaxonomyUuid === '5b0d5647-a4e6-4db8-807b-c3a6d11697a7',
  ),
)

const countriesOverlay = ref()
function toggleCountriesOverlay(event: MouseEvent) {
  countriesOverlay.value.toggle(event)
}

const industries = computed(() =>
  securityTaxonomies.value.filter(
    st => st.rootTaxonomyUuid === '072bba7b-ed7a-4cb4-aab3-91520d00fb00',
  ),
)

const industriesOverlay = ref()
function toggleIndustriesOverlay(event: MouseEvent) {
  industriesOverlay.value.toggle(event)
}

watch(selectedMarketcode, async (selectedMarketcode) => {
  selectedMarket.value = await useApi<{
    currencyCode: string
    marketCode: string
    firstPriceDate: string | null
    lastPriceDate: string | null
    prices: Array<{ date: string; close: number }>
    symbol: string | null
  }>(`/securities/uuid/${route.params.uuid}/markets/${selectedMarketcode}`, {
    params: { from: '2000-01-01' },
  })
})

async function deletePrice({ date }: { date: string }) {
  await useApi(
    `/securities/uuid/${security.value.uuid}/markets/${selectedMarketcode.value}/prices/${date}`,
    { method: 'delete' },
  )

  if (selectedMarket.value) {
    const idx = selectedMarket.value.prices.findIndex(
      (e: { date: string }) => e.date === date,
    )
    delete selectedMarket.value.prices[idx]
  }
}

useHead(() => ({
  title: `${security.value?.name} - Portfolio Report`,
  link: [
    {
      rel: 'canonical',
      href:
        `https://www.portfolio-report.net/securities/${security.value.uuid}`,
    },
  ],
}))
</script>

<template>
  <div class="flex justify-content-center">
    <div style="width: 800px">
      <div class="flex flex-wrap">
        <div class="flex-grow-1">
          <h2>
            {{ security.name }}
            <Tag class="mx-1 bg-teal-500 vertical-align-top">
              {{ security.securityType }}
            </Tag>
            <SecurityTag
              v-for="tag in security.tags"
              :key="tag"
              class="vertical-align-top"
              :name="tag"
            />
          </h2>
          <div class="text-600">
            <span v-tooltip.top="'ISIN'">{{ security.isin }}</span> ·
            <span v-tooltip.top="'WKN'">{{ security.wkn }}</span>
          </div>

          <NuxtLink
            v-tooltip.right="{
              escape: true,
              value:
                '<h4>Drag and drop!</h4> To add this security in Portfolio Performance, drag and drop it to securities list or statement of assets.',
            }"
            :to="$route.path"
          >
            <span class="mt-2 cursor-move w-20rem p-button p-component">
              <span class="i-carbon-move i-lg p-button-icon p-button-icon-left" />
              <span class="p-button-label">Add to Portfolio Performance</span>
            </span>
          </NuxtLink>
        </div>

        <div>
          <img
            v-if="security.logoUrl"
            :src="security.logoUrl"
            style="
              max-width: 100px;
              max-height: 100px;
              mix-blend-mode: multiply;
            "
          >
        </div>
      </div>

      <TabView class="mt-2">
        <TabPanel header="Overview">
          <ul>
            <li v-for="market in markets" :key="market.marketCode">
              Market: <b>{{ market.name }}</b>
              <ul>
                <li>
                  Currency: <b>{{ market.currencyCode || '-' }}</b>
                </li>
                <li>
                  Symbol: <b>{{ market.symbol }}</b>
                </li>
                <li>
                  Prices available: <b>{{ market.firstPriceDate }}</b> -
                  <b>{{ market.lastPriceDate }}</b>
                </li>
              </ul>
            </li>
            <li v-if="countries.length === 1 && countries[0].taxonomy">
              Country:
              <CountryFlag :country="countries[0].taxonomy.code || ''" />
              <b>
                {{ countries[0].taxonomy.name }}
                ({{ countries[0].taxonomy.code }})
              </b>
            </li>
            <li v-else-if="countries.length > 1">
              <a href="#" @click="toggleCountriesOverlay">Countries</a>
              <OverlayPanel ref="countriesOverlay" :show-close-icon="true">
                <DataTable
                  :value="countries"
                  sort-field="weight"
                  :sort-order="-1"
                  class="p-datatable-sm mb-2"
                >
                  <Column field="weight" header="Percentage" :sortable="true">
                    <template #body="{ data }">
                      {{ data.weight }}%
                    </template>
                  </Column>
                  <Column
                    field="taxonomy.name"
                    header="Country"
                    :sortable="true"
                  >
                    <template #body="{ data }">
                      <CountryFlag :country="data.taxonomy.code" />
                      {{ data.taxonomy.name }}
                    </template>
                  </Column>
                  <Column
                    field="taxonomy.code"
                    header="Code"
                    :sortable="true"
                  />
                </DataTable>
              </OverlayPanel>
            </li>
            <li v-if="industries.length === 1 && industries[0].taxonomy">
              Industry:
              <b>{{ industries[0].taxonomy.name }}</b>
            </li>
            <li v-else-if="industries.length > 1">
              <a href="#" @click="toggleIndustriesOverlay">Industries</a>
              <OverlayPanel ref="industriesOverlay" :show-close-icon="true">
                <DataTable
                  :value="industries"
                  sort-field="weight"
                  :sort-order="-1"
                  class="p-datatable-sm"
                >
                  <Column field="weight" header="Percentage" :sortable="true">
                    <template #body="{ data }">
                      {{ data.weight }}%
                    </template>
                  </Column>
                  <Column
                    field="taxonomy.name"
                    header="Country"
                    :sortable="true"
                  />
                </DataTable>
              </OverlayPanel>
            </li>
          </ul>
        </TabPanel>

        <TabPanel header="Prices">
          <Dropdown
            id="market"
            v-model="selectedMarketcode"
            :options="markets"
            option-label="name"
            option-value="marketCode"
            placeholder="Please select market"
          >
            <template #option="{ option }">
              {{ option.name }} - {{ option.marketCode }}
            </template>
          </Dropdown>

          <div v-if="selectedMarket">
            <ul>
              <li>
                Symbol: <b>{{ selectedMarket.symbol }}</b>
              </li>
              <li>
                Currency: <b>{{ selectedMarket.currencyCode || '-' }}</b>
              </li>
              <li>
                Prices available: <b>{{ selectedMarket.firstPriceDate }}</b> -
                <b>{{ selectedMarket.lastPriceDate }}</b>
              </li>
            </ul>

            <PricesTable
              :prices="selectedMarket.prices"
              @delete-price="deletePrice"
            />
          </div>
        </TabPanel>

        <TabPanel
          v-if="security.events && security.events.length > 0"
          header="Events"
        >
          <DataTable :value="security.events">
            <Column field="date" header="Date" />
            <Column
              field="type"
              header="Type"
              style="text-transform: capitalize"
            />
            <Column header="...">
              <template #body="{ data: event }">
                {{
                  event.type === 'dividend'
                    ? `${event.amount} ${event.currencyCode}`
                    : ''
                }}
                {{ event.type === 'split' ? event.ratio : '' }}
              </template>
            </Column>
          </DataTable>
        </TabPanel>
      </TabView>
    </div>
  </div>
</template>
