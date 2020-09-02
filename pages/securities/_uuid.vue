<template>
  <v-row align="center" justify="center">
    <v-col cols="12" sm="8" md="6">
      <div class="headline">{{ security.name }}</div>

      <v-tooltip right>
        <template v-slot:activator="{ on }">
          <v-btn
            color="primary"
            max-width="400"
            nuxt
            :to="$route.path"
            class="mt-2"
            style="cursor: move"
            v-on="on"
          >
            <v-icon>{{ mdiDragVariant }}</v-icon> Add to Portfolio Performance
          </v-btn>
        </template>
        <div>
          <div class="title">Drag and drop!</div>
          To add this security in Portfolio<br />
          Performance, drag and drop it to<br />
          securities list or statement of assets.
        </div>
      </v-tooltip>

      <v-tabs grow>
        <v-tab key="overview">Overview</v-tab>
        <v-tab key="prices">Prices</v-tab>
        <v-tab key="events">Events</v-tab>

        <v-tab-item key="overview">
          <ul>
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

        <v-tab-item key="prices">
          <div v-for="market in markets" :key="market.marketCode" class="mt-4">
            <span class="title">{{ market.name }}</span>
            <ul>
              <li>
                Code: <b>{{ market.marketCode }}</b>
              </li>
              <li>
                Symbol: <b>{{ market.symbol }}</b>
              </li>
              <li>
                Currency: <b>{{ market.currencyCode || '-' }}</b>
              </li>
              <li>
                Prices available: <b>{{ market.firstPriceDate }}</b> -
                <b>{{ market.lastPriceDate }}</b>
              </li>
            </ul>
          </div>
        </v-tab-item>

        <v-tab-item key="events">
          <v-simple-table>
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">Date</th>
                  <th class="text-left">Type</th>
                  <th class="text-left">...</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="event in security.events"
                  :key="event.date + event.type"
                >
                  <td>{{ event.date }}</td>
                  <td style="text-transform: capitalize">{{ event.type }}</td>
                  <td>
                    {{
                      event.type === 'dividend'
                        ? event.amount + ' ' + event.currencyCode
                        : ''
                    }}
                    {{ event.type === 'split' ? event.ratio : '' }}
                  </td>
                </tr>
                <tr v-if="security.events.length === 0">
                  <td colspan="3">No events available</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-tab-item>
      </v-tabs>

      <v-tabs-items> </v-tabs-items>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { mdiDragVariant } from '@mdi/js'

@Component({
  async asyncData({ $axios, params, error }): Promise<any> {
    try {
      const security = await $axios.$get(`/api/securities/uuid/${params.uuid}`)
      return { security }
    } catch (err) {
      error({ statusCode: 404, message: 'This page could not be found' })
    }
  },
})
export default class SecurityPage extends Vue {
  mdiDragVariant = mdiDragVariant

  // asyncData
  security: any

  head() {
    return {
      title: this.security.name + ' - Portfolio Report',
    }
  }

  get markets() {
    return this.security.markets.map((market: any) => {
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
  }
}
</script>
