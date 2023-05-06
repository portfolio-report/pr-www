<script setup lang="ts">
import { FilterOperator } from 'primevue/api'
import type { DataTableFilterMeta } from 'primevue/datatable'

const props = defineProps<{
  prices: { date: string; close: number }[]
}>()

const priceArray = computed(() =>
  props.prices.map(e => ({
    dateStr: e.date,
    date: new Date(e.date),
    close: e.close,
  })),
)

const filters = ref({
  date: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: 'dateIs' }],
  },
} satisfies DataTableFilterMeta)
</script>

<template>
  <div>
    <DataTable
      v-model:filters="filters"
      :value="priceArray"
      class="p-datatable-sm"
      :paginator="true"
      :rows="10"
      sort-field="date"
      :sort-order="-1"
      :rows-per-page-options="[10, 30, 100, 300]"
      filter-display="menu"
    >
      <Column field="date" header="Date" sortable data-type="date">
        <template #body="{ data }">
          {{ data.dateStr }}
        </template>
        <template #filter="{ filterModel }">
          <Calendar
            v-model="filterModel.value"
            date-format="yy-mm-dd"
            placeholder="yyyy-mm-dd"
          />
        </template>
      </Column>
      <Column field="close" header="Close">
        <template #body="{ data }">
          {{
            data.close.toLocaleString(undefined, { minimumFractionDigits: 2 })
          }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>
