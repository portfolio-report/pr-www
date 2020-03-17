<template>
  <div>
    <h1>Statistics</h1>
    <h2>Client Updates</h2>

    <bar-chart :chartdata="chartData" :options="chartOptions" />

    <v-data-table
      :headers="headers"
      :items="stats.versions"
      :hide-default-footer="true"
      sort-by="version"
      :items-per-page="-1"
    >
      <template v-slot:item="props">
        <tr @click="selectedVersion = props.item">
          <td>{{ props.item.version }}</td>
          <td>
            {{ props.item.dt_first_update.toLocaleString('de-DE') }}
          </td>
          <td>
            {{ props.item.dt_last_update.toLocaleString('de-DE') }}
          </td>
          <td class="text-right">{{ props.item.count }}</td>
          <td><v-btn>Details</v-btn></td>
        </tr>
      </template>
    </v-data-table>

    <div v-if="selectedVersion !== null">
      <h3>Version {{ selectedVersion.version }}</h3>
      <h4>Updates by date</h4>
      <date-view :dates="selectedVersion.dates" />
      <h4>Updates by country</h4>
      <country-view :countries="selectedVersion.countries" />
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
    const stats = await $axios.$get('/api/stats/updates')

    /* Convert datetime strings to objects and numerical */
    for (const v of stats.versions) {
      if (v.dt_first_update) {
        v.dt_first_update = new Date(v.dt_first_update)
        v.sort_first_update = v.dt_first_update.getTime()
      }
      if (v.dt_last_update) {
        v.dt_last_update = new Date(v.dt_last_update)
        v.sort_last_update = v.dt_last_update.getTime()
      }
    }

    return { stats }
  },
})
export default class StatsPage extends Vue {
  // asyncData
  stats!: {
    versions: Array<{
      version: string
      count: number
      // eslint-disable-next-line camelcase
      dt_first_update: string
      // eslint-disable-next-line camelcase
      dt_last_update: string
      dates: Array<{ date: string; count: number }>
      countries: Array<{ country: string; count: number }>
    }>
  }

  selectedVersion: string | null = null
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
      value: 'sort_first_update',
    },
    {
      text: 'To',
      align: 'left',
      sortable: true,
      value: 'sort_last_update',
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
      labels: this.stats.versions.map(e => e.version),
      datasets: [
        {
          label: 'count',
          backgroundColor: '#006e90',
          data: this.stats.versions.map(e => e.count),
        },
      ],
    }
  }

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  }

  head() {
    return {
      title: 'Portfolio Report',
    }
  }
}
</script>
