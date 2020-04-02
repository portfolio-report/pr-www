<template>
  <v-layout column justify-center>
    <v-flex xs12 sm8 md6>
      <v-tabs slider-color="secondary" grow>
        <v-tab key="prepare">Prepare</v-tab>
        <v-tab key="changed">Changed securities</v-tab>
        <v-tab key="added-removed">Added/removed securities</v-tab>

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
                    <btn-loading color="primary" :action="deleteStaging">
                      Delete staged securities
                    </btn-loading>
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

                      <v-progress-linear v-model="uploadProgress" height="25">
                        <strong>{{ Math.ceil(uploadProgress) }}%</strong>
                      </v-progress-linear>
                    </p>

                    <btn-loading
                      color="primary"
                      :action="importFile"
                      :disabled="!importFileContent"
                    >
                      Import
                    </btn-loading>
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
                    <btn-loading
                      color="primary"
                      :action="matchStagedSecuritiesByIsin"
                    >
                      Match by ISIN
                    </btn-loading>
                    <btn-loading
                      color="primary"
                      :action="matchStagedSecuritiesByName"
                    >
                      Match by name
                    </btn-loading>
                    <btn-loading
                      color="primary"
                      :action="matchStagedSecuritiesByWkn"
                    >
                      Match by WKN
                    </btn-loading>
                    <btn-loading
                      color="primary"
                      :action="matchStagedSecuritiesBySymbolXfra"
                    >
                      Match by Symbol (XFRA)
                    </btn-loading>
                    <btn-loading
                      color="secondary"
                      :action="unmatchStagedSecurities"
                    >
                      Remove matches
                    </btn-loading>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-tab-item>

        <v-tab-item key="changed">
          <v-data-table
            v-model="changedSelectedEntries"
            :headers="changedHeaders"
            :items="changedEntries"
            item-key="uuid"
            :options.sync="changedPagination"
            :server-items-length="changedTotalItems"
            :footer-props="changedFooterProps"
            :loading="changedLoading"
            dense
            show-select
          >
            <template v-slot:item.name="{ item }">
              <compare-text :old-text="item.name" :new-text="item.nameStaged" />
            </template>

            <template v-slot:item.isin="{ item }">
              <compare-text :old-text="item.isin" :new-text="item.isinStaged" />
            </template>

            <template v-slot:item.wkn="{ item }">
              <compare-text :old-text="item.wkn" :new-text="item.wknStaged" />
            </template>

            <template v-slot:item.symbolXfra="{ item }">
              <compare-text
                :old-text="item.symbolXfra"
                :new-text="item.symbolXfraStaged"
              />
            </template>

            <template v-slot:item.securityType="{ item }">
              <compare-text
                :old-text="item.securityType"
                :new-text="item.securityTypeStaged"
              />
            </template>
          </v-data-table>

          <btn-loading color="primary" :action="applyChanges">
            Apply changes (for selected rows)
          </btn-loading>
        </v-tab-item>

        <v-tab-item key="added-removed">
          <v-data-table
            v-model="addedRemovedSelectedEntries"
            :headers="addedRemovedHeaders"
            :items="addedRemovedEntries"
            item-key="id"
            :options.sync="addedRemovedPagination"
            :server-items-length="addedRemovedTotalItems"
            :footer-props="addedRemovedFooterProps"
            :loading="addedRemovedLoading"
            dense
            show-select
          >
          </v-data-table>

          <btn-loading color="primary" :action="addRemoveEntries">
            Add/remove (selected entries)
          </btn-loading>
        </v-tab-item>
      </v-tabs>
    </v-flex>
  </v-layout>
</template>

<script>
import debounce from 'lodash/debounce'
import DialogConfirm from '../../../components/dialog-confirm'
import BtnLoading from '../../../components/btn-loading'
import CompareText from '../../../components/compare-text'

