<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-toolbar color="primary" dark>
        <v-toolbar-title>
          {{ showStagedEntries ? 'Staged' : '' }} Securities
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-menu bottom left offset-y :close-on-content-click="false">
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on">
              <v-icon>{{
                securitySearch || securityType
                  ? 'mdi-filter'
                  : 'mdi-filter-outline'
              }}</v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-list>
              <v-subheader>Search</v-subheader>
              <v-list-item>
                <v-list-item-content>
                  <v-text-field
                    v-model="securitySearch"
                    append-icon="mdi-magnify"
                    clearable
                    single-line
                  />
                </v-list-item-content>
              </v-list-item>
              <v-divider />
              <v-subheader>Security type</v-subheader>
              <v-list-item>
                <v-list-item-content>
                  <v-select v-model="securityType" :items="securityTypeItems" />
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </v-toolbar>

      <v-switch
        v-model="showStagedEntries"
        label="Staged entries"
        color="primary"
      />

      <v-data-table
        :headers="headers"
        :items="entries"
        :options.sync="pagination"
        :server-items-length="totalItems"
        :footer-props="footerProps"
        :loading="loading"
      >
        <template v-slot:items="props">
          <td>{{ props.item.uuid }}</td>
          <td>{{ props.item.name }}</td>
          <td>{{ props.item.isin }}</td>
          <td>{{ props.item.wkn }}</td>
          <td>{{ props.item.security_type }}</td>
        </template>
      </v-data-table>
    </v-flex>
  </v-layout>
</template>

<script>
import debounce from 'lodash/debounce'
export default {
  layout: 'admin',
  head() {
    return {
      title: 'Portfolio Report Admin',
    }
  },
  data() {
    return {
      showStagedEntries: false,
      headers: [
        {
          text: 'UUID',
          value: 'uuid',
        },
        {
          text: 'Name',
          align: 'left',
          sortable: true,
          value: 'name',
        },
        { text: 'ISIN', value: 'isin' },
        { text: 'WKN', value: 'wkn' },
        { text: 'Type', value: 'security_type' },
      ],
      entries: [],
      securityTypeItems: [
        { text: '', value: '' },
        { text: 'share', value: 'share' },
        { text: 'bond', value: 'bond' },
      ],
      searchQuery: '',
      pagination: {
        'items-per-page': 10,
        sortBy: ['name'],
        sortDesc: [false],
        page: 1,
      },
      securitySearch: '',
      securityType: '',
      totalItems: 0,
      loading: false,
      footerProps: { 'items-per-page-options': [10, 25, 50, 100] },
    }
  },
  watch: {
    pagination: {
      handler() {
        this.getSecurities()
      },
      deep: true,
    },
    securitySearch() {
      this.getSecurities()
    },
    securityType() {
      this.getSecurities()
    },
    showStagedEntries() {
      this.getSecurities()
    },
  },
  methods: {
    getSecurities: debounce(async function() {
      this.loading = true

      const url = this.showStagedEntries
        ? '/api/securities-staging'
        : '/api/securities'

      const res = await this.$axios.$get(url, {
        params: {
          sort: this.pagination.sortBy[0],
          skip: this.pagination['items-per-page'] * (this.pagination.page - 1),
          limit: this.pagination['items-per-page'],
          desc: this.pagination.sortDesc[0],
          search: this.securitySearch,
          security_type: this.securityType,
        },
      })
      this.entries = res.entries
      this.totalItems = res.params.totalCount

      this.loading = false
    }, 300), // debounce 300ms
  },
}
</script>
