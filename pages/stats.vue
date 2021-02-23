<template>
  <div>
    <h1>Statistics</h1>
    Last update: {{ lastUpdate.toISOString() }}
    <h2>Client Updates</h2>

    <bar-chart :chartdata="chartData" :options="chartOptions" />

    <v-data-table
      :headers="headers"
      :items="versions"
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
import { Component, Vue } from 'nuxt-property-decorator'

import BarChart from '~/components/bar-chart.vue'
import DateView from '~/components/stats-date.vue'
import CountryView from '~/components/stats-country.vue'

@Component({
  components: {
    DateView,
    CountryView,
    BarChart,
  },
  async asyncData({ $axios }) {
    const lastUpdate = new Date()
    const versions = await $axios.$get('/stats/updates')

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

    return { lastUpdate, versions }
  },
})
export default class StatsPage extends Vue {
  // asyncData
  lastUpdate!: Date
  versions!: Array<{
    version: string
    count: number
    firstUpdate: Date
    firstUpdateInt: number
    lastUpdate: Date
    lastUpdateInt: number
  }>

  selectedVersion: string | null = null
  selectedVersionByDate: Array<{ date: string; count: number }> = []
  selectedVersionByCountry: Array<{ country: string; count: number }> = []

  headers = [
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

  get chartData() {
    return {
      labels: this.versions.map((e) => e.version),
      datasets: [
        {
          label: 'count',
          backgroundColor: '#006e90',
          data: this.versions.map((e) => e.count),
        },
      ],
    }
  }

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  }

  async selectVersion(version: string) {
    const { byDate, byCountry } = await this.$axios.$get(
      `/stats/updates/${version}`
    )
    this.selectedVersion = version
    this.selectedVersionByDate = byDate
    this.selectedVersionByCountry = byCountry
  }

  head() {
    return {
      title: 'Portfolio Report',
    }
  }
}
</script>
