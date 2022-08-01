<template>
  <div>
    <slot />
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
              <v-icon>{{ icons.mdiClose }}</v-icon> Cancel
            </v-btn>
            <v-btn type="submit" color="primary" text>
              <v-icon>{{ icons.mdiCheck }}</v-icon> Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import {
  InjectionKey,
  defineComponent,
  inject,
  provide,
  ref,
  useContext,
} from '@nuxtjs/composition-api'

import icons from '@/components/icons'
import { Security } from '@/store/security.model'

export type CreateSecurityDialog = (
  security?: Security
) => Promise<Security | null>

export const CreateSecurityDialogKey: InjectionKey<CreateSecurityDialog> =
  Symbol('CreateSecurityDialogKey')

export function useSecurityDialog() {
  const dialog = inject(CreateSecurityDialogKey)

  if (!dialog) {
    throw new Error('Could not resolve provider')
  }

  return dialog
}

export default defineComponent({
  name: 'SecurityDialogProvider',

  setup() {
    const { $axios } = useContext()

    const dialog = ref(false)
    const resolveFunc = ref<null | ((value: Security | null) => void)>(null)
    const rejectFunc = ref<any>()

    const selectedSecurity = ref<Security>({} as Security)

    function show(security?: Security): Promise<Security | null> {
      if (security) {
        selectedSecurity.value = { ...security }
      } else {
        selectedSecurity.value = {
          name: '',
          isin: '',
          wkn: '',
          securityType: '',
          symbolXfra: '',
          symbolXnas: '',
          symbolXnys: '',
        }
      }

      dialog.value = true

      return new Promise((resolve, reject) => {
        resolveFunc.value = resolve
        rejectFunc.value = reject
      })
    }

    provide(CreateSecurityDialogKey, show)

    function addDashesToUuid(uuid: string): string {
      if (/^[0-9a-f]{32}$/.test(uuid)) {
        return (
          uuid.substring(0, 8) +
          '-' +
          uuid.substring(8, 12) +
          '-' +
          uuid.substring(12, 16) +
          '-' +
          uuid.substring(16, 20) +
          '-' +
          uuid.substring(20)
        )
      } else {
        return uuid
      }
    }

    async function save() {
      let security: Security
      if (selectedSecurity.value.uuid) {
        security = await $axios.$patch(
          `/securities/${addDashesToUuid(selectedSecurity.value.uuid)}`,
          selectedSecurity.value
        )
      } else {
        security = await $axios.$post(`/securities/`, selectedSecurity.value)
      }
      dialog.value = false
      if (resolveFunc.value) {
        resolveFunc.value(security)
      }
    }

    function cancel() {
      dialog.value = false
      if (resolveFunc.value) {
        resolveFunc.value(null)
      }
    }

    return { save, cancel, dialog, selectedSecurity, icons }
  },
})
</script>
