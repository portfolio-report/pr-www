<script setup lang="ts">
import Chart from 'primevue/chart'
import Checkbox from 'primevue/checkbox'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'

const route = useRoute()

const { data, error } = await useAsyncData(
  `stats:${route.params.version}`,
  () =>
    useApi<{
      byDate: { date: string, count: number }[]
    }>(`/stats/updates/${route.params.version}`),
)
if (error.value || data.value?.byDate == null) {
  throw createError({ statusCode: 404 })
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
}

const byDateAccumulated = ref(false)

const chartData = computed(() => {
  if (!data.value) {
    return { labels: [], datasets: [] }
  }

  const datesSorted = [...data.value.byDate].sort((a, b) => a.date.localeCompare(b.date),
  )

  return {
    labels: datesSorted.map(e => e.date),
    datasets: [
      {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
        fill: false,
        data: byDateAccumulated.value
          ? datesSorted.reduce((acc: number[], curr) => {
              const count = acc.length > 0 ? (acc[acc.length - 1] ?? 0) + curr.count : curr.count
              acc.push(count)
              return acc
            }, [])
          : datesSorted.map(e => e.count),
      },
    ],
  }
})
</script>

<template>
  <div>
    <h2>Version Statistics for {{ route.params.version }}</h2>

    <Chart
      type="line"
      :data="chartData"
      :options="chartOptions"
      style="height: 400px"
    />
    <div class="flex items-center my-2">
      <Checkbox v-model="byDateAccumulated" binary input-id="checkboxAccumulated" />
      <label for="checkboxAccumulated" class="ml-2">Accumulated numbers</label>
    </div>

    <DataTable
      :value="data?.byDate"
      sort-field="date"
      :sort-order="-1"
      class="font-mono"
      size="small"
    >
      <Column field="date" header="Date" :sortable="true" />
      <Column
        field="count"
        header="Count"
        :sortable="true"
        class="!text-right"
      />
    </DataTable>
  </div>
</template>
