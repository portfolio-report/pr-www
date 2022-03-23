<template>
  <v-row align="center" justify="center">
    <v-col cols="12">
      <v-toolbar color="primary" dark>
        <v-toolbar-title>Taxonomy: {{ root.name }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="newTaxonomy">
          <v-icon>{{ icons.mdiPlus }}</v-icon>
        </v-btn>
      </v-toolbar>

      <v-tabs v-model="tab" grow>
        <v-tab key="tree"> Tree </v-tab>
        <v-tab key="list"> List </v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab">
        <v-tab-item key="tree">
          <v-treeview :items="taxonomiesTree" hoverable open-on-click>
            <template #prepend="{}">
              <v-icon>{{ icons.mdiFamilyTree }}</v-icon>
            </template>
            <template #label="{ item }">
              {{ item.name }}
              <v-btn color="primary" icon text @click="editTaxonomy(item)">
                <v-icon>{{ icons.mdiPencil }}</v-icon>
              </v-btn>
            </template>
          </v-treeview>
        </v-tab-item>
        <v-tab-item key="list">
          <v-data-table
            :items="root.descendants"
            :items-per-page="-1"
            :headers="[
              { text: 'Name', value: 'name' },
              { text: 'Code', value: 'code' },
              { text: 'UUID', value: 'uuid' },
              { text: 'parentUuid', value: 'parentUuid' },
              { value: 'actions' },
            ]"
            hide-default-footer
          >
            <template #item.actions="{ item }">
              <v-btn color="primary" icon text @click="editTaxonomy(item)">
                <v-icon>{{ icons.mdiPencil }}</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-tab-item>
      </v-tabs-items>

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
              <v-text-field
                v-model="selectedTaxonomy.code"
                label="Code"
                outlined
                dense
              />
              <v-select
                v-model="selectedTaxonomy.parentUuid"
                label="Parent"
                outlined
                dense
                item-text="name"
                item-value="uuid"
                :items="[root, ...root.descendants]"
              />
            </v-card-text>
            <v-card-actions>
              <v-btn
                v-if="!!selectedTaxonomy.uuid"
                color="error"
                text
                @click="deleteTaxonomy(selectedTaxonomy)"
              >
                <v-icon>{{ icons.mdiDelete }}</v-icon> Delete
              </v-btn>
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
  computed,
  defineComponent,
  ref,
  useAsync,
  useContext,
} from '@nuxtjs/composition-api'

import { useConfirmDialog } from '~/components/useConfirmDialog'
import icons from '@/components/icons'

interface Taxonomy {
  uuid?: string
  parentUuid?: string
  name: string | null
  code: string | null
  children?: Taxonomy[]
}

export default defineComponent({
  name: 'TaxonomyPage',

  middleware: 'auth',

  setup() {
    const { $axios, error, params } = useContext()

    const showConfirmDialog = useConfirmDialog()

    const tab = ref('tree')
    const taxonomyDialog = ref(false)
    const selectedTaxonomy = ref<Taxonomy>({ name: '', code: '' })

    const rawRoot = useAsync(async () => {
      try {
        return await $axios.$get<{
          uuid: string
          name: string
          descendants: Taxonomy[]
        }>(`/taxonomies/${params.value.uuid}`)
      } catch (err) {
        error({ statusCode: 404, message: 'This page could not be found' })
      }
    })
    const root = computed(() =>
      rawRoot.value ? rawRoot.value : { uuid: '', name: '', descendants: [] }
    )

    const taxonomiesTree = computed(() =>
      root.value.uuid ? findChildren(root.value.uuid) : []
    )

    function findChildren(uuid: string) {
      const ret: Taxonomy[] = []

      const children = root.value?.descendants.filter(
        (t) => t.parentUuid === uuid
      )
      for (const child of children ?? []) {
        ret.push({ ...child, children: findChildren(child.uuid ?? '') })
      }

      return ret
    }

    async function getTaxonomies() {
      rawRoot.value = await $axios.$get(`/taxonomies/${params.value.uuid}`)
    }

    function newTaxonomy() {
      selectedTaxonomy.value = { name: '', code: '' }
      taxonomyDialog.value = true
    }

    function editTaxonomy(taxonomy: Taxonomy) {
      selectedTaxonomy.value = { ...taxonomy }
      taxonomyDialog.value = true
    }

    async function saveTaxonomy() {
      if (selectedTaxonomy.value.uuid) {
        await $axios.$put(
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

      taxonomyDialog.value = false
    }

    return {
      root,
      tab,
      taxonomyDialog,
      selectedTaxonomy,
      taxonomiesTree,
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
