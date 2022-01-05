<template>
  <v-row align="center" justify="center">
    <v-col cols="12">
      <v-toolbar color="primary" dark>
        <v-toolbar-title>Security: {{ security.name }} </v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>

      <v-tabs v-model="tab" grow>
        <v-tab key="masterdata">Master data</v-tab>
        <v-tab key="markets">Markets</v-tab>
        <v-tab key="taxonomies">Taxonomies</v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab">
        <v-tab-item key="masterdata">
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
              <v-chip small color="primary" text-color="white">
                {{ security.securityType }}
              </v-chip>
            </li>
          </ul>
        </v-tab-item>

        <v-tab-item key="markets">
          <v-data-table
            :items="security.markets"
            :items-per-page="-1"
            :headers="[
              { text: 'Market', value: 'marketCode' },
              { text: 'Currency', value: 'currencyCode' },
              { text: 'Symbol', value: 'symbol' },
              { text: 'First price', value: 'firstPriceDate' },
              { text: 'Last price', value: 'lastPriceDate' },
              { text: 'Update', value: 'updatePrices' },
              { value: 'actions' },
            ]"
            hide-default-footer
          >
            <template #item.actions="{ item }">
              <v-btn color="primary" icon text @click="editMarket(item)">
                <v-icon>{{ icons.mdiPencil }}</v-icon>
              </v-btn>
              <v-btn color="error" icon text @click="deleteMarket(item)">
                <v-icon>{{ icons.mdiDelete }}</v-icon>
              </v-btn>
            </template>
          </v-data-table>

          <v-btn color="primary" @click="newMarket">
            <v-icon>{{ icons.mdiPlus }}</v-icon> Add market
          </v-btn>
        </v-tab-item>

        <v-tab-item key="taxonomies">
          <v-card
            v-for="taxonomy of taxonomies.filter((t) => t.parentUuid === null)"
            :key="taxonomy.uuid"
          >
            <v-card-title>
              {{ taxonomy.name }}
              <v-btn color="primary" icon text @click="editTaxonomy(taxonomy)">
                <v-icon>{{ icons.mdiPencil }}</v-icon>
              </v-btn></v-card-title
            >
            <v-card-subtitle>{{ taxonomy.uuid }}</v-card-subtitle>
            <v-card-text class="text-body-1">
              <ul>
                <li
                  v-for="st of securityTaxonomies.filter(
                    (st) => st.taxonomy.rootUuid === taxonomy.uuid
                  )"
                  :key="st.taxonomyUuid"
                >
                  {{ st.weight }}% {{ st.taxonomy.name }}
                  {{ st.taxonomy.code }}
                </li>
              </ul>
            </v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs-items>

      <v-dialog v-model="marketDialog" width="500">
        <v-form @submit.prevent="saveMarket">
          <v-card>
            <v-card-title v-if="selectedMarketIsNew">New market</v-card-title>
            <v-card-title v-else>
              {{ selectedMarket.marketCode }}
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" sm="12" md="6">
                    <v-text-field
                      v-model="selectedMarket.marketCode"
                      label="Market code (MIC)"
                      :readonly="!selectedMarketIsNew"
                    />
                    <v-text-field
                      v-model="selectedMarket.currencyCode"
                      label="Currency code"
                    />
                  </v-col>
                  <v-col cols="12" sm="12" md="6">
                    <v-text-field
                      v-model="selectedMarket.symbol"
                      label="Symbol"
                    />
                  </v-col>
                  <v-col cols="12" sm="12" md="6">
                    <v-checkbox
                      v-model="selectedMarket.updatePrices"
                      label="Update prices"
                    />
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" text @click="marketDialog = false">
                <v-icon>{{ icons.mdiClose }}</v-icon> Cancel
              </v-btn>
              <v-btn type="submit" color="primary" text>
                <v-icon>{{ icons.mdiCheck }}</v-icon> Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-dialog>

      <v-dialog v-model="taxonomyDialog" width="500">
        <v-form @submit.prevent="saveTaxonomy">
          <v-card>
            <v-card-text>
              <v-data-table
                :items="selectedSecurityTaxonomies"
                :items-per-page="-1"
                :headers="[
                  { text: 'Weight', value: 'weight' },
                  { text: 'Name', value: 'taxonomy.name' },
                  { value: 'actions' },
                ]"
                hide-default-footer
              >
                <template #item.weight="{ item }">
                  <v-text-field v-model="item.weight" suffix="%" dense />
                </template>
                <template #item.taxonomy.name="{ item }">
                  <v-select
                    v-model="item.taxonomyUuid"
                    dense
                    item-text="name"
                    item-value="uuid"
                    :items="
                      taxonomies.filter(
                        (t) => t.rootUuid === selectedTaxonomy.uuid
                      )
                    "
                  />
                </template>
                <template #item.actions="{ item }">
                  <v-btn
                    color="error"
                    icon
                    text
                    @click="
                      selectedSecurityTaxonomies =
                        selectedSecurityTaxonomies.filter((e) => e !== item)
                    "
                  >
                    <v-icon>{{ icons.mdiDelete }}</v-icon>
                  </v-btn>
                </template>
              </v-data-table>
              <v-alert
                v-if="selectedSecurityTaxonomiesSumWeights !== 100"
                dense
                type="warning"
                outlined
              >
                Weights don't sum up to 100%, but:
                {{ selectedSecurityTaxonomiesSumWeights }}%
              </v-alert>
            </v-card-text>
            <v-card-actions>
              <v-btn
                color="success"
                small
                fab
                @click="
                  selectedSecurityTaxonomies.push({
                    weight: String(100 - selectedSecurityTaxonomiesSumWeights),
                  })
                "
              >
                <v-icon>{{ icons.mdiPlus }}</v-icon>
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn color="primary" text @click="taxonomyDialog = false">
                <v-icon>{{ icons.mdiClose }}</v-icon> Cancel
              </v-btn>
              <v-btn type="submit" color="primary" text>
                <v-icon>{{ icons.mdiCheck }}</v-icon> Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-dialog>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  useAsync,
  useContext,
} from '@nuxtjs/composition-api'

