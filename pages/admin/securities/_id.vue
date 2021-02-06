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
      </v-tabs>

      <v-tabs-items v-model="tab">
        <v-tab-item key="masterdata">
          <ul>
            <li>
              ID: <b>{{ security.id }}</b>
            </li>
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

      <DialogConfirm ref="confirm" />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Vue, mixins } from 'nuxt-property-decorator'

import { IconsMixin } from '@/components/icons-mixin'
import BtnLoading from '../../../components/btn-loading.vue'
import DialogConfirm from '../../../components/dialog-confirm.vue'

@Component({
  async asyncData({ $axios, params, error }): Promise<any> {
    try {
      const security = await $axios.$get(`/api/securities/${params.id}`)
      return { security }
    } catch (err) {
      error({ statusCode: 404, message: 'This page could not be found' })
    }
  },
  layout: 'admin',
  components: { BtnLoading, DialogConfirm },
})
export default class SecurityPage extends mixins(Vue, IconsMixin) {
  // asyncData
  security: any

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

  async getSecurity() {
    this.security = await this.$axios.$get(
      `/api/securities/${this.security.id}`
    )
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
      `/api/securities/uuid/${this.security.uuid}/markets/${this.selectedMarket.marketCode}`,
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
        `/api/securities/uuid/${this.security.uuid}/markets/${market.marketCode}`
      )
      this.getSecurity()
    }
  }

  head() {
    return {
      title: 'Portfolio Report Admin',
    }
  }
}
</script>
