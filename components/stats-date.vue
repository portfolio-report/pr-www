<template>
  <div>
    <line-chart :chartdata="chartData" :options="chartOptions" />

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

<script lang="ts">
import LineChart from '~/components/line-chart.vue'
import { Component, Vue, Prop } from 'nuxt-property-decorator'

@Component({ components: { LineChart } })
export default class StatsDate extends Vue {
  @Prop({ required: true })
  dates!: Array<{ date: string; count: number }>

  headers = [
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
  ]

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  }

  get chartData() {
    const datesSorted = [...this.dates].sort((a, b) =>
      a.date.localeCompare(b.date)
    )

    return {
      labels: datesSorted.map(e => e.date),
      datasets: [
        {
          label: 'count',
          backgroundColor: '#006e90',
          fill: false,
          data: datesSorted.map(e => e.count),
        },
      ],
    }
  }
}
</script>
