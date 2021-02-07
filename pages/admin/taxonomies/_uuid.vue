<template>
  <v-row align="center" justify="center">
    <v-col cols="12">
      <v-toolbar color="primary" dark>
        <v-toolbar-title>Taxonomy: {{ root.name }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="newTaxonomy">
          <v-icon>{{ mdiPlus }}</v-icon>
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
              <v-icon>{{ mdiFamilyTree }}</v-icon>
            </template>
            <template #label="{ item }">
              {{ item.name }}
              <v-btn color="primary" icon text @click="editTaxonomy(item)">
                <v-icon>{{ mdiPencil }}</v-icon>
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
                <v-icon>{{ mdiPencil }}</v-icon>
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
                <v-icon>{{ mdiDelete }}</v-icon> Delete
              </v-btn>
              <v-spacer />
              <v-btn color="primary" text @click="taxonomyDialog = false">
                <v-icon>{{ mdiClose }}</v-icon> Cancel
              </v-btn>
              <v-btn type="submit" color="primary" text>
                <v-icon>{{ mdiCheck }}</v-icon> Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-dialog>

      <DialogConfirm ref="confirm" />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Vue, mixins } from 'nuxt-property-decorator'

import { IconsMixin } from '@/components/icons-mixin'
import DialogConfirm from '../../../components/dialog-confirm.vue'

interface Taxonomy {
  uuid?: string
  parentUuid?: string
  name: string | null
  children?: Taxonomy[]
}

@Component({
  async asyncData({ $axios, params, error }): Promise<any> {
    try {
      const root = await $axios.$get(`/api/taxonomies/${params.uuid}`)
      return { root, rootUuid: root.uuid }
    } catch (err) {
      error({ statusCode: 404, message: 'This page could not be found' })
    }
  },
  components: { DialogConfirm },
  middleware: 'auth',
})
export default class TaxonomyPage extends mixins(Vue, IconsMixin) {
  $refs!: {
    confirm: DialogConfirm
  }

  // asyncData
  root!: {
    name: string
    descendants: Taxonomy[]
  }

  rootUuid!: string

  tab = 'tree'
  taxonomyDialog = false
  selectedTaxonomy = {} as Taxonomy

  taxonomies: Taxonomy[] = []

  get taxonomiesTree() {
    return this.findChildren(this.rootUuid)
  }

  findChildren(uuid: string) {
    const ret: Taxonomy[] = []

    const children = this.root.descendants.filter((t) => t.parentUuid === uuid)
    for (const child of children) {
      ret.push({ ...child, children: this.findChildren(child.uuid ?? '') })
    }

    return ret
  }

  async getTaxonomies() {
    this.root = await this.$axios.$get(
      `/api/taxonomies/${this.$route.params.uuid}`
    )
  }

  newTaxonomy() {
    this.selectedTaxonomy = { name: '' }
    this.taxonomyDialog = true
  }

  editTaxonomy(taxonomy: Taxonomy) {
    this.selectedTaxonomy = { ...taxonomy }
    this.taxonomyDialog = true
  }

  async saveTaxonomy() {
    if (this.selectedTaxonomy.uuid) {
      await this.$axios.$patch(
        `/api/taxonomies/${this.selectedTaxonomy.uuid}`,
        this.selectedTaxonomy
      )
    } else {
      await this.$axios.$post(`/api/taxonomies/`, this.selectedTaxonomy)
    }
    this.getTaxonomies()
    this.taxonomyDialog = false
  }

  async deleteTaxonomy(taxonomy: Taxonomy) {
    const confirmed = await this.$refs.confirm.open({
      message: `Are you sure you want to delete "${taxonomy.name}"?`,
    })

    if (confirmed) {
      await this.$axios.$delete(`/api/taxonomies/${taxonomy.uuid}`)
      this.getTaxonomies()
    }

    this.taxonomyDialog = false
  }

  head() {
    return {
      title: 'Portfolio Report Admin',
    }
  }
}
</script>
