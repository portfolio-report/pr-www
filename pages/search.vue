<template>
  <v-layout justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-card>
        <v-card-title class="headline">
          Security search
        </v-card-title>
        <v-form v-model="searchFormValid" @submit.prevent="search">
          <v-card-text>
            <v-text-field
              v-model="searchTerm"
              :rules="searchRules"
              label="ISIN/WKN/Symbol/Name"
              clearable
              append-icon="mdi-magnify"
            />
            <v-select
              v-model="securityType"
              :items="securityTypeItems"
              label="Security type"
            />

            <v-alert v-model="noResults" type="info" outlined>
              Sorry, no results were found.
            </v-alert>

            <v-alert v-model="error" type="error" outlined>
              Sorry, there was an error:<br />{{ errorText }}
            </v-alert>

            <v-alert v-model="resultsLimited" type="warning" outlined>
              Output limited to 10 results.
            </v-alert>
          </v-card-text>
          <v-card-actions>
            <v-btn to="/contact" x-small>Get in contact</v-btn>
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

      <v-card v-for="result in results" :key="result.uuid" class="mt-4">
        <v-card-title>
          <span>{{ result.name }}</span>
          <v-chip small color="primary" text-color="white">
            {{ result.securityType }}
          </v-chip>
        </v-card-title>
        <v-card-text>
          <ul>
            <li>
              ISIN: <b>{{ result.isin }}</b>
            </li>
            <li>
              WKN: <b>{{ result.wkn }}</b>
            </li>
            <li v-if="result.symbolXfra">
              Symbol (Frankfurt):
              <b>{{ result.symbolXfra }}</b>
            </li>
            <li v-if="result.symbolXnas">
              Symbol (NASDAQ):
              <b>{{ result.symbolXnas }}</b>
            </li>
            <li v-if="result.symbolXnys">
              Symbol (New York):
              <b>{{ result.symbolXnys }}</b>
            </li>
          </ul>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  head() {
    return {
      title: 'Portfolio Report',
    }
  },
  data() {
    return {
      searchFormValid: false,
      searchTerm: '',
      searchRules: [v => !!v || 'Required'],
      securityType: 'share',
      securityTypeItems: [
        { text: 'share', value: 'share' },
        { text: 'bond', value: 'bond' },
        { text: '[all]', value: '' },
      ],
      results: [],
      noResults: false,
      searching: false,
      error: false,
      errorText: '',
    }
  },
  computed: {
    resultsLimited: {
      get() {
        return this.results.length === 10
      },
    },
  },
  mounted() {
    // Read query parameters from URL
    const q = this.$route.query.q
    const securityType = this.$route.query.securityType

    if (securityType !== undefined) {
      this.securityType = securityType
    }

    if (q) {
      this.searchTerm = this.$route.query.q
      this.search()
    }
  },
  methods: {
    search() {
      this.searching = true
      this.noResults = false
      this.error = false

      // Update query parameter in URL
      this.$router.push({
        path: this.$route.path,
        query: { q: this.searchTerm, securityType: this.securityType },
      })

      fetch(
        `/api/securities/search/${encodeURIComponent(
          this.searchTerm.trim()
        )}?securityType=${encodeURIComponent(this.securityType)}`
      )
        .then(res => {
          if (res.ok) {
            return res
          } else {
            throw new Error(res.statusText)
          }
        })
        .then(res => res.json())
        .then(res => {
          this.searching = false
          this.results = res
          this.noResults = this.results.length === 0
        })
        .catch(error => {
          this.searching = false
          this.results = []
          this.noResults = false
          this.error = true
          this.errorText = error.message
        })
    },
  },
}
</script>
