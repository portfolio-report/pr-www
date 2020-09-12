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
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class PricesTable extends Vue {
  @Prop({
    default: () => [],
  })
  prices!: Array<{ date: string; close: number }>

  headers = [
    {
      text: 'Date',
      value: 'date',
    },
    {
      text: 'Close',
      value: 'close',
    },
  ]

  footerProps = { 'items-per-page-options': [10, 30, 100, 300] }
}
</script>
