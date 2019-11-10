<template>
  <v-layout column justify-center>
    <v-flex xs12 sm8 md6>
      <v-tabs slider-color="secondary" grow>
        <v-tab key="prepare">Prepare</v-tab>
        <v-tab key="compare">Compare</v-tab>

        <v-tab-item key="prepare">
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-card>
                  <v-card-title>Statistics</v-card-title>
                  <v-card-text>
                    <v-list>
                      <v-list-item
                        v-for="x in [
                          { label: 'Securities', var: stats.countSecurities },
                          {
                            label: 'Duplicate ISINs in securities',
                            var: stats.duplicateIsins.length,
                          },
                          {
                            label: 'Staged securities',
                            var: stats.countStagedSecurities,
                          },
                          {
                            label: 'Duplicate ISINs in staged securities',
                            var: stats.duplicateIsinsStaged.length,
                          },
                          {
                            label: 'Staged securities without UUID',
                            var: stats.countStagedSecuritiesNoUuid,
                          },
                        ]"
                        :key="x.label"
                      >
                        <v-list-item-title>
                          {{ x.var }}
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          {{ x.label }}
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12">
                <v-card>
                  <v-card-title>Delete</v-card-title>
                  <v-card-text>
                    Before starting a new staging, you should delete the
                    database.
                  </v-card-text>
                  <v-card-actions>
                    <DialogConfirm ref="confirm" />
                    <v-btn
                      color="primary"
                      :disabled="loadingDelete"
                      :loading="loadingDelete"
                      @click="deleteStaging"
                    >
                      Delete staged securities
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>

              <v-col cols="12">
                <v-card>
                  <v-card-title>Import</v-card-title>
                  <v-card-text>
                    <p>
                      Download list of all tradable instruments from
                      <a
                        target="_blank"
                        href="https://www.xetra.com/xetra-en/instruments/instruments"
                        >Xetra</a
                      >.
                    </p>

                    <p>
                      Read file: <input type="file" @change="openImportFile" />
                    </p>

                    <p v-if="importFileContent">
                      Content: "{{ importFileContent.substring(0, 50) }}..."
                      <br />
                      Size: {{ Math.round(importFileContent.length / 1024) }} kB
                    </p>

                    <v-btn
                      color="primary"
                      :disabled="loadingImport || !importFileContent"
                      :loading="loadingImport"
                      @click="importFile"
                      >Import</v-btn
                    >
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12">
                <v-card>
                  <v-card-title>Match</v-card-title>
                  <v-card-text>
                    Match current with staged securities
                  </v-card-text>
                  <v-card-actions>
                    <DialogConfirm ref="confirm" />
                    <v-btn
                      color="primary"
                      :disabled="loadingMatch"
                      :loading="loadingMatch"
                      @click="matchStagedSecurities"
                    >
                      Match by ISIN
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-tab-item>

        <v-tab-item key="compare">
          <v-data-table
            :headers="headers"
            :items="entries"
            :options.sync="pagination"
            :server-items-length="totalItems"
            :footer-props="footerProps"
            :loading="loading"
            dense
          >
            <template v-slot:item.name="{ item }">
              <span :class="{ 'red--text': item.name != item.nameStaged }">
                {{ item.name }}
              </span>
            </template>
            <template v-slot:item.nameStaged="{ item }">
              <span v-if="item.name != item.nameStaged">
                {{ item.nameStaged }}
              </span>
            </template>

            <template v-slot:item.isin="{ item }">
              <span :class="{ 'red--text': item.isin != item.isinStaged }">
                {{ item.isin }}
              </span>
            </template>
            <template v-slot:item.isinStaged="{ item }">
              <span v-if="item.isin != item.isinStaged">
                {{ item.isinStaged }}
              </span>
            </template>

            <template v-slot:item.wkn="{ item }">
              <span :class="{ 'red--text': item.wkn != item.wknStaged }">
                {{ item.wkn }}
              </span>
            </template>
            <template v-slot:item.wknStaged="{ item }">
              <span v-if="item.wkn != item.wknStaged">
                {{ item.wknStaged }}
              </span>
            </template>
          </v-data-table>
        </v-tab-item>
      </v-tabs>
    </v-flex>
  </v-layout>
