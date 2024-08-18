<script setup lang="ts">
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Select from 'primevue/select'
import Tag from 'primevue/tag'

import type { SecurityAPI } from '~/store/Security.model'
import { useApi } from '~/composables/useApi'
import type { Taxonomy } from '~/store/Taxonomy.model'

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

const currencies = [
  { code: 'EUR' },
  { code: 'USD' },
  { code: 'AED' },
  { code: 'AUD' },
  { code: 'BGN' },
  { code: 'BRL' },
  { code: 'CAD' },
  { code: 'CHF' },
  { code: 'CNY' },
  { code: 'CZK' },
  { code: 'DKK' },
  { code: 'GBP' },
  { code: 'GBX' },
  { code: 'HKD' },
  { code: 'HRK' },
  { code: 'HUF' },
  { code: 'IDR' },
  { code: 'ILS' },
  { code: 'INR' },
  { code: 'ISK' },
  { code: 'JPY' },
  { code: 'KRW' },
  { code: 'MXN' },
  { code: 'MYR' },
  { code: 'NOK' },
  { code: 'NZD' },
  { code: 'PHP' },
  { code: 'PLN' },
  { code: 'RON' },
  { code: 'RUB' },
  { code: 'SEK' },
  { code: 'SGD' },
  { code: 'THB' },
  { code: 'TRY' },
  { code: 'ZAR' },
]

const selectedCurrency = ref(currencies[0])

const { data: prices } = await useLazyAsyncData(
  `security:${route.params.uuid}:prices:${selectedCurrency.value.code}`,
  async () => {
    if (!security.value.pricesAvailable) {
      return []
    }
    return await useApi<{ date: string, close: number }[]>(
      `/securities/uuid/${route.params.uuid}/prices/${selectedCurrency.value.code}`,
      { params: { from: '2000-01-01' } },
    )
  },
  { watch: [selectedCurrency] },
)

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
  useApi<Taxonomy[]>('/taxonomies/'))

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

const industries = computed(() =>
  securityTaxonomies.value.filter(
    st => st.rootTaxonomyUuid === '072bba7b-ed7a-4cb4-aab3-91520d00fb00',
  ),
)

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
  <div class="flex justify-center">
    <div style="width: 800px">
      <div class="flex flex-wrap">
        <div class="flex-grow-1">
          <h2>
            {{ security.name }}
            <Tag class="mx-1 p-1 !text-xs !text-white !bg-teal-500 align-top">
              {{ security.securityType }}
            </Tag>
            <SecurityTag
              v-for="tag in security.tags"
              :key="tag"
              class="align-top"
              :name="tag"
            />
          </h2>
          <div class="separator-container font-mono">
            <CopyClipboard v-if="security.isin" v-tooltip.top="'ISIN'" :text="security.isin">
              {{ security.isin }}
            </CopyClipboard>
            <CopyClipboard v-if="security.wkn" v-tooltip.top="'WKN'" :text="security.wkn">
              {{ security.wkn }}
            </CopyClipboard>
            <CopyClipboard v-if="security.code" v-tooltip.top="'Code'" :text="security.code">
              {{ security.code }}
            </CopyClipboard>
          </div>

          <NuxtLink
            v-tooltip.right="{
              escape: false,
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

      <div class="mt-4">
        <div class="flex items-baseline">
          <h3 v-if="security.pricesAvailable">
            Prices
          </h3>
          <Select
            v-if="security.pricesAvailable"
            v-model="selectedCurrency"
            :options="currencies"
            option-label="code"
            class="ml-2"
          >
            <template #value="{ value }">
              <CountryFlag :country="value.code.substring(0, 2)" class="mr-1" />
              {{ value.code }}
            </template>
            <template #option="{ option }">
              <CountryFlag :country="option.code.substring(0, 2)" class="mr-1" />
              {{ option.code }}
            </template>
          </Select>
        </div>

        <PricesTable
          v-if="security.pricesAvailable && prices"
          :prices="prices"
        />

        <span v-if="!security.pricesAvailable">
          No prices available
        </span>

        <h5 v-if="markets.length > 0">
          Markets
        </h5>
        <ul v-if="markets.length > 0">
          <li v-for="market in markets" :key="market.marketCode">
            <b>{{ market.name }}</b>
            <ul>
              <li>
                Currency: <CountryFlag :country="market.currencyCode.substring(0, 2)" class="mr-1" />
                <b class="font-mono">{{ market.currencyCode || '-' }}</b>
              </li>
              <li>
                Symbol: <b class="font-mono">{{ market.symbol }}</b>
              </li>
            </ul>
          </li>
        </ul>

        <h5 v-if="countries.length === 1">
          Country
        </h5>
        <span v-if="countries.length === 1" class="font-mono">
          <CountryFlag :country="countries[0].taxonomy?.code ?? ''" class="mr-1" />
          {{ countries[0].taxonomy?.name }}
          ({{ countries[0].taxonomy?.code }})
        </span>

        <h5 v-if="countries.length > 1">
          Countries
        </h5>
        <DataTable
          v-if="countries.length > 1"
          :value="countries"
          sort-field="weight"
          :sort-order="-1"
          class="mb-2"
          size="small"
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
              <CountryFlag :country="data.taxonomy.code" class="mr-1" />
              {{ data.taxonomy.name }}
            </template>
          </Column>
          <Column
            field="taxonomy.code"
            header="Code"
            :sortable="true"
          />
        </DataTable>

        <h5 v-if="industries.length === 1">
          Industry
        </h5>
        <span v-if="industries.length === 1" class="font-mono">
          {{ industries[0].taxonomy?.name }}
        </span>

        <h5 v-if="industries.length > 1">
          Industries
        </h5>

        <DataTable
          v-if="industries.length > 1"
          :value="industries"
          sort-field="weight"
          :sort-order="-1"
          size="small"
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

        <h5 v-if="security.events.length > 0">
          Events
        </h5>
        <DataTable
          v-if="security.events.length > 0"
          :value="security.events"
          class="font-mono"
          size="small"
        >
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
      </div>
    </div>
  </div>
</template>

<style scoped>
.separator-container > *:not(:last-child)::after {
  content: ' · ';
}
</style>
