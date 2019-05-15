<template>
  <v-layout column justify-center>
    <v-flex xs12 sm8 md6>
      <v-tabs color="primary" dark slider-color="secondary" grow>
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
          </v-card>
        </v-tab-item>
        <v-tab-item key="restore">
          <v-card flat>
            <v-card-text>
              <input type="file" @change="handleFileUpload" />
            </v-card-text>

            <DialogConfirm ref="confirm" />
            <v-btn
              color="secondary"
              :loading="loadingSecurities"
              :disabled="loadingSecurities || !restoreFileContent"
              @click="restoreSecurities"
            >
              Restore securities
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
      title: 'Portfolio Report Admin'
    }
  },
  data() {
    return {
      loadingSecurities: false,
      restoreFileContent: ''
    }
  },
  methods: {
    downloadSecurities: async function() {
      this.loadingSecurities = true

      const res = await this.$axios.$get('/api/securities?limit=0')

      const ret = JSON.stringify(res.entries)

      const url = window.URL.createObjectURL(
        new Blob([ret], { type: 'application/json' })
      )
      const link = document.createElement('a')
      link.href = url
      link.setAttribute(
        'download',
        `backup-securities-${new Date().toISOString()}.json`
      )
      document.body.appendChild(link)
      link.click()

      this.loadingSecurities = false
    },
    restoreSecurities: async function() {
      this.loadingSecurities = true

      if (
        await this.$refs.confirm.open({
          title: 'Restore securities',
          message:
            'Are you sure you want to replace the current database content?',
          color: 'secondary'
        })
      ) {
        // Delete existing securities
        await this.$axios.$delete('/api/securities')

        // Insert securities from file
        await this.$axios.post(
          '/api/securities?multiple',
          this.restoreFileContent,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
      }

      this.loadingSecurities = false
    },
    async handleFileUpload(event) {
      function readAsTextAsync(file) {
        return new Promise((resolve, reject) => {
          const fr = new FileReader()
          fr.onload = e => resolve(e.target.result)
          fr.readAsText(file)
        })
      }

      this.restoreFileContent = await readAsTextAsync(event.target.files[0])
    }
  }
}
</script>