</template>

<script>
import debounce from 'lodash/debounce'
import DialogConfirm from '../../../components/dialog-confirm'

export default {
  layout: 'admin',
  components: { DialogConfirm },
  head() {
    return {
      title: 'Portfolio Report Admin',
    }
  },
  data() {
    return {
      stats: {
        countSecurities: null,
        countStagedSecurities: null,
        countStagedSecuritiesNoUuid: null,
        duplicateIsins: [],
        duplicateIsinsStaged: [],
      },
      importFileContent: '',
      loadingDelete: false,
      loadingImport: false,
      loadingMatch: false,
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
        {
          text: 'Name (staged)',
          align: 'left',
          sortable: true,
          value: 'nameStaged',
        },
        { text: 'ISIN', value: 'isin' },
        { text: 'ISIN (staged)', value: 'isinStaged' },
        { text: 'WKN', value: 'wkn' },
        { text: 'WKN (staged)', value: 'wknStaged' },
      ],
      entries: [],
      pagination: {
        itemsPerPage: 10,
        sortBy: ['name'],
        sortDesc: [false],
        page: 1,
      },
      totalItems: 0,
      loading: false,
      footerProps: { 'items-per-page-options': [10, 25, 50, 100] },
    }
  },
  watch: {
    pagination: {
      handler() {
        this.updateEntries()
      },
      deep: true,
    },
  },
  mounted() {
    this.updateStats()
  },
  methods: {
    updateEntries: debounce(async function() {
      this.loading = true

      const res = await this.$axios.$get(
        '/api/securities-staging/compare/changes',
        {
          params: {
            sort: this.pagination.sortBy[0],
            skip: this.pagination.itemsPerPage * (this.pagination.page - 1),
            limit: this.pagination.itemsPerPage,
            desc: this.pagination.sortDesc[0],
          },
        }
      )
      this.entries = res.entries
      this.totalItems = res.params.totalCount

      this.loading = false
    }, 300), // debounce 300ms

    /**
     * Update statistics data from API
     */
    async updateStats() {
      this.stats = await this.$axios.$get('/api/securities-staging/stats')
    },

    /**
     * Delete all staged securities via API
     */
    async deleteStaging() {
      this.loadingDelete = true
      if (
        await this.$refs.confirm.open({
          title: 'Delete staged securities',
          message: 'Are you sure you want to delete all staged securities?',
          color: 'secondary',
        })
      ) {
        await this.$axios.$delete(`/api/securities-staging`)
        await this.updateStats()
      }
      this.loadingDelete = false
    },

    /**
     * Read file
     */
    async openImportFile(event) {
      this.importFileContent = null

      function readAsTextAsync(file) {
        return new Promise((resolve, reject) => {
          const fr = new FileReader()
          fr.onload = e => resolve(e.target.result)
          fr.readAsText(file)
        })
      }
      this.importFileContent = await readAsTextAsync(event.target.files[0])
    },

    /**
     * Send content of the file to API
     */
    async importFile() {
      this.loadingImport = true
      await this.$axios.post(
        '/api/securities-staging',
        this.importFileContent,
        {
          headers: { 'Content-Type': 'text/plain' },
          params: {
            sourceFormat: 'xetra',
          },
        }
      )
      await this.updateStats()
      this.loadingImport = false
    },

    /**
     * Compare current with staged securities
     */
    async matchStagedSecurities() {
      this.loadingMatch = true
      await this.$axios.post('/api/securities-staging/match/isin')
      await this.updateStats()
      this.loadingMatch = false
    },
  },
}
</script>
