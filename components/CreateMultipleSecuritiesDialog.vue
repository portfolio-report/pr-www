<template>
  <v-dialog v-if="value" :value="true" width="600" persistent>
    <v-form @submit.prevent="">
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
                  <v-icon>{{ icons.mdiCheck }}</v-icon> Create all
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
            <v-icon>{{ icons.mdiClose }}</v-icon> Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  useContext,
  watch,
} from '@nuxtjs/composition-api'

import icons from '@/components/icons'
import BtnLoading from '~/components/BtnLoading.vue'
import { Security } from '@/store/security.model'

export default defineComponent({
  name: 'CreateMultipleSecuritiesDialog',

  components: { BtnLoading },

  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update'],

  setup(props, { emit }) {
    const { $axios } = useContext()

    watch(
      () => props.value,
      (selection, _prevSelection) => {
        if (selection === true) {
          textInput.value = ''
          securitiesCreated.value = 0
        }
      }
    )

    const securitiesCreated = ref(0)
    const textInput = ref('')

    const isins = computed(() => {
      const isinRegex = /\b([A-Z]{2})([A-Z0-9]{9})([0-9]{1})\b/g
      const isins = [...textInput.value.matchAll(isinRegex)].map((e) => e[0])

      // return unique values
      return [...new Set(isins)]
    })

    async function batchCreate() {
      for (const isin of isins.value) {
        const security: Security = {
          name: '',
          isin,
          wkn: null,
          securityType: null,
          symbolXfra: null,
          symbolXnas: null,
          symbolXnys: null,
        }
        await $axios.$post(`/securities/`, security)
        securitiesCreated.value += 1
      }
    }

    function close() {
      emit('input', false)
      if (securitiesCreated.value > 0) {
        emit('update')
      }
    }

    return {
      textInput,
      securitiesCreated,
      isins,
      batchCreate,
      close,
      icons,
    }
  },
})
</script>
