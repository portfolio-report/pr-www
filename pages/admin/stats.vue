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
                filterVersion ? icons.mdiFilter : icons.mdiFilterOutline
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
        <template #item.action="{ item }">
          <v-icon small class="mr-2" @click="editItem(item)">
            {{ icons.mdiPencil }}
          </v-icon>
          <v-icon small @click="deleteItem(item)">
            {{ icons.mdiDelete }}
          </v-icon>
        </template>
      </v-data-table>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  useContext,
  watch,
} from '@nuxtjs/composition-api'
import { debounce } from '@/components/debounce'

import { useConfirmDialog } from '@/components/useConfirmDialog'
import icons from '@/components/icons'

interface ClientUpdate {
  id: number
  timestamp: string
  version: string
  country: string | null
  useragent: string | null
}

export default defineComponent({
  name: 'StatsPage',

  middleware: 'auth',

  setup() {
    const { $axios } = useContext()

    const showConfirmDialog = useConfirmDialog()

    const filterVersion = ref<string | null>(null)
    const showEditDialog = ref(false)
    const editedItem = ref<ClientUpdate>({
      id: 0,
      timestamp: '',
      version: '',
      country: '',
      useragent: '',
    })

    const headers = [
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

    const entries = ref<ClientUpdate[]>([])

    const pagination = ref({
      itemsPerPage: 10,
      sortBy: ['timestamp'],
      sortDesc: [false],
      page: 1,
    })

    const totalItems = ref(0)
    const loading = ref(false)
    const footerProps = { 'items-per-page-options': [10, 25, 50, 100] }

    async function getEntriesRaw() {
      loading.value = true

      const res = await $axios.$get('/stats/', {
        params: {
          sort: pagination.value.sortBy[0],
          skip: pagination.value.itemsPerPage * (pagination.value.page - 1),
          limit: pagination.value.itemsPerPage,
          desc: pagination.value.sortDesc[0],
          version: filterVersion.value,
        },
      })
      entries.value = res.entries
      totalItems.value = res.params.totalCount

      loading.value = false
    }

    const getEntries = debounce(getEntriesRaw, 300)

    watch(pagination, getEntries)
    watch(filterVersion, getEntries)

    function editItem(item: ClientUpdate) {
      // Edit a copy of the object
      editedItem.value = Object.assign({}, item)
      showEditDialog.value = true
    }

    function closeEditDialog() {
      showEditDialog.value = false
    }

    async function deleteItem(item: ClientUpdate) {
      if (
        await showConfirmDialog(
          `Are you sure you want to delete this entry (${item.timestamp})?`,
          {
            title: 'Delete entry',
            color: 'secondary',
          }
        )
      ) {
        await $axios.$delete(`/stats/${item.id}`)
        getEntries()
      }
    }

    return {
      filterVersion,
      showEditDialog,
      editedItem,
      headers,
      entries,
      pagination,
      totalItems,
      loading,
      footerProps,
      editItem,
      closeEditDialog,
      deleteItem,
      icons,
    }
  },

  head() {
    return {
      title: 'Portfolio Report Admin',
    }
  },
})
</script>
