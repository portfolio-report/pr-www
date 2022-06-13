<template>
  <v-row align="center" justify="center">
    <v-col cols="12" sm="8" md="6">
      <div class="headline">
        {{ security.name }}
        <v-btn
          v-if="$auth.loggedIn"
          color="primary"
          icon
          text
          @click="editSecurity(security)"
        >
          <v-icon>{{ icons.mdiPencil }}</v-icon>
        </v-btn>
      </div>

      <v-tooltip right>
        <template #activator="{ on }">
          <v-btn
            color="primary"
            max-width="400"
            nuxt
            :to="$route.path"
            class="mt-2"
            style="cursor: move"
            v-on="on"
          >
            <v-icon>{{ icons.mdiDragVariant }}</v-icon> Add to Portfolio
            Performance
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
        <v-tab v-if="security.events && security.events.length" key="events">
          Events
        </v-tab>

        <v-tab-item key="overview">
          <ul>
            <li v-if="$auth.loggedIn">
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
              <v-chip small color="primary" text-color="white">
                {{ security.securityType }}
              </v-chip>
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
        </v-tab-item>

        <v-tab-item key="prices">
          <v-select
            v-model="selectedMarketcode"
            label="Market"
            :items="markets"
            item-value="marketCode"
          >
            <template #selection="{ item }">
              {{ item.name }} - {{ item.marketCode }}
            </template>
            <template #item="{ item }">
              {{ item.name }} - {{ item.marketCode }}
            </template>
          </v-select>

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

            <prices-table :prices="selectedMarket.prices" />
          </div>
        </v-tab-item>

        <v-tab-item key="events">
          <v-simple-table>
            <template #default>
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
import {
  computed,
  defineComponent,
  ref,
  useAsync,
  useContext,
  useMeta,
  useRoute,
  watch,
} from '@nuxtjs/composition-api'

import icons from '@/components/icons'
import PricesTable from '@/components/prices-table.vue'
import { useSecurityDialog } from '@/components/SecurityDialogProvider.vue'
import SecurityTag from '@/components/SecurityTag.vue'

export default defineComponent({
  name: 'SecurityPage',

  components: { PricesTable, SecurityTag },

  setup() {
    const selectedMarketcode = ref('')
    const selectedMarket = ref<any>(null)

    const createSecurityDialog = useSecurityDialog()

    const route = useRoute()

    const { $axios, error, params } = useContext()
    const rawSecurity = useAsync(async () => {
      try {
        return await $axios.$get(`/securities/uuid/${params.value.uuid}`)
      } catch (err) {
        error({ statusCode: 404, message: 'This page could not be found' })
      }
    })

    const security = computed(() => rawSecurity.value ?? {})

    async function editSecurity(security: any) {
      const ret = await createSecurityDialog(security)
      if (ret) {
        security.value = { ...security.value, ...ret }
      }
    }

    const markets = computed(() => {
      return security.value?.markets?.map((market: any) => {
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
      selectedMarket.value = await $axios.$get(
        `/securities/uuid/${route.value.params.uuid}/markets/${selectedMarketcode}`,
        { params: { from: '2000-01-01' } }
      )
    })

    useMeta(() => ({
      title: security.value?.name + ' - Portfolio Report',
    }))

    return {
      security,
      markets,
      selectedMarket,
      selectedMarketcode,
      editSecurity,
      icons,
    }
  },

  head: {},
})
</script>
