<template>
  <div>
    <GChart type="LineChart" :data="chartData" :options="chartOptions" />

    <v-data-table :headers="headers" :items="tableItems" :hide-actions="true">
      <template v-slot:items="props">
        <td>{{ props.item.date }}</td>
        <td class="text-xs-right">{{ props.item.count }}</td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { GChart } from 'vue-google-charts'

export default {
  components: {
    GChart
  },
  props: {
    dates: {
      type: Object,
      required: true
    }
  },
  data() {
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
      ],
      chartOptions: {
        curveType: 'function'
      }
    }
  },
  computed: {
    tableItems() {
      return Object.entries(this.dates).map(e => {
        return {
          date: e[0],
          count: e[1]
        }
      })
    },
    chartData() {
      return [['Date', 'Count']].concat(
        Object.entries(this.dates).sort((a, b) =>
          a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0
        )
      )
    }
  }
}
</script>
