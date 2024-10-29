<script setup lang="ts">
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'

const props = defineProps<{
  prices: { date: string, close: number }[]
}>()

const priceArray = computed(() =>
  props.prices
    .map(e => ({
      dateStr: e.date,
      date: new Date(e.date),
      close: e.close,
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime()),
)
</script>

<template>
  <div>
    <DataTable
      :value="priceArray"
      class="font-mono"
      size="small"
      :rows="10"
    >
      <Column field="date" header="Date" data-type="date">
        <template #body="{ data }">
          {{ data.dateStr }}
        </template>
      </Column>
      <Column
        field="close"
        body-class="!text-right"
      >
        <template #header>
          <span class="flex-1 text-right font-semibold">Close</span>
        </template>
        <template #body="{ data }">
          {{
            data.close.toLocaleString(undefined, { minimumFractionDigits: 2 })
          }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>
