<template>
  <div>
    <GChart type="LineChart" :data="chartData" :options="chartOptions" />

    <v-data-table
      :headers="headers"
      :items="dates"
      :hide-default-footer="true"
      sort-by="date"
      :items-per-page="-1"
    >
      <template v-slot:item="props">
        <tr>
          <td>{{ props.item.date }}</td>
          <td class="text-right">{{ props.item.count }}</td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { GChart } from 'vue-google-charts'

export default {
  components: {
    GChart,
  },
  props: {
    dates: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      headers: [
        {
          text: 'Date',
          align: 'left',
          sortable: true,
          value: 'date',
        },
        {
          text: 'Count',
          align: 'right',
          sortable: true,
          value: 'count',
        },
      ],
      chartOptions: {
        curveType: 'function',
      },
    }
  },
  computed: {
    chartData() {
      return [['Date', 'Count']].concat(
        this.dates
          .map(e => [e.date, e.count])
          .sort((a, b) => a[0].localeCompare(b[0]))
      )
    },
  },
}
</script>
