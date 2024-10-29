<script setup lang="ts">
import Select from 'primevue/select'

import { useApi } from '~/composables/useApi'
import type { Security } from '~/store/Security.model'

const route = useRoute()

const { data: rawSecurity, error } = await useAsyncData(
  `security:${route.params.uuid}`,
  () => useApi<Security>(`/securities/uuid/${route.params.uuid}`),
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

const selectedCurrency = ref(currencies[0]!)

const { data: prices } = await useLazyAsyncData(
  `security:${route.params.uuid}:prices:${selectedCurrency.value.code}`,
  async () => {
    if (!security.value.pricesAvailable) {
      return []
    }
    return await useApi<{ date: string, close: number }[]>(
      `/securities/uuid/${route.params.uuid}/prices/${selectedCurrency.value.code}`,
    )
  },
  { watch: [selectedCurrency] },
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
            <SecurityType :name="security.securityType ?? ''" class="align-top" />
            <SecurityTag
              v-for="tag in security.tags"
              :key="tag"
              class="align-top"
              :name="tag"
            />
          </h2>
          <div class="separator-container font-mono">
            <span v-if="security.isin">{{ security.isin }}</span>
            <span v-if="security.wkn">{{ security.wkn }}</span>
            <span v-if="security.code">{{ security.code }}</span>
          </div>
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
      </div>
    </div>
  </div>
</template>

<style scoped>
.separator-container > *:not(:last-child)::after {
  content: ' · ';
}
</style>
