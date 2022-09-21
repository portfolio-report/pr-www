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
      <Column v-if="auth.loggedIn" style="min-width: 8rem">
        <template #body="slotProps">
          <DeleteBtn @click="deletePrice(slotProps.data)" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/store/auth'

defineProps<{
  prices: { date: string; close: number }[]
}>()

const emit = defineEmits<{ (e: 'deletePrice', arg1: { date: string }): void }>()

const auth = useAuthStore()

const showConfirmDialog = useConfirmDialog()
async function deletePrice(price: { date: string }) {
  if (
    await showConfirmDialog({
      message: `Are you sure you want to delete the price of ${price.date}?`,
      header: 'Delete price',
      icon: 'i-carbon-warning',
    })
  ) {
    emit('deletePrice', { date: price.date })
  }
}
</script>
