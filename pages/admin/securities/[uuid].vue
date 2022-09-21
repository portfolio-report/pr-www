<template>
  <div>
    <h2>Security: {{ security.name }}</h2>

    <TabView>
      <TabPanel header="Master data">
        <ul>
          <li>
            UUID: <b>{{ security.uuid }}</b>
          </li>
          <li>
            ISIN: <b>{{ security.isin }}</b>
          </li>
          <li>
            WKN: <b>{{ security.wkn }}</b>
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
        </ul>
      </TabPanel>

      <TabPanel header="Markets">
        <DataTable
          :value="security.markets"
          :headers="[
            { text: 'Market', value: 'marketCode' },
            { text: 'Currency', value: 'currencyCode' },
            { text: 'Symbol', value: 'symbol' },
            { text: 'First price', value: 'firstPriceDate' },
            { text: 'Last price', value: 'lastPriceDate' },
            { text: 'Update', value: 'updatePrices' },
            { value: 'actions' },
          ]"
        >
          <Column field="marketCode" header="Market"></Column>
          <Column field="currencyCode" header="Currency"></Column>
          <Column field="symbol" header="Symbol"></Column>
          <Column field="firstPriceDate" header="First Price"></Column>
          <Column field="lastPriceDate" header="Last Price"></Column>
          <Column field="updatePrices" header="Update"></Column>
          <Column>
            <template #body="{ data }">
              <EditBtn @click="editMarket(data)" />
              <DeleteBtn @click="deleteMarket(data)" />
            </template>
          </Column>
        </DataTable>

        <TextBtn
          class="mt-2"
          icon="i-carbon-add "
          label="Add market"
          solid
          @click="newMarket"
        />
      </TabPanel>

      <TabPanel header="Taxonomies">
        <Card
          v-for="taxonomy of taxonomies.filter((t) => t.parentUuid === null)"
          :key="taxonomy.uuid"
        >
          <template #title>
            {{ taxonomy.name }}
            <EditBtn @click="editTaxonomy(taxonomy)" />
          </template>
          <template #subtitle>
            {{ taxonomy.uuid }}
          </template>
          <template #content>
            <ul>
              <li
                v-for="st of securityTaxonomies.filter(
                  (st) => st.taxonomy?.rootUuid === taxonomy.uuid
                )"
                :key="st.taxonomyUuid"
              >
                {{ st.weight }}% {{ st.taxonomy?.name }}
                {{ st.taxonomy?.code }}
              </li>
            </ul>
          </template>
        </Card>
      </TabPanel>
    </TabView>

    <Dialog
      v-model:visible="marketDialog"
      style="width: 500px"
      :header="selectedMarketIsNew ? 'New market' : selectedMarket.marketCode"
      :modal="true"
    >
      <form id="marketForm" @submit.prevent="saveMarket">
        <div class="p-float-label mt-4">
          <InputText
            id="marketCode"
            v-model="selectedMarket.marketCode"
            :readonly="!selectedMarketIsNew"
            class="w-full"
          />
          <label for="marketCode">Market code (MIC)</label>
        </div>
        <div class="p-float-label mt-4">
          <InputText
            id="currencyCode"
            v-model="selectedMarket.currencyCode"
            class="w-full"
          />
          <label for="currencyCode">Currency code</label>
        </div>

        <div class="p-float-label mt-4">
          <InputText
            id="symbol"
            v-model="selectedMarket.symbol"
            class="w-full"
          />
          <label for="symbol">Symbol</label>
        </div>

        <div class="field-checkbox mt-4">
          <Checkbox
            v-model="selectedMarket.updatePrices"
            input-id="updatePrices"
            :binary="true"
          />
          <label for="updatePrices">Update prices</label>
        </div>
      </form>
      <template #footer>
        <CancelBtn label="Cancel" @click="marketDialog = false"> </CancelBtn>
        <AcceptBtn type="submit" form="marketForm" label="Save" />
      </template>
    </Dialog>

    <Dialog v-model:visible="taxonomyDialog" style="width: 500px" :modal="true">
      <form id="editTaxonomyForm" @submit.prevent="saveTaxonomy">
        <DataTable
          :value="selectedSecurityTaxonomies"
          class="p-datatable-sm"
          responsive-layout="scroll"
        >
          <Column field="weight" header="Weight">
            <template #body="{ data }">
              <InputNumber
                :model-value="Number(data.weight)"
                suffix="%"
                :min="0"
                :max="100"
                @update:model-value="data.weight = String($event)"
              />
            </template>
          </Column>
          <Column field="taxonomy.name" header="Name">
            <template #body="{ data }">
              <Dropdown
                v-model="data.taxonomyUuid"
                option-label="name"
                option-value="uuid"
                :options="
                  taxonomies.filter((t) => t.rootUuid === selectedTaxonomyUuid)
                "
              />
            </template>
          </Column>
          <Column>
            <template #body="{ data }">
              <DeleteBtn
                @click="
                  selectedSecurityTaxonomies =
                    selectedSecurityTaxonomies.filter((e) => e !== data)
                "
              />
            </template>
          </Column>
        </DataTable>

        <Message
          v-if="selectedSecurityTaxonomiesSumWeights !== 100"
          severity="warn"
        >
          Weights don't sum up to 100%, but:
          {{ selectedSecurityTaxonomiesSumWeights }}%
        </Message>
      </form>
      <template #footer>
        <div class="flex">
          <div class="flex-grow-1 flex">
            <AddBtn
              label="Add"
              @click="
                selectedSecurityTaxonomies.push({
                  taxonomyUuid: null,
                  weight: String(100 - selectedSecurityTaxonomiesSumWeights),
                })
              "
            />
          </div>

          <CancelBtn label="Cancel" @click="taxonomyDialog = false" />
          <AcceptBtn type="submit" form="editTaxonomyForm" label="Save" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Taxonomy } from '~/store/Taxonomy.model'
