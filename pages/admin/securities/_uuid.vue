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
                <v-icon>{{ mdiPencil }}</v-icon>
              </v-btn>
              <v-btn color="error" icon text @click="deleteMarket(item)">
                <v-icon>{{ mdiDelete }}</v-icon>
              </v-btn>
            </template>
          </v-data-table>

          <v-btn color="primary" @click="newMarket">
            <v-icon>{{ mdiPlus }}</v-icon> Add market
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
                <v-icon>{{ mdiPencil }}</v-icon>
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
                <v-icon>{{ mdiClose }}</v-icon> Cancel
              </v-btn>
              <v-btn type="submit" color="primary" text>
                <v-icon>{{ mdiCheck }}</v-icon> Save
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
                    <v-icon>{{ mdiDelete }}</v-icon>
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
                <v-icon>{{ mdiPlus }}</v-icon>
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn color="primary" text @click="taxonomyDialog = false">
                <v-icon>{{ mdiClose }}</v-icon> Cancel
              </v-btn>
              <v-btn type="submit" color="primary" text>
                <v-icon>{{ mdiCheck }}</v-icon> Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-dialog>

      <DialogConfirm ref="confirm" />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Vue, mixins } from 'nuxt-property-decorator'

import BtnLoading from '../../../components/btn-loading.vue'
import DialogConfirm from '../../../components/dialog-confirm.vue'
import { IconsMixin } from '@/components/icons-mixin'

@Component({
  async asyncData({ $axios, params, error }): Promise<any> {
    try {
      const security = await $axios.$get(`/securities/${params.uuid}`)
      const taxonomies = await $axios.$get(`/taxonomies/`)
      return { security, taxonomies }
    } catch (err) {
      error({ statusCode: 404, message: 'This page could not be found' })
    }
  },
  components: { BtnLoading, DialogConfirm },
  middleware: 'auth',
})
export default class SecurityPage extends mixins(Vue, IconsMixin) {
  // asyncData
  security: any
  taxonomies!: any[]

  $refs!: {
    confirm: DialogConfirm
  }

  tab = 'masterdata'

  marketDialog = false
  selectedMarket = {
    marketCode: '',
    currencyCode: '',
    symbol: '',
    updatePrices: false,
  }

  selectedMarketIsNew = false

  taxonomyDialog = false
  selectedTaxonomy: any = {}
  selectedSecurityTaxonomies: any[] = []

  get selectedSecurityTaxonomiesSumWeights() {
    return this.selectedSecurityTaxonomies.reduce(
      (a, b) => a + Number(b.weight),
      0
    )
  }

  async getSecurity() {
    this.security = await this.$axios.$get(`/securities/${this.security.uuid}`)
  }

  get securityTaxonomies() {
    // Join taxonomies to securityTaxonomies
    return this.security.securityTaxonomies.map((st: any) => ({
      ...st,
      taxonomy: this.taxonomies.find((t) => t.uuid === st.taxonomyUuid),
    }))
  }

  newMarket() {
    this.selectedMarket = {
      marketCode: '',
      currencyCode: '',
      symbol: '',
      updatePrices: true,
    }
    this.selectedMarketIsNew = true
    this.marketDialog = true
  }

  editMarket(market: any) {
    this.selectedMarket = { ...market }
    this.selectedMarketIsNew = false
    this.marketDialog = true
  }

  async saveMarket() {
    await this.$axios.$patch(
      `/securities/uuid/${this.security.uuid}/markets/${this.selectedMarket.marketCode}`,
      this.selectedMarket
    )

    // Update to reflect changes
    this.getSecurity()

    this.marketDialog = false
  }

  async deleteMarket(market: any) {
    if (
      await this.$refs.confirm.open({
        title: 'Delete market',
        message: `Are you sure you want to delete the market "${market.marketCode}"?`,
        color: 'secondary',
      })
    ) {
      await this.$axios.$delete(
        `/securities/uuid/${this.security.uuid}/markets/${market.marketCode}`
      )
      this.getSecurity()
    }
  }

  editTaxonomy(taxonomy: any) {
    this.selectedTaxonomy = taxonomy
    const selectedSecurityTaxonomies = this.securityTaxonomies.filter(
      (st: any) => st.taxonomy.rootUuid === taxonomy.uuid
    )
    this.selectedSecurityTaxonomies = JSON.parse(
      JSON.stringify(selectedSecurityTaxonomies)
    )

    this.taxonomyDialog = true
  }

  async saveTaxonomy() {
    await this.$axios.put(
      `/securities/uuid/${this.security.uuid}/taxonomies/${this.selectedTaxonomy.uuid}`,
      this.selectedSecurityTaxonomies
    )
    this.getSecurity()
    this.taxonomyDialog = false
  }

  head() {
    return {
      title: 'Portfolio Report Admin',
    }
  }
}
</script>
