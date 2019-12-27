<template>
  <v-layout column justify-center>
    <v-flex xs12 sm8 md6>
      <v-tabs background-color="primary" dark slider-color="secondary" grow>
        <v-tab key="database">Database</v-tab>
        <v-tab key="fts">Full text search</v-tab>

        <v-tab-item key="database">
          <v-card flat>
            <v-card-text>Create backup files:</v-card-text>
            <v-card-actions>
              <btn-loading color="primary" :action="createBackups">
                Create Backups
              </btn-loading>
            </v-card-actions>
          </v-card>

          <v-data-table :headers="headers" :items="entries" :loading="loading">
            <template v-slot:items="props">
              <td>{{ props.item.name }}</td>
              <td>{{ props.item.size }}</td>
            </template>
            <template v-slot:item.action="{ item }">
              <v-icon small class="mr-2" @click="downloadItem(item)">
                mdi-download
              </v-icon>
              <v-icon small class="mr-2" @click="restoreItem(item)">
                mdi-backup-restore
              </v-icon>
              <v-icon small @click="deleteItem(item)">
                mdi-delete
              </v-icon>
            </template>
          </v-data-table>

          <DialogConfirm ref="confirm" />

          <v-overlay :value="loadingRestore">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
            <div class="title">Restore ongoing...</div>
          </v-overlay>
        </v-tab-item>

        <v-tab-item key="fts">
          <v-card flat>
            <v-card-text>
              Update full text search index to reflect database changes
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" @click="updateFts">
                Update index
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-tab-item>
      </v-tabs>
    </v-flex>
  </v-layout>
</template>

<script>
import debounce from 'lodash/debounce'
import DialogConfirm from '../../components/dialog-confirm'
import BtnLoading from '../../components/btn-loading'
export default {
  layout: 'admin',
  components: { DialogConfirm, BtnLoading },
  data() {
    return {
      loadingRestore: false,
      entries: [],
      loading: false,
      headers: [
        {
          text: 'Name',
          value: 'name',
        },
        {
          text: 'Size',
          value: 'size',
        },
        { text: 'Actions', value: 'action', sortable: false },
      ],
    }
  },
  mounted() {
    this.getEntries()
  },
  methods: {
    getEntries: debounce(async function() {
      this.loading = true
      this.entries = await this.$axios.$get('/api/backups/')
      this.loading = false
    }, 300), // debounce 300ms
    downloadItem(item) {
      const link = document.createElement('a')
      link.href = `/api/backups/${item.name}`
      document.body.appendChild(link)
      link.click()
    },
    async createBackups() {
      await this.$axios.$post(`/api/backups/`)
      this.getEntries()
    },
    async deleteItem(item) {
      if (
        await this.$refs.confirm.open({
          title: 'Delete backup file',
          message: `Are you sure you want to delete the backup file "${item.name}"?`,
          color: 'secondary',
        })
      ) {
        await this.$axios.$delete(`/api/backups/${item.name}`)
        this.getEntries()
      }
    },
    async restoreItem(item) {
      this.loadingRestore = true
      if (
        await this.$refs.confirm.open({
          title: 'Restore backup file',
          message: `Are you sure you want to restore the backup file "${item.name}"?`,
          color: 'secondary',
        })
      ) {
        await this.$axios.$post(`/api/backups/${item.name}/restore`)
      }
      this.loadingRestore = false
    },

    updateFts() {
      this.$axios.post('/api/securities/search/update')
    },
  },
  head() {
    return {
      title: 'Portfolio Report Admin',
    }
  },
}
</script>