import { useConfirmDialog } from '@/components/useConfirmDialog'
import icons from '@/components/icons'

export default defineComponent({
  name: 'SecurityPage',

  middleware: 'auth',

  setup() {
    const { $axios, error, params } = useContext()

    const showConfirmDialog = useConfirmDialog()

    const rawSecurity = useAsync(async () => {
      try {
        return await $axios.$get(`/securities/${params.value.uuid}`)
      } catch (err) {
        error({ statusCode: 404, message: 'This page could not be found' })
      }
    })

    const security = computed(
      () => rawSecurity.value ?? { securityTaxonomies: [] }
    )

    const rawTaxonomies = useAsync(async () => {
      return await $axios.$get<any[]>(`/taxonomies/`)
    })

    const taxonomies = computed(() => rawTaxonomies.value ?? [])

    const tab = ref('masterdata')

    const marketDialog = ref(false)
    const selectedMarket = ref({
      marketCode: '',
      currencyCode: '',
      symbol: '',
      updatePrices: false,
    })

    const selectedMarketIsNew = ref(false)

    const taxonomyDialog = ref(false)
    const selectedTaxonomy = ref<any>({})
    const selectedSecurityTaxonomies = ref<any[]>([])

    const selectedSecurityTaxonomiesSumWeights = computed(() =>
      selectedSecurityTaxonomies.value.reduce((a, b) => a + Number(b.weight), 0)
    )

    async function getSecurity() {
      rawSecurity.value = await $axios.$get(
        `/securities/${security.value.uuid}`
      )
    }

    const securityTaxonomies = computed(() => {
      // Join taxonomies to securityTaxonomies
      return security.value.securityTaxonomies.map((st: any) => ({
        ...st,
        taxonomy: taxonomies.value?.find((t) => t.uuid === st.taxonomyUuid),
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

    function editMarket(market: any) {
      selectedMarket.value = { ...market }
      selectedMarketIsNew.value = false
      marketDialog.value = true
    }

    async function saveMarket() {
      await $axios.$patch(
        `/securities/uuid/${security.value.uuid}/markets/${selectedMarket.value.marketCode}`,
        selectedMarket.value
      )

      // Update to reflect changes
      getSecurity()

      marketDialog.value = false
    }

    async function deleteMarket(market: any) {
      if (
        await showConfirmDialog(
          `Are you sure you want to delete the market "${market.marketCode}"?`,
          { title: 'Delete market', color: 'secondary' }
        )
      ) {
        await $axios.$delete(
          `/securities/uuid/${security.value.uuid}/markets/${market.marketCode}`
        )
        getSecurity()
      }
    }

    function editTaxonomy(taxonomy: any) {
      selectedTaxonomy.value = taxonomy
      const newSelectedSecurityTaxonomies = securityTaxonomies.value.filter(
        (st: any) => st.taxonomy.rootUuid === taxonomy.uuid
      )
      selectedSecurityTaxonomies.value = JSON.parse(
        JSON.stringify(newSelectedSecurityTaxonomies)
      )

      taxonomyDialog.value = true
    }

    async function saveTaxonomy() {
      await $axios.put(
        `/securities/uuid/${security.value.uuid}/taxonomies/${selectedTaxonomy.value.uuid}`,
        selectedSecurityTaxonomies.value
      )
      getSecurity()
      taxonomyDialog.value = false
    }

    return {
      security,
      taxonomies,
      tab,
      marketDialog,
      selectedMarket,
      selectedMarketIsNew,
      taxonomyDialog,
      securityTaxonomies,
      selectedTaxonomy,
      selectedSecurityTaxonomies,
      selectedSecurityTaxonomiesSumWeights,
      newMarket,
      editMarket,
      saveMarket,
      deleteMarket,
      editTaxonomy,
      saveTaxonomy,
      icons,
    }
  },

  head() {
    return { title: 'Portfolio Report Admin' }
  },
})
</script>
