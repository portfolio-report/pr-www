<template>
  <div>
    <Dialog
      v-model:visible="showEditDialog"
      header="Edit Client Update"
      style="max-width: 600"
      :modal="true"
    >
      <div class="p-float-label mt-4">
        <InputText
          id="timestamp"
          v-model="editedItem.timestamp"
          class="w-20rem"
        />
        <label for="timestamp">Timestamp</label>
      </div>

      <div class="p-float-label mt-4">
        <InputText id="version" v-model="editedItem.version" class="w-10rem" />
        <label for="version">Version</label>
      </div>

      <div class="p-float-label mt-4">
        <InputText id="country" v-model="editedItem.country" class="w-10rem" />
        <label for="country">Country</label>
      </div>

      <div class="p-float-label mt-4">
        <InputText
          id="useragent"
          v-model="editedItem.useragent"
          class="w-25rem"
        />
        <label for="useragent">User Agent</label>
      </div>

      <template #footer>
        <CancelBtn label="Cancel" @click="closeEditDialog" />
      </template>
    </Dialog>

    <DataTable
      v-model:filters="filters"
      :value="entries"
      :lazy="true"
      :paginator="true"
      :loading="loading"
      :total-records="totalItems"
      :rows="rowsPerPage"
      class="p-datatable-sm"
      :rows-per-page-options="[10, 25, 50, 100]"
      sort-field="timestamp"
      :sort-order="1"
      filter-display="menu"
      @page="onPage"
      @sort="onSort"
      @filter="onFilter"
    >
      <template #header>
        <h5 class="m-0">Client updates</h5>
      </template>
      <Column field="timestamp" header="Timestamp" :sortable="true"></Column>
      <Column
        field="version"
        header="Version"
        :sortable="true"
        :show-filter-match-modes="false"
      >
        <template #filter="{ filterModel }">
          <InputText
            v-model="filterModel.value"
            type="text"
            class="p-column-filter"
            placeholder="Filter by version"
          />
        </template>
      </Column>
      <Column field="country" header="Country" :sortable="true"></Column>
      <Column header="Actions">
        <template #body="{ data }">
          <EditBtn small @click="editItem(data)" />
          <DeleteBtn small @click="deleteItem(data)" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import {
  DataTableFilterMetaData,
  DataTablePageEvent,
  DataTableSortEvent,
} from 'primevue/datatable'
import { debounce } from '~/components/debounce'

interface ClientUpdate {
  id: number
  timestamp: string
  version: string
  country: string | null
  useragent: string | null
}
useHead({ title: 'Portfolio Report Admin' })

definePageMeta({
  middleware: ['auth'],
})

const confirm = useConfirmDialog()

const showEditDialog = ref(false)
const editedItem = ref<ClientUpdate>({
  id: 0,
  timestamp: '',
  version: '',
  country: '',
  useragent: '',
})

const entries = ref<ClientUpdate[]>([])
const versionFilter: DataTableFilterMetaData = {
  value: null,
  matchMode: '',
}
const filters = ref({
  version: versionFilter,
})

const rowsPerPage = ref(10)

const lazyParams = ref<{
  first: number
  sortField: string | null | undefined
  sortOrder: number | null | undefined
}>({
  first: 0,
  sortField: null,
  sortOrder: null,
})

const onPage = (event: DataTablePageEvent) => {
  lazyParams.value.first = event.first
  rowsPerPage.value = event.rows
  onSort(event)
}

const onSort = (event: DataTableSortEvent) => {
  if (
    typeof event.sortField === 'string' ||
    typeof event.sortField === 'undefined' ||
    event.sortField === null
  ) {
    lazyParams.value.sortField = event.sortField
  }
  lazyParams.value.sortOrder = event.sortOrder
  getEntries()
}

const onFilter = () => {
  getEntries()
}

const totalItems = ref(0)
const loading = ref(false)

async function getEntriesRaw() {
  loading.value = true

  const res = await useApi<{
    entries: ClientUpdate[]
    params: { totalCount: number }
  }>('/stats/', {
    params: {
      sort: lazyParams.value.sortField,
      skip: lazyParams.value.first,
      limit: rowsPerPage.value,
      desc: lazyParams.value.sortOrder === -1,
      version: filters.value.version.value,
    },
  })
  entries.value = res.entries
  totalItems.value = res.params.totalCount

  loading.value = false
}

const getEntries = debounce(getEntriesRaw, 300)

onMounted(() => {
  getEntries()
})

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
    await confirm({
      message: `Are you sure you want to delete this entry (${item.timestamp})?`,
      header: 'Delete entry',
      icon: 'i-carbon-warning',
    })
  ) {
    await useApi(`/stats/${item.id}`, { method: 'delete' })
    getEntries()
  }
}
</script>
