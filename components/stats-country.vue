<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="items"
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

<script>
export default {
  props: {
    countries: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      headers: [
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
      ],
      pagination: {
        sortBy: ['count'],
        sortDesc: [true],
      },
    }
  },
  computed: {
    items() {
      return Object.entries(this.countries).map(e => {
        return {
          country: e[0],
          count: e[1],
        }
      })
    },
  },
}
</script>
