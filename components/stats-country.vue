<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="countries"
      :hide-default-footer="true"
      :options.sync="pagination"
      :items-per-page="-1"
    >
      <template #item="props">
        <tr>
          <td>{{ props.item.country }}</td>
          <td class="text-right">{{ props.item.count }}</td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  name: 'StatsCountry',

  props: {
    countries: {
      type: Array as PropType<Array<{ country: string; count: number }>>,
      required: true,
    },
  },

  setup() {
    const headers = [
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

    const pagination = {
      sortBy: ['count'],
      sortDesc: [true],
    }

    return { headers, pagination }
  },
})
</script>