import { EditMarket, Market } from '~/store/Security.model'
import {
  EditSecurityTaxonomy,
  SecurityTaxonomy,
} from '~/store/SecurityTaxonomy.model'

useHead({ title: 'Portfolio Report Admin' })

definePageMeta({
  middleware: ['auth'],
})

const route = useRoute()

const showConfirmDialog = useConfirmDialog()

const {
  data: rawSecurity,
  refresh: getSecurity,
  error,
} = await useAsyncData(`security:${route.params.uuid}`, () =>
  useApi<{
    uuid: string
    name: string
    wkn: string
    isin: string
    symbolXfra: string
    symbolXnas: string
    symbolXnys: string
    securityType: string
    markets: { marketCode: string; currencyCode: string }[]
    securityTaxonomies: SecurityTaxonomy[]
  }>(`/securities/${route.params.uuid}`)
)

const { data: rawTaxonomies } = await useAsyncData(() =>
  useApi<Taxonomy[]>(`/taxonomies/`)
)

if (error.value || !rawSecurity.value || !rawTaxonomies.value) {
  throw createError({
    statusCode: 404,
    message: 'This page could not be found',
    fatal: true,
  })
}
const security = ref(rawSecurity.value)
const taxonomies = ref(rawTaxonomies.value)

const marketDialog = ref(false)
const selectedMarket = ref<EditMarket>({
  marketCode: '',
  currencyCode: '',
  symbol: '',
  updatePrices: false,
})

const selectedMarketIsNew = ref(false)

const taxonomyDialog = ref(false)
const selectedTaxonomyUuid = ref('')
const selectedSecurityTaxonomies = ref<EditSecurityTaxonomy[]>([])

const selectedSecurityTaxonomiesSumWeights = computed(() =>
  selectedSecurityTaxonomies.value.reduce((a, b) => a + Number(b.weight), 0)
)

const securityTaxonomies = computed(() => {
  // Join taxonomies to securityTaxonomies
  return security.value.securityTaxonomies.map((st) => ({
    ...st,
    taxonomy: taxonomies.value.find((t) => t.uuid === st.taxonomyUuid),
  }))
})

function newMarket() {
  selectedMarket.value = {
    marketCode: '',
    currencyCode: '',
    symbol: '',
    updatePrices: true,
  }
  selectedMarketIsNew.value = true
  marketDialog.value = true
}

function editMarket(market: EditMarket) {
  selectedMarket.value = { ...market }
  selectedMarketIsNew.value = false
  marketDialog.value = true
}

async function saveMarket() {
  await useApi(
    `/securities/uuid/${security.value.uuid}/markets/${selectedMarket.value.marketCode}`,
    { method: 'post', body: selectedMarket.value }
  )

  // Update to reflect changes
  getSecurity()

  marketDialog.value = false
}

async function deleteMarket(market: Market) {
  if (
    await showConfirmDialog({
      message: `Are you sure you want to delete the market "${market.marketCode}"?`,
      header: 'Delete market',
    })
  ) {
    await useApi(
      `/securities/uuid/${security.value.uuid}/markets/${market.marketCode}`,
      { method: 'delete' }
    )
    getSecurity()
  }
}

function editTaxonomy(taxonomy: Taxonomy) {
  selectedTaxonomyUuid.value = taxonomy.uuid
  const newSelectedSecurityTaxonomies = securityTaxonomies.value.filter(
    (st) => st.taxonomy?.rootUuid === taxonomy.uuid
  )
  selectedSecurityTaxonomies.value = JSON.parse(
    JSON.stringify(newSelectedSecurityTaxonomies)
  )

  taxonomyDialog.value = true
}

async function saveTaxonomy() {
  await useApi(
    `/securities/uuid/${security.value.uuid}/taxonomies/${selectedTaxonomyUuid.value}`,
    { method: 'put', body: selectedSecurityTaxonomies.value }
  )
  getSecurity()
  taxonomyDialog.value = false
}
</script>
