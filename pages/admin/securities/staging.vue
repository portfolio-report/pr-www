<template>
  <v-layout column justify-center>
    <v-flex xs12 sm8 md6>
      <v-tabs slider-color="secondary" grow>
        <v-tab key="delete">1. Delete</v-tab>
        <v-tab key="import">2. Import</v-tab>

        <v-tab-item key="delete">
          <v-card flat>
            <v-card-text>
              Before starting a new staging, you should delete the database.
            </v-card-text>
            <v-card-actions>
              <DialogConfirm ref="confirm" />
              <v-btn color="primary" @click="deleteStaging">
                Delete staged securities
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-tab-item>

        <v-tab-item key="import">
          <v-card flat>
            <v-card-text>
              <p>
                Download list of all tradable instruments from
                <a
                  target="_blank"
                  href="https://www.xetra.com/xetra-en/instruments/instruments"
                  >Xetra</a
                >.
              </p>

              <p>Read file: <input type="file" @change="openImportFile" /></p>

              <p v-if="importFileContent">
                Content: "{{ importFileContent.substring(0, 50) }}..." <br />
                Size: {{ Math.round(importFileContent.length / 1024) }} kB
              </p>

              <v-btn
                color="primary"
                :disabled="loadingImport || !importFileContent"
                :loading="loadingImport"
                @click="importFile"
                >Import</v-btn
              >
            </v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs>
    </v-flex>
  </v-layout>
</template>

<script>
import DialogConfirm from '../../../components/dialog-confirm'

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
      importFileContent: '',
      loadingImport: false,
    }
  },
  methods: {
    /**
     * Delete all staged securities via API
     */
    async deleteStaging() {
      if (
        await this.$refs.confirm.open({
          title: `Delete staged securities`,
          message: 'Are you sure you want to delete all staged securities?',
          color: 'secondary',
        })
      ) {
        await this.$axios.$delete(`/api/securities-staging`)
      }
    },

    /**
     * Read file
     */
    async openImportFile(event) {
      this.importFileContent = null

      function readAsTextAsync(file) {
        return new Promise((resolve, reject) => {
          const fr = new FileReader()
          fr.onload = e => resolve(e.target.result)
          fr.readAsText(file)
        })
      }
      this.importFileContent = await readAsTextAsync(event.target.files[0])
    },

    /**
     * Send content of the file to API
     */
    async importFile() {
      this.loadingImport = true
      await this.$axios.post(
        `/api/securities-staging`,
        this.importFileContent,
        {
          headers: { 'Content-Type': 'text/plain' },
          params: {
            sourceFormat: 'xetra',
          },
        }
      )
      this.loadingImport = false
    },
  },
}
</script>
