<template>
  <v-row align="center" justify="center">
    <v-col cols="12" sm="8" md="6">
      <v-card>
        <v-card-title class="headline">Security search</v-card-title>
        <v-form v-model="searchFormValid" @submit.prevent="search">
          <v-card-text>
            <v-text-field
              ref="searchTermInput"
              v-model="searchTerm"
              :rules="searchRules"
              label="ISIN/WKN/Symbol/Name"
              clearable
              outlined
              dense
            />
            <select-security-type v-model="securityType" />

            <v-btn
              type="submit"
              color="primary"
              :loading="searching"
              :disabled="!searchFormValid || searching"
              block
            >
              Search
            </v-btn>

            <v-alert v-model="noResults" type="info" outlined>
              Sorry, no results were found.
            </v-alert>

            <v-alert v-model="error" type="error" outlined>
              Sorry, there was an error:<br />{{ errorText }}
            </v-alert>
          </v-card-text>
        </v-form>
      </v-card>

      <v-card v-if="results.length > 0" class="mt-4">
        <v-card-title>Results</v-card-title>
        <v-card-text>
          <div v-for="result in results" :key="result.uuid" class="mb-3">
            <div>
              <v-tooltip v-if="getPricesAvailable(result)" left>
                <template #activator="{ on }">
                  <v-icon v-on="on">{{ icons.mdiChartLine }}</v-icon>
                </template>
                <span>Prices available</span>
              </v-tooltip>

              <v-hover v-slot="{ hover }">
                <span>
                  <nuxt-link :to="'/securities/' + result.uuid">
                    <span class="subtitle-1">{{ result.name }}</span>
                  </nuxt-link>
                  <v-chip small color="primary" text-color="white">
                    {{ result.securityType }}
                  </v-chip>
                  <SecurityTag
                    v-for="tag in result.tags"
                    :key="tag"
                    :name="tag"
                  />
                  <span v-if="hover">
                    <v-icon>{{ icons.mdiDragVariant }}</v-icon> Drag me to
                    Portfolio Performance!
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
              <a href="https://www.github.com/portfolio-report"
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
              <a href="https://github.com/sponsors/tfabritius">Github</a>.
            </li>
          </ul>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  ref,
  useContext,
  useRoute,
  useRouter,
} from '@nuxtjs/composition-api'

import icons from '@/components/icons'
import SelectSecurityType from '@/components/select-security-type.vue'
import SecurityTag from '@/components/SecurityTag.vue'

export default defineComponent({
  name: 'SearchPage',

  components: { SelectSecurityType, SecurityTag },

  setup() {
    const route = useRoute()
    const router = useRouter()
    const { $axios } = useContext()

    const searchTermInput = ref<HTMLInputElement | null>(null)

    const searchFormValid = false
    const searchTerm = ref('')
    const searchRules = [(v: string) => !!v || 'Required']
    const securityType = ref('')

    const results = ref<
      {
        uuid: string
        name: string
        isin: string
        wkn: string
        securityType: string
        symbolXfra: string | null
        symbolXnas: string | null
        symbolXnys: string | null
        markets: Array<{
          firstPriceDate: string
          lastPriceDate: string
          symbol: string | null
        }>
      }[]
    >([])
    const noResults = ref(false)
    const searching = ref(false)
    const error = ref(false)
    const errorText = ref('')

    onMounted(() => {
      // Read query parameters from URL
      const q = route.value.query.q

      if (q) {
        searchTerm.value = q as string
        securityType.value = (route.value.query.securityType || '') as string
        search()
      } else {
        searchTermInput.value?.focus()
      }
    })

    async function search() {
      searching.value = true
      noResults.value = false
      error.value = false

      // Update query parameter in URL
      const query = { q: searchTerm.value } as {
        q: string
        securityType: string
      }
      if (securityType.value) {
        query.securityType = securityType.value
      }
      router.push({
        path: route.value.path,
        query,
      })

      try {
        const params = {} as { securityType: string }
        if (securityType.value) {
          params.securityType = securityType.value
        }
        const res = await $axios.$get(
          `/securities/search/${encodeURIComponent(searchTerm.value.trim())}`,
          { params }
        )

        searching.value = false
        results.value = res
        noResults.value = res.length === 0
      } catch (err) {
        searching.value = false
        results.value = []
        noResults.value = false
        error.value = true
        errorText.value = String(err)
      }
    }

    function getPricesAvailable(result: {
      markets: Array<{ firstPriceDate: string; lastPriceDate: string }>
    }): boolean {
      return result.markets.some(
        (market) => market.firstPriceDate && market.lastPriceDate
      )
    }

    function getUniqueSymbols(result: {
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

    return {
      icons,
      search,
      searchTerm,
      searchTermInput,
      searchFormValid,
      searchRules,
      securityType,
      searching,
      noResults,
      error,
      errorText,
      results,
      getPricesAvailable,
      getUniqueSymbols,
    }
  },

  head() {
    return {
      title: 'Portfolio Report Search',
    }
  },
})
</script>
