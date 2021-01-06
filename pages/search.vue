<template>
  <v-row align="center" justify="center">
    <v-col cols="12" sm="8" md="6">
      <v-card>
        <v-card-title class="headline">Security search</v-card-title>
        <v-form v-model="searchFormValid" @submit.prevent="search">
          <v-card-text>
            <v-text-field
              v-model="searchTerm"
              :rules="searchRules"
              label="ISIN/WKN/Symbol/Name"
              clearable
            />
            <select-security-type v-model="securityType" />

            <v-alert v-model="noResults" type="info" outlined>
              Sorry, no results were found.
            </v-alert>

            <v-alert v-model="error" type="error" outlined>
              Sorry, there was an error:<br />{{ errorText }}
            </v-alert>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              type="submit"
              color="primary"
              :loading="searching"
              :disabled="!searchFormValid || searching"
            >
              Search
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>

      <v-card v-if="results.length > 0" class="mt-4">
        <v-card-title>Results</v-card-title>
        <v-card-text>
          <div v-for="result in results" :key="result.uuid" class="mb-3">
            <div>
              <v-tooltip v-if="getPricesAvailable(result)" left>
                <template #activator="{ on }">
                  <v-icon v-on="on">{{ mdiChartLine }}</v-icon>
                </template>
                <span>Prices available</span>
              </v-tooltip>

              <v-hover v-slot="{ hover }">
                <span>
                  <nuxt-link :to="'securities/' + result.uuid">
                    <span class="subtitle-1">{{ result.name }}</span>
                  </nuxt-link>
                  <v-chip small color="primary" text-color="white">
                    {{ result.securityType }}
                  </v-chip>
                  <span v-if="hover">
                    <v-icon>{{ mdiDragVariant }}</v-icon> Drag me to Portfolio
                    Performance!
                  </span>
                </span>
              </v-hover>
            </div>
            ISIN: <b>{{ result.isin }}</b> | WKN: <b>{{ result.wkn }}</b> |
            Symbol(s):
            <span v-for="(symbol, idx) in getUniqueSymbols(result)" :key="idx">
              <span v-if="idx != 0">, </span>
              <span>
                <b>{{ symbol }}</b>
              </span>
            </span>
          </div>
        </v-card-text>
      </v-card>

      <v-card class="mt-4">
        <v-card-title>Your contribution is needed 💪</v-card-title>
        <v-card-text>
          Your help is needed to keep this website up and running. Have you
          thought about contributing? You could:
          <ul>
            <li>
              Actively maintain and develop the
              <a href="https://www.github.com/tfabritius/pr-www"
                >source code on Github</a
              >.
            </li>
            <li>
              Become member of the
              <a href="https://forum.portfolio-performance.info">forum</a> and
              help other users.
            </li>
            <li>
              Cover monthly costs for server operation and licence fees. Become
              sponsor on
              <a href="https://github.com/sponsors/tfabritius">Github</a> or via
              <a href="https://www.paypal.me/portfolioreport">Paypal</a>.
            </li>
          </ul>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { mdiChartLine, mdiDragVariant } from '@mdi/js'

import SelectSecurityType from '@/components/select-security-type.vue'

@Component({
  components: { SelectSecurityType },
})
export default class SearchPage extends Vue {
  mdiChartLine = mdiChartLine
  mdiDragVariant = mdiDragVariant

  searchFormValid = false
  searchTerm = ''
  searchRules = [(v: string) => !!v || 'Required']
  securityType = ''

  results = []
  noResults = false
  searching = false
  error = false
  errorText = ''

  mounted() {
    // Read query parameters from URL
    const q = this.$route.query.q
    const securityType = this.$route.query.securityType || ''

    if (q) {
      this.searchTerm = q as string
      this.securityType = securityType as string
      this.search()
    }
  }

  async search() {
    this.searching = true
    this.noResults = false
    this.error = false

    // Update query parameter in URL
    const query = { q: this.searchTerm } as { q: string; securityType: string }
    if (this.securityType) {
      query.securityType = this.securityType
    }
    this.$router.push({
      path: this.$route.path,
      query,
    })

    try {
      const params = {} as { securityType: string }
      if (this.securityType) {
        params.securityType = this.securityType
      }
      const res = await this.$axios.$get(
        `/api/securities/search/${encodeURIComponent(this.searchTerm.trim())}`,
        { params }
      )

      this.searching = false
      this.results = res
      this.noResults = this.results.length === 0
    } catch (error) {
      this.searching = false
      this.results = []
      this.noResults = false
      this.error = true
      this.errorText = error.message
    }
  }

  getPricesAvailable(result: {
    markets: Array<{ firstPriceDate: string; lastPriceDate: string }>
  }): boolean {
    return result.markets.some(
      (market) => market.firstPriceDate && market.lastPriceDate
    )
  }

  getUniqueSymbols(result: {
    symbolXfra: string | null
    symbolXnas: string | null
    symbolXnys: string | null
    markets: Array<{ symbol: string | null }>
  }) {
    return Array.from(
      new Set([
        result.symbolXfra,
        result.symbolXnas,
        result.symbolXnys,
        ...result.markets?.map((m) => m.symbol),
      ])
    ).filter((s) => !!s)
  }

  head() {
    return {
      title: 'Portfolio Report Search',
    }
  }
}
</script>
