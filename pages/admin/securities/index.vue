<template>
  <div>
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
      sort-field="name"
      :sort-order="1"
      filter-display="menu"
      @page="onPage"
      @sort="onSort"
      @filter="onFilter"
    >
      <template #header>
        <div class="flex align-items-center">
          <h5 class="m-0 flex-grow-1">Securities</h5>

          <TextBtn icon="i-carbon-add" @click="newSecurity" />

          <TextBtn icon="i-carbon-task-add" @click="newSecurities" />

          <span class="p-input-icon-left">
            <i class="i-carbon-search" />
            <InputText
              v-model="filters['global'].value"
              placeholder="Search..."
              type="search"
            />
          </span>
        </div>
      </template>
      <Column field="uuid" header="UUID" :sortable="true"></Column>
      <Column field="name" header="Name" :sortable="true">
        <template #body="{ data }">
          <NuxtLink :to="'/admin/securities/' + data.uuid">
            {{ data.name }}
          </NuxtLink>
        </template>
      </Column>
      <Column field="isin" header="ISIN" :sortable="true"></Column>
      <Column field="wkn" header="WKN" :sortable="true"></Column>
      <Column
        field="securityType"
        header="Type"
        :sortable="true"
        :show-filter-match-modes="false"
      >
        <template #filter="{ filterModel }">
          <SelectSecurityType v-model="filterModel.value" />
        </template>
      </Column>
      <Column header="Actions">
        <template #body="{ data }">
          <EditBtn @click="editSecurity(data)" />
          <DeleteBtn @click="deleteSecurity(data)" />
        </template>
      </Column>
    </DataTable>

    <SecurityDialog ref="securityDialog" />

    <CreateMultipleSecuritiesDialog
      v-model="showCreateMultipleSecuritiesDialog"
      @update="getSecurities"
    />
  </div>
</template>

<script setup lang="ts">
import {
  DataTableFilterMetaData,
  DataTablePageEvent,
  DataTableSortEvent,
} from 'primevue/datatable'
import { debounce } from '~/components/debounce'
import { Security } from '~/store/Security.model'
import SecurityDialog from '~/components/SecurityDialog.vue'

useHead({ title: 'Portfolio Report Admin' })

definePageMeta({
  middleware: ['auth'],
})

const showConfirmDialog = useConfirmDialog()

const securityDialog = ref<InstanceType<typeof SecurityDialog> | null>(null)
const showCreateMultipleSecuritiesDialog = ref(false)

const entries = ref<Security[]>([])

const globalFilter: DataTableFilterMetaData = {
  value: null,
  matchMode: '',
}
const securityTypeFilter: DataTableFilterMetaData = {
  value: null,
  matchMode: '',
}
const filters = ref({
  global: globalFilter,
  securityType: securityTypeFilter,
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
  getSecurities()
}

const onFilter = () => {
  getSecurities()
}

watch(
  () => filters.value.global,
  () => {
    getSecurities()
  },
  { deep: true }
)

onMounted(() => {
  getSecurities()
})

const totalItems = ref(0)
const loading = ref(false)

async function getSecuritiesRaw() {
  loading.value = true

  const res = await useApi<{
    entries: Security[]
    params: { totalCount: number }
  }>('/securities/', {
    params: {
      sort: lazyParams.value.sortField,
      skip: lazyParams.value.first,
      limit: rowsPerPage.value,
      desc: lazyParams.value.sortOrder === -1,
      search: filters.value.global.value,
      securityType: filters.value.securityType.value,
    },
  })
  entries.value = res.entries
  totalItems.value = res.params.totalCount

  loading.value = false
}

const getSecurities = debounce(getSecuritiesRaw, 300)

async function newSecurity() {
  const sec = await securityDialog.value?.show()
  if (sec) {
    // Update to reflect changes
    getSecurities()
    await editSecurity(sec)
  }
}

function newSecurities() {
  showCreateMultipleSecuritiesDialog.value = true
}

async function editSecurity(security: Security) {
  if (await securityDialog.value?.show(security)) {
    // Update to reflect changes
    getSecurities()
  }
}

async function deleteSecurity(security: Security) {
  if (
    await showConfirmDialog({
      message: `Are you sure you want to delete "${security.name}"?`,
      header: 'Delete security',
    })
  ) {
    await useApi(`/securities/${security.uuid}`, { method: 'delete' })
    getSecurities()
  }
}
</script>
