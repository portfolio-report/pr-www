<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="items"
      hide-actions="true"
      :pagination.sync="pagination"
    >
      <template v-slot:items="props">
        <td>{{ props.item.country }}</td>
        <td class="text-xs-right">{{ props.item.count }}</td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  props: {
    countries: {
      type: Object,
      required: true
    }
  },
  data: function() {
    return {
      headers: [
        {
          text: 'Country',
          align: 'left',
          sortable: true,
          value: 'country'
        },
        {
          text: 'Count',
          align: 'right',
          sortable: true,
          value: 'count'
        }
      ],
      pagination: {
        sortBy: 'count',
        descending: true,
        rowsPerPage: -1
      }
    }
  },
  computed: {
    items: function() {
      return Object.entries(this.countries).map(e => {
        return {
          country: e[0],
          count: e[1]
        }
      })
    }
  }
}
</script>
