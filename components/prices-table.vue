<template>
  <v-data-table
    :headers="headers"
    :items="prices"
    :footer-props="footerProps"
    dense
  >
  </v-data-table>
</template>

<script lang="ts">
import { PropType, defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  name: 'PricesTable',

  props: {
    prices: {
      type: Array as PropType<Array<{ date: string; close: number }>>,
      default: () => [],
    },
  },

  setup() {
    const headers = [
      {
        text: 'Date',
        value: 'date',
      },
      {
        text: 'Close',
        value: 'close',
      },
    ]

    const footerProps = { 'items-per-page-options': [10, 30, 100, 300] }

    return { headers, footerProps }
  },
})
</script>
