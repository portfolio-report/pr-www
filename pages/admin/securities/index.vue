<template>
  <v-row align="center" justify="center">
    <v-col cols="12">
      <v-toolbar color="primary" dark>
        <v-toolbar-title>Securities</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="createItem()">
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

      <v-dialog v-model="showCreateDialog" max-width="600">
        <v-card>
          <v-card-title>Create security</v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="12" md="8">
                  <v-text-field v-model="createdItem.name" label="Name" />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model="createdItem.isin" label="ISIN" />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model="createdItem.wkn" label="WKN" />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="createdItem.symbolXfra"
                    label="Symbol Frankfurt"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="createdItem.symbolXnas"
                    label="Symbol NASDAQ"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="createdItem.symbolXnys"
                    label="Symbol New York"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="createdItem.securityType"
                    label="Type"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="closeCreateDialog">
              Cancel
            </v-btn>
            <v-btn color="primary" text @click="saveCreateDialog">Create</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="showEditDialog" max-width="600">
        <v-card>
          <v-card-title>Edit security {{ editedItem.id }}</v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="12" md="8">
                  <v-text-field
                    v-model="editedItem.uuid"
                    label="UUID"
                    disabled
                  />
                </v-col>
                <v-col cols="12" sm="12" md="8">
                  <v-text-field v-model="editedItem.name" label="Name" />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model="editedItem.isin" label="ISIN" />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model="editedItem.wkn" label="WKN" />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="editedItem.symbolXfra"
                    label="Symbol Frankfurt"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="editedItem.symbolXnas"
                    label="Symbol NASDAQ"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="editedItem.symbolXnys"
                    label="Symbol New York"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="editedItem.securityType"
                    label="Type"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="closeEditDialog">Cancel</v-btn>
            <v-btn color="primary" text @click="saveEditDialog">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-data-table
        :headers="headers"
        :items="entries"
        :options.sync="pagination"
        :server-items-length="totalItems"
        :footer-props="footerProps"
        :loading="loading"
      >
        <template #[`item.name`]="{ item }">
          <nuxt-link :to="'/admin/securities/' + item.id">
            {{ item.name }}
          </nuxt-link>
        </template>
        <template #[`item.action`]="{ item }">
          <v-icon small class="mr-2" @click="editItem(item)">
            {{ mdiPencil }}
          </v-icon>
          <v-icon small @click="deleteItem(item)">
            {{ mdiDelete }}
          </v-icon>
        </template>
      </v-data-table>

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
  id?: number
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
  layout: 'admin',
})
export default class SecuritiesPage extends mixins(Vue, IconsMixin) {
  showCreateDialog = false
  showEditDialog = false
  createdItem: Security = {
    name: '',
    isin: '',
    wkn: '',
    securityType: '',
    symbolXfra: '',
    symbolXnas: '',
    symbolXnys: '',
  }

  editedItem: Security = {
    id: undefined,
    uuid: null,
    name: null,
    isin: null,
    wkn: null,
    securityType: null,
    symbolXfra: null,
    symbolXnas: null,
    symbolXnys: null,
  }

  headers = [
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
  ]

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

  createItem() {
    this.createdItem = {
      name: '',
      isin: '',
      wkn: '',
      securityType: '',
      symbolXfra: '',
      symbolXnas: '',
      symbolXnys: '',
    }
    this.showCreateDialog = true
  }

  editItem(item: Security) {
    // Edit a copy of the object
    this.editedItem = Object.assign({}, item)
    this.showEditDialog = true
  }

  async saveCreateDialog() {
    const sec = await this.$axios.$post(`/api/securities/`, this.createdItem)

    // Update to reflect changes
    this.getSecurities()

    this.showCreateDialog = false

    this.editItem(sec)
  }

  async saveEditDialog() {
    await this.$axios.$patch(
      `/api/securities/${this.editedItem.id}`,
      this.editedItem
    )

    // Update to reflect changes
    this.getSecurities()

    this.showEditDialog = false
  }

  closeCreateDialog() {
    this.showCreateDialog = false
  }

  closeEditDialog() {
    this.showEditDialog = false
  }

  async deleteItem(item: Security) {
    if (
      await (this.$refs.confirm as any).open({
        title: 'Delete security',
        message: `Are you sure you want to delete "${item.name}"?`,
        color: 'secondary',
      })
    ) {
      await this.$axios.$delete(`/api/securities/${item.id}`)
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
