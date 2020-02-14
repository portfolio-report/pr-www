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
        <v-card-title>{{ market.marketCode }}</v-card-title>
        <v-card-text>
          <ul>
            <li>
              Market code: <b>{{ market.marketCode }}</b>
            </li>
            <li>
              Currency code: <b>{{ market.currencyCode }}</b>
            </li>
            <li>
              Prices available: <b>{{ market.firstPriceDate }}</b> -
              <b>{{ market.lastPriceDate }}</b>
            </li>
          </ul>
        </v-card-text>
      </v-card>

      <v-card class="mt-4">
        <v-card-title>Add market</v-card-title>
        <v-card-text>
          <v-text-field v-model="newMarketCode" label="Market code (MIC)" />
          <v-text-field v-model="newCurrencyCode" label="Currency code" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="addMarket">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

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
})
export default class SecurityPage extends Vue {
  // asyncData
  security: any

  newMarketCode: string = ''
  newCurrencyCode: string = ''

  async addMarket() {
    await this.$axios.$patch(
      `/api/securities/${this.security.id}/markets/${this.newMarketCode}`,
      { currencyCode: this.newCurrencyCode }
    )

    this.security = await this.$axios.$get(
      `/api/securities/${this.security.id}`
    )

    this.newMarketCode = ''
    this.newCurrencyCode = ''
  }

  head() {
    return {
      title: 'Portfolio Report Admin',
    }
  }
}
</script>
