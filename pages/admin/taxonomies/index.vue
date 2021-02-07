<template>
  <v-row align="center" justify="center">
    <v-col cols="12">
      <v-toolbar color="primary" dark>
        <v-toolbar-title>Taxonomies</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="newTaxonomy">
          <v-icon>{{ mdiPlus }}</v-icon>
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
            <v-icon>{{ mdiPencil }}</v-icon>
          </v-btn>
          <v-btn color="error" icon text @click="deleteTaxonomy(item)">
            <v-icon>{{ mdiDelete }}</v-icon>
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
  name: string | null
}

@Component({
  components: { DialogConfirm },
  middleware: 'auth',
})
export default class TaxonomiesPage extends mixins(Vue, IconsMixin) {
  $refs!: {
    confirm: DialogConfirm
  }

  taxonomyDialog = false
  selectedTaxonomy = {} as Taxonomy

  taxonomies: Taxonomy[] = []

  mounted() {
    this.getTaxonomies()
  }

  async getTaxonomies() {
    this.taxonomies = await this.$axios.$get('/api/taxonomies')
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
  }

  head() {
    return {
      title: 'Portfolio Report Admin',
    }
  }
}
</script>
