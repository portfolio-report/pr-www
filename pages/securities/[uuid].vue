<template>
  <div class="flex justify-content-center">
    <div style="width: 800px">
      <div class="flex flex-wrap">
        <div class="flex-grow-1">
          <h2>
            {{ security.name }}
            <EditBtn v-if="auth.loggedIn" @click="editSecurity(security)" />
          </h2>
          <NuxtLink :to="$route.path">
            <Button
              v-tooltip.right="{
                escape: true,
                value:
                  '<h4>Drag and drop!</h4> To add this security in Portfolio Performance, drag and drop it to securities list or statement of assets.',
              }"
              class="mt-2 cursor-move w-20rem"
              icon="i-carbon-move i-lg"
              label="Add to Portfolio Performance"
            >
            </Button>
          </NuxtLink>
        </div>

        <img
          v-if="security.logoUrl"
          :src="security.logoUrl"
          style="max-width: 100px; max-height: 100px; mix-blend-mode: multiply"
        />
      </div>

      <TabView class="mt-2">
        <TabPanel header="Overview">
          <ul>
            <li v-if="auth.loggedIn">
              UUID: <b>{{ security.uuid }}</b>
            </li>
            <li>
              ISIN: <b>{{ security.isin }}</b>
            </li>
            <li>
              WKN: <b>{{ security.wkn }}</b>
            </li>
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
            <li v-if="security.symbolXfra">
              Symbol (Frankfurt):
              <b>{{ security.symbolXfra }}</b>
            </li>
            <li v-if="security.symbolXnas">
              Symbol (NASDAQ):
              <b>{{ security.symbolXnas }}</b>
            </li>
            <li v-if="security.symbolXnys">
              Symbol (New York):
              <b>{{ security.symbolXnys }}</b>
            </li>
            <li>
              Type:
              <Chip class="mx-1 text-sm bg-teal-500 text-white">
                {{ security.securityType }}
              </Chip>
            </li>
            <li v-if="security.tags && security.tags.length > 0">
              Tags:
              <SecurityTag
                v-for="tag in security.tags"
                :key="tag"
                :name="tag"
              />
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
            <Column field="date" header="Date"></Column>
            <Column
              field="type"
              header="Type"
              style="text-transform: capitalize"
            ></Column>
            <Column header="...">
              <template #body="{ data: event }">
                {{
                  event.type === 'dividend'
                    ? event.amount + ' ' + event.currencyCode
                    : ''
                }}
                {{ event.type === 'split' ? event.ratio : '' }}
              </template>
            </Column>
          </DataTable>
        </TabPanel>
      </TabView>
    </div>

    <SecurityDialog ref="securityDialog" />
  </div>
</template>

<script setup lang="ts">
import SecurityDialog from '~/components/SecurityDialog.vue'
import { useAuthStore } from '~/store/auth'
import { Security, SecurityAPI } from '~/store/Security.model'
import { useApi } from '~/composables/useApi'

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
const auth = useAuthStore()

const { data: rawSecurity, error } = await useAsyncData(
  `security:${route.params.uuid}`,
  () => useApi<SecurityAPI>(`/securities/uuid/${route.params.uuid}`)
)
if (error.value || !rawSecurity.value) {
  throw createError({
    statusCode: 404,
    message: 'This page could not be found',
    fatal: true,
  })
}
const security = ref(rawSecurity.value)

const securityDialog = ref<InstanceType<typeof SecurityDialog> | null>(null)
async function editSecurity(s: Security) {
  const ret = await securityDialog.value?.show(s)
  if (ret) {
    security.value = { ...security.value, ...ret }
  }
}

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
    { method: 'delete' }
  )

  if (selectedMarket.value) {
    const idx = selectedMarket.value.prices.findIndex(
      (e: { date: string }) => e.date === date
    )
    delete selectedMarket.value.prices[idx]
  }
}

useHead(() => ({
  title: security.value?.name + ' - Portfolio Report',
}))
</script>