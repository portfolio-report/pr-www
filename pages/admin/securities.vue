<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-toolbar color="primary" dark>
        <v-toolbar-title>Securities</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-menu bottom left offset-y :close-on-content-click="false">
          <template v-slot:activator="{ on }">
            <v-btn icon color="primary" v-on="on">
              <v-icon>{{
                pagination.search || pagination.securityType
                  ? 'mdi-filter'
                  : 'mdi-filter-outline'
              }}</v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-list>
              <v-subheader>Search</v-subheader>
              <v-list-tile>
                <v-list-tile-content>
                  <v-text-field
                    v-model="pagination.search"
                    append-icon="mdi-magnify"
                    clearable
                    single-line
                  />
                </v-list-tile-content>
              </v-list-tile>
              <v-divider />
              <v-subheader>Security type</v-subheader>
              <v-list-tile>
                <v-list-tile-content>
                  <v-select
                    v-model="pagination.securityType"
                    :items="securityTypeItems"
                  />
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-card>
        </v-menu>
      </v-toolbar>

      <v-data-table
        :headers="headers"
        :items="entries"
        :pagination.sync="pagination"
        :total-items="pagination.totalItems"
        :rows-per-page-items="rowsPerPageItems"
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
import { debounce } from 'lodash-es'
export default {
  layout: 'admin',
  head() {
    return {
      title: 'Portfolio Report Admin'
    }
  },
  data() {
    return {
      headers: [
        {
          text: 'UUID',
          value: 'uuid'
        },
        {
          text: 'Name',
          align: 'left',
          sortable: true,
          value: 'name'
        },
        { text: 'ISIN', value: 'isin' },
        { text: 'WKN', value: 'wkn' },
        { text: 'Type', value: 'security_type' }
      ],
      entries: [],
      securityTypeItems: [
        { text: '', value: '' },
        { text: 'share', value: 'share' },
        { text: 'bond', value: 'bond' }
      ],
      searchQuery: '',
      pagination: {
        rowsPerPage: 10,
        descending: false,
        sortBy: 'name',
        page: 1,
        totalItems: 0,
        search: '',
        securityType: ''
      },
      loading: false,
      rowsPerPageItems: [10, 25, 50, 100]
    }
  },
  watch: {
    pagination: {
      handler() {
        this.getSecurities()
      },
      deep: true
    }
  },
  methods: {
    getSecurities: debounce(async function() {
      this.loading = true

      const res = await this.$axios.$get('/api/securities', {
        params: {
          sort: this.pagination.sortBy,
          skip: this.pagination.rowsPerPage * (this.pagination.page - 1),
          limit: this.pagination.rowsPerPage,
          desc: this.pagination.descending,
          search: this.pagination.search,
          security_type: this.pagination.securityType
        }
      })
      this.entries = res.entries
      this.pagination.totalItems = res.params.totalCount

      this.loading = false
    }, 300) // debounce 300ms
  }
}
</script>
