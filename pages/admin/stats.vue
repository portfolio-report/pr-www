<template>
  <v-row align="center" justify="center">
    <v-col cols="12" sm="8" md="6">
      <v-toolbar color="primary" dark>
        <v-toolbar-title>Client Updates</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-menu bottom left offset-y :close-on-content-click="false">
          <template #activator="{ on }">
            <v-btn icon v-on="on">
              <v-icon>{{
                filterVersion ? mdiFilter : mdiFilterOutline
              }}</v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-list>
              <v-subheader>Version</v-subheader>
              <v-list-item>
                <v-list-item-content>
                  <v-text-field v-model="filterVersion" clearable single-line />
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </v-toolbar>

      <v-dialog v-model="showEditDialog" max-width="600">
        <v-card>
          <v-card-title>Edit Client Update</v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    v-model="editedItem.timestamp"
                    label="Timestamp"
                  />
                </v-col>
                <v-col cols="12" sm="12" md="6">
                  <v-text-field v-model="editedItem.version" label="Version" />
                </v-col>
                <v-col cols="12" sm="12" md="6">
                  <v-text-field v-model="editedItem.country" label="Country" />
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    v-model="editedItem.useragent"
                    label="User Agent"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="closeEditDialog">Cancel</v-btn>
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
        <template #items="props">
          <td>{{ props.item.timestamp }}</td>
          <td>{{ props.item.version }}</td>
          <td>{{ props.item.country }}</td>
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

      <DialogConfirm ref="confirm" />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'nuxt-property-decorator'
import debounce from 'lodash/debounce'
import { mdiDelete, mdiFilter, mdiFilterOutline, mdiPencil } from '@mdi/js'
import DialogConfirm from '../../components/dialog-confirm.vue'

interface ClientUpdate {
  id: number
  timestamp: string
  version: string
  country: string | null
  useragent: string | null
}

@Component({ components: { DialogConfirm }, layout: 'admin' })
export default class StatsPage extends Vue {
  mdiFilter = mdiFilter
  mdiFilterOutline = mdiFilterOutline
  mdiPencil = mdiPencil
  mdiDelete = mdiDelete

  filterVersion: string | null = null
  showEditDialog = false
  editedItem: ClientUpdate = {
    id: 0,
    timestamp: '',
    version: '',
    country: '',
    useragent: '',
  }

  headers = [
    {
      text: 'Timestamp',
      value: 'timestamp',
    },
    {
      text: 'Version',
      align: 'left',
      sortable: true,
      value: 'version',
    },
    { text: 'Country', value: 'country' },
    { text: 'Actions', value: 'action', sortable: false },
  ]

  entries: Array<ClientUpdate> = []

  pagination = {
    itemsPerPage: 10,
    sortBy: ['timestamp'],
    sortDesc: [false],
    page: 1,
  }

  totalItems = 0
  loading = false
  footerProps = { 'items-per-page-options': [10, 25, 50, 100] }

  @Watch('pagination', { deep: true })
  onPaginationChanged() {
    this.getEntries()
  }

  @Watch('filterVersion')
  onFilterVersionChanged() {
    this.getEntries()
  }

  async getEntriesRaw() {
    this.loading = true

    const res = await this.$axios.$get('/api/stats/', {
      params: {
        sort: this.pagination.sortBy[0],
        skip: this.pagination.itemsPerPage * (this.pagination.page - 1),
        limit: this.pagination.itemsPerPage,
        desc: this.pagination.sortDesc[0],
        version: this.filterVersion,
      },
    })
    this.entries = res.entries
    this.totalItems = res.params.totalCount

    this.loading = false
  }

  getEntries = debounce(this.getEntriesRaw, 300)

  editItem(item: ClientUpdate) {
    // Edit a copy of the object
    this.editedItem = Object.assign({}, item)
    this.showEditDialog = true
  }

  closeEditDialog() {
    this.showEditDialog = false
  }

  async deleteItem(item: ClientUpdate) {
    if (
      await (this.$refs.confirm as any).open({
        title: 'Delete entry',
        message: `Are you sure you want to delete this entry (${item.timestamp})?`,
        color: 'secondary',
      })
    ) {
      await this.$axios.$delete(`/api/stats/${item.id}`)
      this.getEntries()
    }
  }

  head() {
    return {
      title: 'Portfolio Report Admin',
    }
  }
}
</script>
