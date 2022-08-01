<template>
  <div>
    <LineChart :chart-data="chartData" :options="chartOptions" />

    <v-data-table
      :headers="headers"
      :items="dates"
      :hide-default-footer="true"
      sort-by="date"
      :items-per-page="-1"
    >
      <template #item="props">
        <tr>
          <td>{{ props.item.date }}</td>
          <td class="text-right">{{ props.item.count }}</td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts">
import { PropType, computed, defineComponent } from '@nuxtjs/composition-api'
import { LineChart } from 'vue-chart-3'

export default defineComponent({
  name: 'StatsDate',

  components: {
    LineChart,
  },

  props: {
    dates: {
      type: Array as PropType<Array<{ date: string; count: number }>>,
      required: true,
    },
  },

  setup(props) {
    const headers = [
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

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
    }

    const chartData = computed(() => {
      const datesSorted = [...props.dates].sort((a, b) =>
        a.date.localeCompare(b.date)
      )

      return {
        labels: datesSorted.map((e) => e.date),
        datasets: [
          {
            label: 'count',
            backgroundColor: '#006e90',
            fill: false,
            data: datesSorted.map((e) => e.count),
          },
        ],
      }
    })

    return { headers, chartOptions, chartData }
  },
})
</script>
