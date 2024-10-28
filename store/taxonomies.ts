import type { Taxonomy } from './Taxonomy.model'
import { defineStore } from 'pinia'

export const useTaxonomiesStore = defineStore(
  'taxonomies',
  () => {
    const taxonomies = ref<Taxonomy[]>([])

    async function initialize() {
      taxonomies.value = await useApi<Taxonomy[]>('/taxonomies/')
    }

    initialize()

    return {
      taxonomies,
    }
  },
)
