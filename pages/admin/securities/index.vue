<template>
  <v-row align="center" justify="center">
    <v-col cols="12">
      <v-toolbar color="primary" dark>
        <v-toolbar-title>Securities</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="newSecurity">
          <v-icon>{{ mdiPlus }}</v-icon>
        </v-btn>

        <v-menu bottom left offset-y :close-on-content-click="false">
          <template #activator="{ on }">
            <v-btn icon v-on="on">
              <v-icon>{{
                securitySearch || securityType ? mdiFilter : mdiFilterOutline
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
                    :append-icon="mdiMagnify"
                    clearable
                    single-line
                    dense
                    outlined
                  />
                </v-list-item-content>
              </v-list-item>
              <v-divider />
              <v-list-item>
                <v-list-item-content>
                  <select-security-type v-model="securityType" />
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </v-toolbar>

      <v-data-table
        :headers="[
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
          { text: 'Type', value: 'securityType' },
          { text: 'Actions', value: 'action', sortable: false },
        ]"
        :items="entries"
        :options.sync="pagination"
        :server-items-length="totalItems"
        :footer-props="footerProps"
        :loading="loading"
      >
        <template #item.name="{ item }">
          <nuxt-link :to="'/admin/securities/' + item.uuid">
            {{ item.name }}
          </nuxt-link>
        </template>
        <template #item.action="{ item }">
          <v-btn color="primary" icon text @click="editSecurity(item)">
            <v-icon>{{ mdiPencil }}</v-icon>
          </v-btn>
          <v-btn color="error" icon text @click="deleteSecurity(item)">
            <v-icon>{{ mdiDelete }}</v-icon>
          </v-btn>
        </template>
      </v-data-table>

      <v-dialog v-model="securityDialog" width="600">
        <v-form @submit.prevent="saveSecurity">
          <v-card>
            <v-card-title v-if="!!selectedSecurity.uuid">
              Edit security {{ selectedSecurity.uuid }}
            </v-card-title>
            <v-card-title v-else>Create security</v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" sm="12" md="8">
                    <v-text-field
                      v-if="!!selectedSecurity.uuid"
                      v-model="selectedSecurity.uuid"
                      label="UUID"
                      disabled
                    />
                  </v-col>
                  <v-col cols="12" sm="12" md="8">
                    <v-text-field
                      v-model="selectedSecurity.name"
                      label="Name"
                    />
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="selectedSecurity.isin"
                      label="ISIN"
                    />
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="selectedSecurity.wkn" label="WKN" />
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="selectedSecurity.symbolXfra"
                      label="Symbol Frankfurt"
                    />
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="selectedSecurity.symbolXnas"
                      label="Symbol NASDAQ"
                    />
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="selectedSecurity.symbolXnys"
                      label="Symbol New York"
                    />
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="selectedSecurity.securityType"
                      label="Type"
                    />
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" text @click="securityDialog = false">
                <v-icon>{{ mdiClose }}</v-icon> Cancel
              </v-btn>
              <v-btn type="submit" color="primary" text>
                <v-icon>{{ mdiCheck }}</v-icon> Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-dialog>

      <v-btn color="primary" @click="updateFts">Update FTS index</v-btn>

      <DialogConfirm ref="confirm" />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import debounce from 'lodash/debounce'
import { Component, Vue, Watch, mixins } from 'nuxt-property-decorator'

import { IconsMixin } from '@/components/icons-mixin'
import SelectSecurityType from '@/components/select-security-type.vue'
import DialogConfirm from '../../../components/dialog-confirm.vue'

interface Security {
  uuid?: string | null
  name: string | null
  isin: string | null
  wkn: string | null
  symbolXfra: string | null
  symbolXnas: string | null
  symbolXnys: string | null
  securityType: string | null
}

@Component({
  components: { DialogConfirm, SelectSecurityType },
  middleware: 'auth',
})
export default class SecuritiesPage extends mixins(Vue, IconsMixin) {
  $refs!: {
    confirm: DialogConfirm
  }

  showCreateDialog = false
  showEditDialog = false
  securityDialog = false
  selectedSecurity: Security = {} as Security

  entries: Array<Security> = []

  searchQuery = ''
  pagination = {
    itemsPerPage: 10,
    sortBy: ['name'],
    sortDesc: [false],
    page: 1,
  }

  securitySearch = ''
  securityType = ''
  totalItems = 0
  loading = false
  footerProps = { 'items-per-page-options': [10, 25, 50, 100] }

  @Watch('pagination', { deep: true })
  onPaginationChanged() {
    this.getSecurities()
  }

  @Watch('securitySearch')
  onSecuritySearchChanged() {
    this.getSecurities()
  }

  @Watch('securityType')
  onSecurityTypeChanged() {
    this.getSecurities()
  }

  async getSecuritiesRaw() {
    this.loading = true

    const res = await this.$axios.$get('/api/securities', {
      params: {
        sort: this.pagination.sortBy[0],
        skip: this.pagination.itemsPerPage * (this.pagination.page - 1),
        limit: this.pagination.itemsPerPage,
        desc: this.pagination.sortDesc[0],
        search: this.securitySearch,
        securityType: this.securityType,
      },
    })
    this.entries = res.entries
    this.totalItems = res.params.totalCount

    this.loading = false
  }

  getSecurities = debounce(this.getSecuritiesRaw, 300)

  newSecurity() {
    this.selectedSecurity = {
      name: '',
      isin: '',
      wkn: '',
      securityType: '',
      symbolXfra: '',
      symbolXnas: '',
      symbolXnys: '',
    }
    this.securityDialog = true
  }

  editSecurity(security: Security) {
    this.selectedSecurity = { ...security }
    this.securityDialog = true
  }

  async saveSecurity() {
    if (this.selectedSecurity.uuid) {
      await this.$axios.$patch(
        `/api/securities/${this.selectedSecurity.uuid}`,
        this.selectedSecurity
      )

      // Update to reflect changes
      this.getSecurities()

      this.securityDialog = false
    } else {
      const sec = await this.$axios.$post(
        `/api/securities/`,
        this.selectedSecurity
      )

      // Update to reflect changes
      this.getSecurities()

      this.showCreateDialog = false

      this.editSecurity(sec)
    }
  }

  async deleteSecurity(security: Security) {
    if (
      await this.$refs.confirm.open({
        title: 'Delete security',
        message: `Are you sure you want to delete "${security.name}"?`,
        color: 'secondary',
      })
    ) {
      await this.$axios.$delete(`/api/securities/${security.uuid}`)
      this.getSecurities()
    }
  }

  updateFts() {
    this.$axios.post('/api/securities/search/update')
  }

  head() {
    return {
      title: 'Portfolio Report Admin',
    }
  }
}
</script>
