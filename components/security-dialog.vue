<template>
  <v-dialog v-model="dialog" width="600">
    <v-form @submit.prevent="save">
      <v-card>
        <v-card-title v-if="!!selectedSecurity.uuid">
          Edit security {{ selectedSecurity.uuid }}
        </v-card-title>
        <v-card-title v-else>Create security</v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="12" md="8">
                <v-text-field
                  v-if="!!selectedSecurity.uuid"
                  v-model="selectedSecurity.uuid"
                  label="UUID"
                  disabled
                />
              </v-col>
              <v-col cols="12" sm="12" md="8">
                <v-text-field v-model="selectedSecurity.name" label="Name" />
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="selectedSecurity.isin" label="ISIN" />
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="selectedSecurity.wkn" label="WKN" />
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="selectedSecurity.symbolXfra"
                  label="Symbol Frankfurt"
                />
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="selectedSecurity.symbolXnas"
                  label="Symbol NASDAQ"
                />
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="selectedSecurity.symbolXnys"
                  label="Symbol New York"
                />
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="selectedSecurity.securityType"
                  label="Type"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="cancel">
            <v-icon>{{ mdiClose }}</v-icon> Cancel
          </v-btn>
          <v-btn type="submit" color="primary" text>
            <v-icon>{{ mdiCheck }}</v-icon> Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, mixins } from 'nuxt-property-decorator'

import { IconsMixin } from '@/components/icons-mixin'
import SelectSecurityType from '@/components/select-security-type.vue'
import { Security } from '@/store/security.model'

@Component({ components: { SelectSecurityType } })
export default class SecurityDialog extends mixins(Vue, IconsMixin) {
  dialog = false
  resolve?: (value: Security | null) => void
  reject: any

  selectedSecurity: Security = {} as Security

  public create(): Promise<Security | null> {
    this.selectedSecurity = {
      name: '',
      isin: '',
      wkn: '',
      securityType: '',
      symbolXfra: '',
      symbolXnas: '',
      symbolXnys: '',
    }
    this.dialog = true

    return new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }

  public edit(security: Security): Promise<Security | null> {
    this.selectedSecurity = { ...security }
    this.dialog = true

    return new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }

  addDashesToUuid(uuid: string): string {
    if (/^[0-9a-f]{32}$/.test(uuid)) {
      return (
        uuid.substr(0, 8) +
        '-' +
        uuid.substr(8, 4) +
        '-' +
        uuid.substr(12, 4) +
        '-' +
        uuid.substr(16, 4) +
        '-' +
        uuid.substr(20)
      )
    } else {
      return uuid
    }
  }

  async save() {
    let security: Security
    if (this.selectedSecurity.uuid) {
      security = await this.$axios.$patch(
        `/securities/${this.addDashesToUuid(this.selectedSecurity.uuid)}`,
        this.selectedSecurity
      )
    } else {
      security = await this.$axios.$post(`/securities/`, this.selectedSecurity)
    }
    this.dialog = false
    if (this.resolve) {
      this.resolve(security)
    }
  }

  cancel() {
    this.dialog = false
    if (this.resolve) {
      this.resolve(null)
    }
  }
}
</script>
