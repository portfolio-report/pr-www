<template>
  <v-layout justify-center align-center>
    <v-flex xs12 sm8 md6>
      <span class="headline">Security: {{ security.name }}</span>
      <v-card>
        <v-card-title>Master data</v-card-title>
        <v-card-subtitle>ID: {{ security.id }}</v-card-subtitle>
        <v-card-text>
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
        </v-card-text>
      </v-card>

      <v-card
        v-for="market in security.markets"
        :key="market.marketCode"
        class="mt-4"
      >
        <v-card-title>
          {{ market.marketCode }}
          <v-spacer />
          <v-icon @click="editMarket(market)">
            mdi-pencil
          </v-icon>
          <v-icon @click="deleteMarket(market)">
            mdi-delete
          </v-icon>
        </v-card-title>
        <v-card-text>
          <ul>
            <li>
              Market code: <b>{{ market.marketCode }}</b>
            </li>
            <li>
              Currency code: <b>{{ market.currencyCode }}</b>
            </li>
            <li>
              Symbol: <b>{{ market.symbol }}</b>
            </li>
            <li>
              Prices available: <b>{{ market.firstPriceDate }}</b> -
              <b>{{ market.lastPriceDate }}</b>
            </li>
            <li>
              Update prices: <b>{{ market.updatePrices }}</b>
            </li>
          </ul>
        </v-card-text>
      </v-card>

      <v-dialog v-model="showEditMarketDialog" max-width="600">
        <v-card>
          <v-card-title>{{ editedMarket.marketCode }}</v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="12" md="6">
                  <v-text-field
                    v-model="editedMarket.currencyCode"
                    label="Currency code"
                  />
                </v-col>
                <v-col cols="12" sm="12" md="6">
                  <v-text-field v-model="editedMarket.symbol" label="Symbol" />
                </v-col>
                <v-col cols="12" sm="12" md="6">
                  <v-checkbox
                    v-model="editedMarket.updatePrices"
                    label="Update prices"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="closeEditMarketDialog">
              Cancel
            </v-btn>
            <v-btn color="primary" @click="saveEditMarketDialog">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <DialogConfirm ref="confirm" />

      <v-card class="mt-4">
        <v-form>
          <v-card-title>Add market</v-card-title>
          <v-card-text>
            <v-text-field v-model="newMarketCode" label="Market code (MIC)" />
            <v-text-field v-model="newCurrencyCode" label="Currency code" />
            <v-text-field v-model="newSymbol" label="Symbol" />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <btn-loading type="submit" color="primary" :action="addMarket">
              Add
            </btn-loading>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
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
export default class SecurityPage extends Vue {
  // asyncData
  security: any

  newMarketCode: string = ''
  newCurrencyCode: string = ''
  newSymbol: string = ''

  showEditMarketDialog = false
  editedMarket = {
    marketCode: '',
    currencyCode: '',
    symbol: '',
    updatePrices: false,
  }

  async getSecurity() {
    this.security = await this.$axios.$get(
      `/api/securities/${this.security.id}`
    )
  }

  editMarket(market: any) {
    // Edit a copy of the object
    this.editedMarket = Object.assign({}, market)
    this.showEditMarketDialog = true
  }

  async saveEditMarketDialog() {
    await this.$axios.$patch(
      `/api/securities/${this.security.id}/markets/${this.editedMarket.marketCode}`,
      this.editedMarket
    )

    // Update to reflect changes
    this.getSecurity()

    this.showEditMarketDialog = false
  }

  closeEditMarketDialog() {
    this.showEditMarketDialog = false
  }

  async deleteMarket(market: any) {
    if (
      await (this.$refs.confirm as any).open({
        title: 'Delete market',
        message: `Are you sure you want to delete the market "${market.marketCode}"?`,
        color: 'secondary',
      })
    ) {
      await this.$axios.$delete(
        `/api/securities/${this.security.id}/markets/${market.marketCode}`
      )
      this.getSecurity()
    }
  }

  async addMarket() {
    await this.$axios.$patch(
      `/api/securities/${this.security.id}/markets/${this.newMarketCode}`,
      {
        currencyCode: this.newCurrencyCode,
        symbol: this.newSymbol,
      }
    )

    await this.getSecurity()

    this.newMarketCode = ''
    this.newCurrencyCode = ''
    this.newSymbol = ''
  }

  head() {
    return {
      title: 'Portfolio Report Admin',
    }
  }
}
</script>
