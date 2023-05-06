<script setup lang="ts">
const route = useRoute()

const { data, error } = await useAsyncData(
  `stats:${route.params.version}`,
  () =>
    useApi<{
      byCountry: { country: string; count: number }[]
      byDate: { date: string; count: number }[]
    }>(`/stats/updates/${route.params.version}`),
)
if (error.value || data.value?.byCountry == null || data.value.byDate == null) {
  throw createError({ statusCode: 404 })
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
}

const chartData = computed(() => {
  if (!data.value?.byCountry) {
    return { labels: [], datasets: [] }
  }

  const datesSorted = [...data.value.byDate].sort((a, b) =>
    a.date.localeCompare(b.date),
  )

  return {
    labels: datesSorted.map(e => e.date),
    datasets: [
      {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
        fill: false,
        data: datesSorted.map(e => e.count),
      },
    ],
  }
})
</script>

<template>
  <div>
    <h2>Version Statistics for {{ $route.params.version }}</h2>

    <TabView>
      <TabPanel header="By date">
        <Chart
          type="line"
          :data="chartData"
          :options="chartOptions"
          style="height: 400px"
        />

        <DataTable
          :value="data?.byDate"
          sort-field="date"
          :sort-order="-1"
          class="p-datatable-sm"
        >
          <Column field="date" header="Date" :sortable="true" />
          <Column
            field="count"
            header="Count"
            :sortable="true"
            class="text-right"
          />
        </DataTable>
      </TabPanel>

      <TabPanel header="By country">
        <DataTable
          :value="data?.byCountry"
          sort-field="count"
          :sort-order="-1"
          class="p-datatable-sm"
        >
          <Column field="country" header="Country" :sortable="true" />
          <Column
            field="count"
            header="Count"
            :sortable="true"
            class="text-right"
          />
        </DataTable>
      </TabPanel>
    </TabView>
  </div>
</template>
