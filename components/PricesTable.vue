<template>
  <div>
    <DataTable
      :value="prices"
      class="p-datatable-sm"
      :paginator="true"
      :rows="10"
      :rows-per-page-options="[10, 30, 100, 300]"
    >
      <Column field="date" header="Date" :sortable="true"></Column>
      <Column field="close" header="Close"> </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  prices: { date: string; close: number }[]
}>()
</script>
