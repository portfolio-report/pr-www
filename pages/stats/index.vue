<template>
  <div>
    <h1>Statistics <TextBtn icon="i-carbon-renew" @click="refresh()" /></h1>

    <template v-if="pending || !stats">
      <Skeleton width="15em" />

      <div class="flex align-items-end" style="height: 400px">
        <Skeleton
          v-for="(h, i) in [30, 25, 45, 70, 90]"
          :key="i"
          width="20%"
          :height="h + '%'"
          class="mr-2"
        />
      </div>

      <Skeleton v-for="i in Array(10).keys()" :key="i" class="mt-4" />
    </template>

    <template v-else>
      Last update: {{ stats.lastUpdate }}
      <h2>Client Updates</h2>

      <Chart
        type="bar"
        :data="chartData"
        :options="chartOptions"
        style="height: 400px"
      />

      <DataTable
        :value="stats.versions"
        sort-field="version"
        class="p-datatable-sm"
        :sort-order="1"
      >
        <Column field="version" header="Version" :sortable="true">
          <template #body="{ data }">
            <NuxtLink :to="`/stats/${data.version}`">
              {{ data.version }}
            </NuxtLink>
          </template>
        </Column>
        <Column field="firstUpdateInt" header="From" :sortable="true">
          <template #body="slotProps">
            {{ slotProps.data.firstUpdate.toLocaleString('de-DE') }}
          </template>
        </Column>
        <Column field="lastUpdateInt" header="To" :sortable="true">
          <template #body="slotProps">
            {{ slotProps.data.lastUpdate.toLocaleString('de-DE') }}
          </template>
        </Column>
        <Column
          field="count"
          header="Count"
          :sortable="true"
          class="text-right"
        />
      </DataTable>
    </template>
  </div>
</template>

<script setup lang="ts">
const {
  data: stats,
  pending,
  refresh,
} = useLazyAsyncData(async () => {
  const versions = await useApi<
    Array<{
      version: string
      count: number
      firstUpdate: Date
      firstUpdateInt: number
      lastUpdate: Date
      lastUpdateInt: number
    }>
  >('/stats/updates')

  /* Convert datetime strings to objects and numerical */
  for (const v of versions) {
    if (v.firstUpdate) {
      v.firstUpdate = new Date(v.firstUpdate)
      v.firstUpdateInt = v.firstUpdate.getTime()
    }
    if (v.lastUpdate) {
      v.lastUpdate = new Date(v.lastUpdate)
      v.lastUpdateInt = v.lastUpdate.getTime()
    }
  }

  return { lastUpdate: new Date().toISOString(), versions }
})

const chartData = computed(() => ({
  labels: stats.value?.versions.map((e) => e.version),
  datasets: [
    {
      backgroundColor: '#3B82F6',
      data: stats.value?.versions.map((e) => e.count),
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
}
</script>
