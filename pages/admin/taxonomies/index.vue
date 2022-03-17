<template>
  <v-row align="center" justify="center">
    <v-col cols="12">
      <v-toolbar color="primary" dark>
        <v-toolbar-title>Taxonomies</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="newTaxonomy">
          <v-icon>{{ icons.mdiPlus }}</v-icon>
        </v-btn>
      </v-toolbar>

      <v-data-table
        :items="taxonomies.filter((t) => t.parentUuid === null)"
        :items-per-page="-1"
        :headers="[
          { text: 'Name', value: 'name' },
          { text: 'UUID', value: 'uuid' },
          { value: 'actions' },
        ]"
        hide-default-footer
      >
        <template #item.name="{ item }">
          <nuxt-link :to="'/admin/taxonomies/' + item.uuid">
            {{ item.name }}
          </nuxt-link>
        </template>

        <template #item.actions="{ item }">
          <v-btn color="primary" icon text @click="editTaxonomy(item)">
            <v-icon>{{ icons.mdiPencil }}</v-icon>
          </v-btn>
          <v-btn color="error" icon text @click="deleteTaxonomy(item)">
            <v-icon>{{ icons.mdiDelete }}</v-icon>
          </v-btn>
        </template>
      </v-data-table>

      <v-dialog v-model="taxonomyDialog" width="500">
        <v-form ref="form" @submit.prevent="saveTaxonomy">
          <v-card>
            <v-card-text>
              <v-text-field
                v-model="selectedTaxonomy.name"
                label="Name"
                outlined
                dense
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn color="primary" text @click="taxonomyDialog = false">
                <v-icon>{{ icons.mdiClose }}</v-icon> Cancel
              </v-btn>
              <v-btn type="submit" color="primary" text>
                <v-icon>{{ icons.mdiCheck }}</v-icon> Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-dialog>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  ref,
  useContext,
} from '@nuxtjs/composition-api'

import { useConfirmDialog } from '~/components/useConfirmDialog'
import icons from '@/components/icons'

interface Taxonomy {
  uuid?: string
  name: string | null
  parentUuid?: string | null
}

export default defineComponent({
  name: 'TaxonomiesPage',

  middleware: 'auth',

  setup() {
    const { $axios } = useContext()

    const showConfirmDialog = useConfirmDialog()

    const taxonomyDialog = ref(false)
    const selectedTaxonomy = ref<Taxonomy>({ name: '' })

    const taxonomies = ref<Taxonomy[]>([])

    onMounted(getTaxonomies)

    async function getTaxonomies() {
      taxonomies.value = await $axios.$get('/taxonomies/')
    }

    function newTaxonomy() {
      selectedTaxonomy.value = { name: '' }
      taxonomyDialog.value = true
    }

    function editTaxonomy(taxonomy: Taxonomy) {
      selectedTaxonomy.value = { ...taxonomy }
      taxonomyDialog.value = true
    }

    async function saveTaxonomy() {
      if (selectedTaxonomy.value?.uuid) {
        await $axios.$patch(
          `/taxonomies/${selectedTaxonomy.value.uuid}`,
          selectedTaxonomy.value
        )
      } else {
        await $axios.$post(`/taxonomies/`, selectedTaxonomy.value)
      }
      getTaxonomies()
      taxonomyDialog.value = false
    }

    async function deleteTaxonomy(taxonomy: Taxonomy) {
      const confirmed = await showConfirmDialog(
        `Are you sure you want to delete "${taxonomy.name}"?`,
        {}
      )

      if (confirmed) {
        await $axios.$delete(`/taxonomies/${taxonomy.uuid}`)
        getTaxonomies()
      }
    }

    return {
      taxonomyDialog,
      selectedTaxonomy,
      taxonomies,
      newTaxonomy,
      editTaxonomy,
      saveTaxonomy,
      deleteTaxonomy,
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
