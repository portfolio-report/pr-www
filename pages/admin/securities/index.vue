<template>
  <v-row align="center" justify="center">
    <v-col cols="12">
      <v-toolbar color="primary" dark>
        <v-toolbar-title>Securities</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="newSecurity">
          <v-icon>{{ icons.mdiPlus }}</v-icon>
        </v-btn>

        <v-btn icon @click="newSecurities">
          <v-icon>{{ icons.mdiTextBoxPlus }}</v-icon>
        </v-btn>

        <v-menu bottom left offset-y :close-on-content-click="false">
          <template #activator="{ on }">
            <v-btn icon v-on="on">
              <v-icon>{{
                securitySearch || securityType
                  ? icons.mdiFilter
                  : icons.mdiFilterOutline
              }}</v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-list>
              <v-subheader>Search</v-subheader>

              <v-list-item>
                <v-list-item-content>
                  <v-text-field
                    v-model="securitySearch"
                    :append-icon="icons.mdiMagnify"
                    clearable
                    single-line
                    dense
                    outlined
                  />
                </v-list-item-content>
              </v-list-item>
              <v-divider />
              <v-list-item>
                <v-list-item-content>
                  <select-security-type v-model="securityType" />
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </v-toolbar>

      <v-data-table
        :headers="[
          {
            text: 'UUID',
            value: 'uuid',
          },
          {
            text: 'Name',
            align: 'left',
            sortable: true,
            value: 'name',
          },
          { text: 'ISIN', value: 'isin' },
          { text: 'WKN', value: 'wkn' },
          { text: 'Type', value: 'securityType' },
          { text: 'Actions', value: 'action', sortable: false },
        ]"
        :items="entries"
        :options.sync="pagination"
        :server-items-length="totalItems"
        :footer-props="footerProps"
        :loading="loading"
      >
        <template #item.name="{ item }">
          <nuxt-link :to="'/admin/securities/' + item.uuid">
            {{ item.name }}
          </nuxt-link>
        </template>
        <template #item.action="{ item }">
          <v-btn color="primary" icon text @click="editSecurity(item)">
            <v-icon>{{ icons.mdiPencil }}</v-icon>
          </v-btn>
          <v-btn color="error" icon text @click="deleteSecurity(item)">
            <v-icon>{{ icons.mdiDelete }}</v-icon>
          </v-btn>
        </template>
      </v-data-table>

      <v-btn color="primary" @click="updateFts">Update FTS index</v-btn>

      <CreateMultipleSecuritiesDialog
        v-model="showCreateMultipleSecuritiesDialog"
        @update="getSecurities"
      />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  useContext,
  watch,
} from '@nuxtjs/composition-api'
import debounce from 'lodash/debounce'

import icons from '@/components/icons'
import SelectSecurityType from '~/components/SelectSecurityType.vue'
import { Security } from '@/store/security.model'
import { useSecurityDialog } from '@/components/SecurityDialogProvider.vue'
import { useConfirmDialog } from '@/components/useConfirmDialog'
import CreateMultipleSecuritiesDialog from '~/components/CreateMultipleSecuritiesDialog.vue'

export default defineComponent({
  name: 'SecuritiesPage',

  components: {
    CreateMultipleSecuritiesDialog,
    SelectSecurityType,
  },

  middleware: 'auth',

  setup() {
    const { $axios } = useContext()

    const createSecurityDialog = useSecurityDialog()
    const showConfirmDialog = useConfirmDialog()

    const showCreateMultipleSecuritiesDialog = ref(false)

    const selectedSecurity: Security = {} as Security

    const entries = ref<Security[]>([])

    const searchQuery = ref('')
    const pagination = ref({
      itemsPerPage: 10,
      sortBy: ['name'],
      sortDesc: [false],
      page: 1,
    })

    const securitySearch = ref('')
    const securityType = ref('')
    const totalItems = ref(0)
    const loading = ref(false)
    const footerProps = { 'items-per-page-options': [10, 25, 50, 100] }

    async function getSecuritiesRaw() {
      loading.value = true

      const res = await $axios.$get('/securities/', {
        params: {
          sort: pagination.value.sortBy[0],
          skip: pagination.value.itemsPerPage * (pagination.value.page - 1),
          limit: pagination.value.itemsPerPage,
          desc: pagination.value.sortDesc[0],
          search: securitySearch.value,
          securityType: securityType.value,
        },
      })
      entries.value = res.entries
      totalItems.value = res.params.totalCount

      loading.value = false
    }

    const getSecurities = debounce(getSecuritiesRaw, 300)

    watch(pagination, getSecurities)
    watch(securitySearch, getSecurities)
    watch(securityType, getSecurities)

    async function newSecurity() {
      const sec = await createSecurityDialog()

      if (sec) {
        // Update to reflect changes
        getSecurities()

        await editSecurity(sec)
      }
    }

    function newSecurities() {
      showCreateMultipleSecuritiesDialog.value = true
    }

    async function editSecurity(security: Security) {
      if (await createSecurityDialog(security)) {
        // Update to reflect changes
        getSecurities()
      }
    }

    async function deleteSecurity(security: Security) {
      if (
        await showConfirmDialog(
          `Are you sure you want to delete "${security.name}"?`,
          { title: 'Delete security', color: 'secondary' }
        )
      ) {
        await $axios.$delete(`/securities/${security.uuid}`)
        getSecurities()
      }
    }

    function updateFts() {
      $axios.post('/securities/search/update')
    }

    return {
      showCreateMultipleSecuritiesDialog,
      selectedSecurity,
      entries,
      searchQuery,
      pagination,
      securitySearch,
      securityType,
      totalItems,
      loading,
      footerProps,
      newSecurity,
      newSecurities,
      editSecurity,
      deleteSecurity,
      updateFts,
      getSecurities,
      icons,
    }
  },

  head() {
    return {
      title: 'Portfolio Report Admin',
    }
  },
})
</script>