export default {
  layout: 'admin',
  components: { DialogConfirm, BtnLoading, CompareText },
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
      uploadProgress: 0,
      changedHeaders: [
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
        { text: 'Symbol XFRA', value: 'symbolXfra' },
        { text: 'Type', value: 'securityType' },
      ],
      changedEntries: [],
      changedSelectedEntries: [],
      changedPagination: {
        itemsPerPage: 10,
        sortBy: ['name'],
        sortDesc: [false],
        page: 1,
      },
      changedTotalItems: 0,
      changedLoading: false,
      changedFooterProps: { 'items-per-page-options': [10, 25, 50, 100] },
      addedRemovedHeaders: [
        { text: 'Type', value: 'type' },
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
        { text: 'Symbol XFRA', value: 'symbolXfra' },
        { text: 'Type', value: 'securityType' },
      ],
      addedRemovedEntries: [],
      addedRemovedSelectedEntries: [],
      addedRemovedPagination: {
        itemsPerPage: 10,
        sortBy: ['name'],
        sortDesc: [false],
        page: 1,
      },
      addedRemovedTotalItems: 0,
      addedRemovedLoading: false,
      addedRemovedFooterProps: { 'items-per-page-options': [10, 25, 50, 100] },
    }
  },
  watch: {
    changedPagination: {
      handler() {
        this.updateChangedEntries()
      },
      deep: true,
    },
    addedRemovedPagination: {
      handler() {
        this.updateAddedRemovedEntries()
      },
      deep: true,
    },
  },
  mounted() {
    this.updateStats()
  },
  methods: {
    updateChangedEntries: debounce(async function () {
      this.changedLoading = true

      const res = await this.$axios.$get(
        '/api/securities-staging/compare/changes',
        {
          params: {
            sort: this.changedPagination.sortBy[0],
            skip:
              this.changedPagination.itemsPerPage *
              (this.changedPagination.page - 1),
            limit: this.changedPagination.itemsPerPage,
            desc: this.changedPagination.sortDesc[0],
          },
        }
      )
      this.changedEntries = res.entries
      this.changedTotalItems = res.params.totalCount

      this.changedLoading = false
    }, 300), // debounce 300ms

    updateAddedRemovedEntries: debounce(async function () {
      this.addedRemovedLoading = true

      const res = await this.$axios.$get(
        '/api/securities-staging/compare/added-removed',
        {
          params: {
            sort: this.addedRemovedPagination.sortBy[0],
            skip:
              this.addedRemovedPagination.itemsPerPage *
              (this.addedRemovedPagination.page - 1),
            limit: this.addedRemovedPagination.itemsPerPage,
            desc: this.addedRemovedPagination.sortDesc[0],
          },
        }
      )
      this.addedRemovedEntries = res.entries
      this.addedRemovedTotalItems = res.params.totalCount

      this.addedRemovedLoading = false
    }, 300), // debounce 300ms

    async applyChanges() {
      for (const item of this.changedSelectedEntries) {
        await this.$axios.$patch(`/api/securities/${item.id}`, {
          name: item.nameStaged,
          isin: item.isinStaged,
          wkn: item.wknStaged,
          symbolXfra: item.symbolXfraStaged,
          securityType: item.securityTypeStaged,
        })
      }
      this.changedSelectedEntries = []
      this.updateChangedEntries()
    },

    async addRemoveEntries() {
      for (const item of this.addedRemovedSelectedEntries) {
        if (item.type === 'added') {
          const { uuid } = await this.$axios.$post(`/api/securities/`, {
            staged: false,
            name: item.name,
            isin: item.isin,
            wkn: item.wkn,
            symbolXfra: item.symbolXfra,
            securityType: item.securityType,
          })
          // Add newly generated UUID to staged security to remove entry from table
          await this.$axios.$patch(`/api/securities/${item.id}`, { uuid })
        } else if (item.type === 'removed') {
          await this.$axios.$delete(`/api/securities/${item.id}`)
        }
      }
      this.addedRemovedSelectedEntries = []
      this.updateAddedRemovedEntries()
    },

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
    },

    /**
     * Read file
     */
    async openImportFile(event) {
      this.importFileContent = null
      this.uploadProgress = 0

      function readAsTextAsync(file) {
        return new Promise((resolve) => {
          const fr = new FileReader()
          fr.onload = (e) => resolve(e.target.result)
          fr.readAsText(file)
        })
      }
      this.importFileContent = await readAsTextAsync(event.target.files[0])
    },

    /**
     * Send content of the file to API
     */
    async importFile() {
      await this.$axios.post(
        '/api/securities-staging',
        this.importFileContent,
        {
          headers: { 'Content-Type': 'text/plain' },
          params: {
            sourceFormat: 'xetra',
          },
          onUploadProgress: (progressEvent) => {
            this.uploadProgress =
              (progressEvent.loaded / progressEvent.total) * 100
          },
        }
      )
      await this.updateStats()
    },

    /**
     * Match current with staged securities by ISIN
     */
    async matchStagedSecuritiesByIsin() {
      await this.$axios.post('/api/securities-staging/match/isin')
      await this.updateStats()
    },

    /**
     * Match current with staged securities by name
     */
    async matchStagedSecuritiesByName() {
      await this.$axios.post('/api/securities-staging/match/name')
      await this.updateStats()
    },

    /**
     * Match current with staged securities by WKN
     */
    async matchStagedSecuritiesByWkn() {
      await this.$axios.post('/api/securities-staging/match/wkn')
      await this.updateStats()
    },

    /**
     * Match current with staged securities by symbol (XFRA)
     */
    async matchStagedSecuritiesBySymbolXfra() {
      await this.$axios.post('/api/securities-staging/match/symbolXfra')
      await this.updateStats()
    },

    /**
     * Unmatch staged securities
     */
    async unmatchStagedSecurities() {
      await this.$axios.delete('/api/securities-staging/match/')
      await this.updateStats()
    },
  },
  head() {
    return {
      title: 'Portfolio Report Admin',
    }
  },
}
</script>
