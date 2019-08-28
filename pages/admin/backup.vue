<template>
  <v-layout column justify-center>
    <v-flex xs12 sm8 md6>
      <v-tabs background-color="primary" dark slider-color="secondary" grow>
        <v-tab key="backup">Backup</v-tab>
        <v-tab key="restore">Restore</v-tab>

        <v-tab-item key="backup">
          <v-card flat>
            <v-card-text>Download backup files:</v-card-text>
            <v-btn
              color="primary"
              :loading="loadingSecurities"
              :disabled="loadingSecurities"
              @click="downloadSecurities"
            >
              Download securities
            </v-btn>
            <v-btn
              color="primary"
              :loading="loadingStats"
              :disabled="loadingStats"
              @click="downloadStats"
            >
              Download stats data
            </v-btn>
          </v-card>
        </v-tab-item>
        <v-tab-item key="restore">
          <v-card flat>
            <v-card-text>
              <input type="file" @change="handleFileUpload" />
            </v-card-text>
            <v-list>
              <v-list-item>
                Type: {{ restoreBackupInfo.entityType }}
              </v-list-item>
              <v-list-item>
                Number of entries: {{ restoreBackupInfo.length }}
              </v-list-item>
            </v-list>

            <DialogConfirm ref="confirm" />
            <v-btn
              color="secondary"
              :loading="loadingRestore"
              :disabled="loadingRestore || !restoreBackupValid"
              @click="restoreBackup"
            >
              Restore
            </v-btn>
          </v-card>
        </v-tab-item>
      </v-tabs>
    </v-flex>
  </v-layout>
</template>

<script>
import DialogConfirm from '../../components/dialog-confirm'
export default {
  layout: 'admin',
  components: { DialogConfirm },
  head() {
    return {
      title: 'Portfolio Report Admin',
    }
  },
  data() {
    return {
      loadingSecurities: false,
      loadingStats: false,
      loadingRestore: false,
      restoreFileContent: null,
    }
  },
  computed: {
    restoreBackupInfo() {
      if (
        this.restoreFileContent &&
        this.restoreFileContent.backup &&
        this.restoreFileContent.entries &&
        Array.isArray(this.restoreFileContent.entries)
      ) {
        return {
          entityType: this.restoreFileContent.backup.entityType,
          length: this.restoreFileContent.entries.length,
        }
      } else {
        return { entityType: '-', length: '-' }
      }
    },
    restoreBackupValid() {
      return (
        this.restoreFileContent !== null &&
        ['securities', 'stats'].includes(this.restoreBackupInfo.entityType)
      )
    },
  },
  methods: {
    async downloadBackup(entityType) {
      const data = await this.$axios.$get(`/api/${entityType}?limit=0`)

      // Add information to identify the backup
      data.backup = { entityType }

      const url = window.URL.createObjectURL(
        new Blob([JSON.stringify(data)], { type: 'application/json' })
      )
      const link = document.createElement('a')
      link.href = url
      link.setAttribute(
        'download',
        `backup-${entityType}-${new Date().toISOString()}.json`
      )
      document.body.appendChild(link)
      link.click()
    },
    async downloadSecurities() {
      this.loadingSecurities = true
      await this.downloadBackup('securities')
      this.loadingSecurities = false
    },
    async downloadStats() {
      this.loadingStats = true
      await this.downloadBackup('stats')
      this.loadingStats = false
    },
    async handleFileUpload(event) {
      // Prevent restore of previous file
      this.restoreFileContent = null

      function readAsTextAsync(file) {
        return new Promise((resolve, reject) => {
          const fr = new FileReader()
          fr.onload = e => resolve(e.target.result)
          fr.readAsText(file)
        })
      }

      this.restoreFileContent = JSON.parse(
        await readAsTextAsync(event.target.files[0])
      )
    },
    async restoreBackup() {
      this.loadingRestore = true

      const entityType = this.restoreBackupInfo.entityType

      if (
        await this.$refs.confirm.open({
          title: `Restore ${entityType}`,
          message:
            'Are you sure you want to replace the current database content?',
          color: 'secondary',
        })
      ) {
        // Delete existing securities
        await this.$axios.$delete(`/api/${entityType}`)

        // Insert securities from file
        await this.$axios.post(
          `/api/${entityType}?multiple`,
          this.restoreFileContent.entries,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }

      this.loadingRestore = false
    },
  },
}
</script>
