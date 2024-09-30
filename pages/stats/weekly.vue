<script setup lang="ts">
import { useTimeAgo } from '@vueuse/core'
import Button from 'primevue/button'
import ButtonGroup from 'primevue/buttongroup'
import Chart from 'primevue/chart'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import InputNumber from 'primevue/inputnumber'
import Popover from 'primevue/popover'

import Skeleton from 'primevue/skeleton'

const year = ref(new Date().getFullYear())

const yearOverlay = ref()
function toggleYearOverlay(event: MouseEvent) {
  yearOverlay.value.toggle(event)
}

const lastUpdate = ref(new Date())
const timeAgo = useTimeAgo(lastUpdate)

const { data, refresh, status } = useLazyAsyncData(
  `statsWeeks:${year.value}`,
  async () => {
    const weeks = await useApi<
      Array<{
        year: number
        week: number
        count: number
        firstUpdate: Date
        lastUpdate: Date
      }>
    >(
      `/stats/updates/weeks?year=${year.value}`,
    )

    /* Convert datetime strings to objects */
    for (const w of weeks) {
      if (w.firstUpdate) {
        w.firstUpdate = new Date(w.firstUpdate)
      }
      if (w.lastUpdate) {
        w.lastUpdate = new Date(w.lastUpdate)
      }
    }

    lastUpdate.value = new Date()

    return {
      weeks: weeks.sort((a, b) => a.week - b.week),
    }
  },
)

watch(year, () => refresh())

const chartData = computed(() => ({
  labels: data.value?.weeks.map(e => e.week),
  datasets: [
    {
      backgroundColor: '#3B82F6',
      data: data.value?.weeks.map(e => e.count),
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
}

function navTo(url: string) {
  navigateTo(url)
}
</script>

<template>
  <div>
    <ButtonGroup>
      <Button
        label="Versions"
        icon="i-carbon-tag"
        class="p-button-secondary"
        @click="navTo('/stats')"
      />
      <Button
        label="Weekly"
        icon="i-carbon-calendar"
        class="p-button-primary"
        :disabled="true"
      />
    </ButtonGroup>

    <h2>
      Weekly Statistics for
      <a class="cursor-pointer text-blue-500" @click="toggleYearOverlay">{{ year }}</a>
    </h2>

    <Popover ref="yearOverlay">
      <Button icon="i-carbon-close-large" rounded icon-class="text-xl" class="position-absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2" @click="yearOverlay.hide()" />
      <InputNumber v-model="year" :use-grouping="false" />
    </Popover>

    <template v-if="status === 'pending' || !data">
      <Skeleton width="15em" />

      <div class="flex items-end" style="height: 400px">
        <Skeleton
          v-for="(h, i) in [30, 25, 45, 70, 90]"
          :key="i"
          width="20%"
          :height="`${h}%`"
          class="mr-2"
        />
      </div>

      <Skeleton v-for="i in Array(10).keys()" :key="i" class="mt-4" />
    </template>

    <template v-else>
      Last updated {{ timeAgo }}
      <TextBtn small icon="i-carbon-renew" @click="refresh()" />

      <Chart
        type="line"
        :data="chartData"
        :options="chartOptions"
        style="height: 400px"
      />

      <DataTable
        :value="data.weeks"
        sort-field="week"
        class="font-mono"
        size="small"
        :sort-order="-1"
      >
        <Column field="week" header="Week" :sortable="true">
          <template #body="props">
            {{ props.data.week }}
          </template>
        </Column>
        <Column
          field="count"
          header="Count"
          :sortable="true"
          class="!text-right"
        />
      </DataTable>
    </template>
  </div>
</template>
