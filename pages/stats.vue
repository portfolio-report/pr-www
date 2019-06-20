<template>
  <div>
    <h1>Statistics</h1>
    <v-select v-model="selectedPackage" :items="packageArray" label="Package">
      <template slot="item" slot-scope="data">
        {{ data.item.name }} ({{ data.item.total }})
      </template>
      <template slot="selection" slot-scope="data">
        {{ data.item.name }}
      </template>
    </v-select>
    <div v-if="typeof selectedPackage.name !== 'undefined'">
      <h2>Package {{ selectedPackage.name }}</h2>

      <GChart type="ColumnChart" :data="chartData" />

      <v-data-table
        :headers="headers"
        :items="versionArray"
        :hide-actions="true"
      >
        <template v-slot:items="props">
          <tr @click="selectedVersion = props.item">
            <td>{{ props.item.name }}</td>
            <td>
              {{ props.item.dt_first_update.toLocaleString('de-DE') }}
            </td>
            <td>
              {{ props.item.dt_last_update.toLocaleString('de-DE') }}
            </td>
            <td class="text-xs-right">{{ props.item.total }}</td>
            <td><v-btn>Details</v-btn></td>
          </tr>
        </template>
      </v-data-table>

      <div v-if="selectedVersion !== null">
        <h3>Version {{ selectedVersion.name }}</h3>
        <h4>Updates by date</h4>
        <date-view :dates="selectedVersion.dates" />
        <h4>Updates by country</h4>
        <country-view :countries="selectedVersion.countries" />
      </div>
    </div>
  </div>
</template>

<script>
import DateView from '~/components/stats-date'
import CountryView from '~/components/stats-country'
import { GChart } from 'vue-google-charts'

export default {
  components: {
    DateView,
    CountryView,
    GChart
  },
  head() {
    return {
      title: 'Portfolio Report'
    }
  },
  data() {
    return {
      selectedPackage: {},
      selectedVersion: null,
      headers: [
        {
          text: 'Version',
          align: 'left',
          sortable: true,
          value: 'date'
        },
        {
          text: 'From',
          align: 'left',
          sortable: true,
          value: 'dt_first_update'
        },
        {
          text: 'To',
          align: 'left',
          sortable: true,
          value: 'dt_last_update'
        },
        {
          text: 'Count',
          align: 'right',
          sortable: true,
          value: 'count'
        },
        { text: 'Show details', value: '' }
      ]
    }
  },
  computed: {
    packageArray: function() {
      return Object.entries(this.stats.updates.packages).map(e => {
        return { name: e[0], ...e[1] }
      })
    },
    versionArray: function() {
      return Object.entries(this.selectedPackage.versions).map(e => {
        return { name: e[0], ...e[1] }
      })
    },
    chartData: function() {
      return [['Version', 'Count']].concat(
        this.versionArray.map(e => {
          return [e.name, e.total]
        })
      )
    }
  },
  async asyncData({ $axios }) {
    const stats = await $axios.$get('/api/stats/updates')

    /* Convert datetime strings to objects */
    for (const p in stats.updates.packages) {
      for (const v in stats.updates.packages[p].versions) {
        if (stats.updates.packages[p].versions[v].dt_first_update) {
          stats.updates.packages[p].versions[v].dt_first_update = new Date(
            stats.updates.packages[p].versions[v].dt_first_update
          )
        }
        if (stats.updates.packages[p].versions[v].dt_last_update) {
          stats.updates.packages[p].versions[v].dt_last_update = new Date(
            stats.updates.packages[p].versions[v].dt_last_update
          )
        }
      }
    }

    return { stats }
  }
}
</script>
