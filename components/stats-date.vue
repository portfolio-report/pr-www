<template>
  <div>
    <v-data-table :headers="headers" :items="items" hide-actions="true">
      <template v-slot:items="props">
        <td>{{ props.item.date }}</td>
        <td class="text-xs-right">{{ props.item.count }}</td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  props: {
    dates: {
      type: Object,
      required: true
    }
  },
  data: function() {
    return {
      headers: [
        {
          text: 'Date',
          align: 'left',
          sortable: true,
          value: 'date'
        },
        {
          text: 'Count',
          align: 'right',
          sortable: true,
          value: 'count'
        }
      ]
    }
  },
  computed: {
    items: function() {
      return Object.entries(this.dates).map(e => {
        return {
          date: e[0],
          count: e[1]
        }
      })
    }
  }
}
</script>
