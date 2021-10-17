<template>
  <v-dialog v-model="dialog" width="600" persistent>
    <v-form @submit.prevent="save">
      <v-card>
        <v-card-title>Create multiple securities</v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="12">
                <v-textarea
                  v-model="textInput"
                  outlined
                  placeholder="Paste ISINs here"
                />
              </v-col>
              <v-col cols="12" sm="12">
                <v-chip v-for="isin in isins" :key="isin" class="ma-2">
                  {{ isin }}
                </v-chip>
              </v-col>
              <v-col cols="12" sm="12">
                <btn-loading
                  color="primary"
                  :disabled="isins.length == 0"
                  :action="batchCreate"
                >
                  <v-icon>{{ mdiCheck }}</v-icon> Create all
                  {{ isins.length }} securities
                </btn-loading>
              </v-col>
              <v-col cols="12" sm="12">
                <v-alert v-if="securitiesCreated > 0" type="info">
                  {{ securitiesCreated }} securities created
                </v-alert>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="close">
            <v-icon>{{ mdiClose }}</v-icon> Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, mixins } from 'nuxt-property-decorator'

import { IconsMixin } from '@/components/icons-mixin'
import BtnLoading from '@/components/btn-loading.vue'
import { Security } from '@/store/security.model'

@Component({ components: { BtnLoading } })
export default class CreateMultipleSecuritiesDialog extends mixins(
  Vue,
  IconsMixin
) {
  dialog = false
  resolve?: (value: Boolean) => void
  reject: any

  securitiesCreated = 0

  textInput = ''

  public show(): Promise<Boolean> {
    this.textInput = ''
    this.securitiesCreated = 0
    this.dialog = true

    return new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }

  get isins() {
    const isinRegex = /\b([A-Z]{2})([A-Z0-9]{9})([0-9]{1})\b/g
    const isins = [...this.textInput.matchAll(isinRegex)].map((e) => e[0])

    // return unique values
    return [...new Set(isins)]
  }

  async batchCreate() {
    for (const isin of this.isins) {
      const security: Security = {
        name: '',
        isin,
        wkn: null,
        securityType: null,
        symbolXfra: null,
        symbolXnas: null,
        symbolXnys: null,
      }
      await this.$axios.$post(`/securities/`, security)
      this.securitiesCreated += 1
    }
  }

  close() {
    this.dialog = false
    if (this.resolve) {
      this.resolve(this.securitiesCreated > 0)
    }
  }
}
</script>
