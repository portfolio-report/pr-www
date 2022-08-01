<template>
  <v-data-table
    :headers="headers"
    :items="prices"
    :footer-props="footerProps"
    dense
  >
    <template #item.actions="{ item }">
      <v-btn small color="error" icon text @click="deletePrice(item)">
        <v-icon>{{ icons.mdiDelete }}</v-icon>
      </v-btn>
    </template>
  </v-data-table>
</template>

<script lang="ts">
import {
  PropType,
  computed,
  defineComponent,
  useContext,
} from '@nuxtjs/composition-api'

import icons from '@/components/icons'
import { useConfirmDialog } from '@/components/useConfirmDialog'

export default defineComponent({
  name: 'PricesTable',

  props: {
    prices: {
      type: Array as PropType<Array<{ date: string; close: number }>>,
      default: () => [],
    },
  },

  setup(_props, { emit }) {
    const unfilteredHeaders = [
      {
        text: 'Date',
        value: 'date',
      },
      {
        text: 'Close',
        value: 'close',
      },
      {
        text: '',
        value: 'actions',
        adminOnly: true,
      },
    ]

    const { $auth } = useContext()

    const headers = computed(() =>
      unfilteredHeaders.filter((e) => !e.adminOnly || $auth.loggedIn)
    )

    const footerProps = { 'items-per-page-options': [10, 30, 100, 300] }

    const showConfirmDialog = useConfirmDialog()
    async function deletePrice(price: { date: string }) {
      if (
        await showConfirmDialog(
          `Are you sure you want to delete the price of ${price.date}?`,
          {
            title: 'Delete price',
            color: 'secondary',
          }
        )
      ) {
        emit('deletePrice', { date: price.date })
      }
    }

    return { headers, footerProps, deletePrice, icons }
  },
})
</script>
