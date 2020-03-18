<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="countries"
      :hide-default-footer="true"
      :options.sync="pagination"
      :items-per-page="-1"
    >
      <template v-slot:item="props">
        <tr>
          <td>{{ props.item.country }}</td>
          <td class="text-right">{{ props.item.count }}</td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'

@Component
export default class StatsCountry extends Vue {
  @Prop({ required: true })
  countries!: Array<{ country: string; count: number }>

  headers = [
    {
      text: 'Country',
      align: 'left',
      sortable: true,
      value: 'country',
    },
    {
      text: 'Count',
      align: 'right',
      sortable: true,
      value: 'count',
    },
  ]

  pagination = {
    sortBy: ['count'],
    sortDesc: [true],
  }
}
</script>
