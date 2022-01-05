<template>
  <div v-if="!!stats">
    <h1>Statistics</h1>
    Last update: {{ stats.lastUpdate }}
    <h2>Client Updates</h2>

    <BarChart :chart-data="chartData" :options="chartOptions" />

    <v-data-table
      :headers="headers"
      :items="stats.versions"
      :hide-default-footer="true"
      sort-by="version"
      :items-per-page="-1"
    >
      <template #item="props">
        <tr @click="selectVersion(props.item.version)">
          <td>{{ props.item.version }}</td>
          <td>
            {{ props.item.firstUpdate.toLocaleString('de-DE') }}
          </td>
          <td>
            {{ props.item.lastUpdate.toLocaleString('de-DE') }}
          </td>
          <td class="text-right">{{ props.item.count }}</td>
          <td><v-btn>Details</v-btn></td>
        </tr>
      </template>
    </v-data-table>

    <div v-if="selectedVersion !== null">
      <h3>Version {{ selectedVersion }}</h3>
      <h4>Updates by date</h4>
      <date-view :dates="selectedVersionByDate" />
      <h4>Updates by country</h4>
      <country-view :countries="selectedVersionByCountry" />
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  useAsync,
  useContext,
} from '@nuxtjs/composition-api'
import { BarChart } from 'vue-chart-3'

import DateView from '~/components/stats-date.vue'
import CountryView from '~/components/stats-country.vue'

export default defineComponent({
  name: 'StatsPage',

  components: {
    DateView,
    CountryView,
    BarChart,
  },

  setup() {
    const { $axios } = useContext()

    const selectedVersion = ref<string | null>(null)
    const selectedVersionByDate = ref<Array<{ date: string; count: number }>>(
      []
    )
    const selectedVersionByCountry = ref<
      Array<{ country: string; count: number }>
    >([])

    const stats = useAsync(async () => {
      const versions = await $axios.$get<
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

    const headers = [
      {
        text: 'Version',
        align: 'left',
        sortable: true,
        value: 'version',
      },
      {
        text: 'From',
        align: 'left',
        sortable: true,
        value: 'firstUpdateInt',
      },
      {
        text: 'To',
        align: 'left',
        sortable: true,
        value: 'lastUpdateInt',
      },
      {
        text: 'Count',
        align: 'right',
        sortable: true,
        value: 'count',
      },
      { text: 'Show details', value: '' },
    ]

    const chartData = computed(() => ({
      labels: stats.value?.versions.map((e) => e.version),
      datasets: [
        {
          label: 'count',
          backgroundColor: '#006e90',
          data: stats.value?.versions.map((e) => e.count),
        },
      ],
    }))

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
    }

    async function selectVersion(version: string) {
      const { byDate, byCountry } = await $axios.$get(
        `/stats/updates/${version}`
      )
      selectedVersion.value = version
      selectedVersionByDate.value = byDate
      selectedVersionByCountry.value = byCountry
    }

    return {
      stats,
      selectedVersion,
      selectedVersionByDate,
      selectedVersionByCountry,
      headers,
      chartData,
      chartOptions,
      selectVersion,
    }
  },

  head() {
    return {
      title: 'Portfolio Report',
    }
  },
})
</script>
