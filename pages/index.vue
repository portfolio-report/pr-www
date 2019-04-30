<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-card>
        <v-card-title class="headline">
          Security search
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="searchTerm"
            label="ISIN/WKN/Symbol/Name"
            clearable
            append-icon="search"
            @keyup.enter="search"
          />
          <v-select
            v-model="securityType"
            :items="securityTypeItems"
            label="Security type"
          />
          <v-btn
            color="primary"
            small
            :loading="searching"
            :disabled="searching"
            @click="search"
          >
            Search
          </v-btn>

          <v-alert v-model="noResults" type="info" outline>
            Sorry, no results were found.
          </v-alert>

          <v-alert v-model="error" type="error" outline>
            Sorry, there was an error:<br />{{ errorText }}
          </v-alert>

          <v-card v-for="result in results" :key="result.uuid">
            <v-card-title>
              <span>{{ result.name }}</span>
              <v-chip small color="primary" text-color="white">
                {{ result.security_type }}
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
                <li v-if="result.markets['XFRA']">
                  Symbol (Frankfurt):
                  <b>{{ result.markets['XFRA'].symbol }}</b>
                </li>
                <li v-if="result.markets['XNAS']">
                  Symbol (NASDAQ):
                  <b>{{ result.markets['XNAS'].symbol }}</b>
                </li>
                <li v-if="result.markets['XNYS']">
                  Symbol (New York):
                  <b>{{ result.markets['XNYS'].symbol }}</b>
                </li>
              </ul>
            </v-card-text>
          </v-card>

          <v-alert v-model="resultsLimited" type="warning" outline>
            Output limited to 10 results.
          </v-alert>
        </v-card-text>
        <v-card-actions></v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      searchTerm: '',
      securityType: 'share',
      securityTypeItems: [
        { text: 'share', value: 'share' },
        { text: 'bond', value: 'bond' },
        { text: '[all]', value: '' }
      ],
      results: [],
      noResults: false,
      searching: false,
      error: false,
      errorText: ''
    }
  },
  computed: {
    resultsLimited: {
      get: function() {
        return this.results.length === 10
      }
    }
  },
  methods: {
    search: function() {
      this.searching = true
      this.noResults = false
      this.error = false
      fetch(
        `/api/securities/search/${encodeURIComponent(
          this.searchTerm.trim()
        )}?type=${encodeURIComponent(this.securityType)}`
      )
        .then(res => {
          if (res.ok) {
            return res
          } else {
            throw Error(res.statusText)
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
    }
  }
}
</script>
