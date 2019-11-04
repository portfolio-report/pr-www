<template>
  <div>
    <h1>Statistics</h1>
    <h2>Client Updates</h2>

    <GChart type="ColumnChart" :data="chartData" />

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

<script>
import { GChart } from 'vue-google-charts'
import DateView from '~/components/stats-date'
import CountryView from '~/components/stats-country'

export default {
  components: {
    DateView,
    CountryView,
    GChart,
  },
  head() {
    return {
      title: 'Portfolio Report',
    }
  },
  data() {
    return {
      selectedVersion: null,
      headers: [
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
      ],
    }
  },
  computed: {
    chartData() {
      return [['Version', 'Count']].concat(
        this.stats.versions
          .map(e => [e.version, e.count])
          .sort((a, b) => a[0].localeCompare(b[0]))
      )
    },
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
}
</script>
