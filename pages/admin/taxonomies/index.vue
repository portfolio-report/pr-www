<template>
  <div>
    <DataTable :value="taxonomies.filter((t) => t.parentUuid === null)">
      <template #header>
        <div class="flex align-items-center">
          <h5 class="m-0 flex-grow-1">Taxonomies</h5>
          <AddBtn @click="newTaxonomy" />
        </div>
      </template>
      <Column field="name" header="Name" :sortable="true">
        <template #body="{ data }">
          <NuxtLink :to="'/admin/taxonomies/' + data.uuid">
            {{ data.name }}
          </NuxtLink>
        </template></Column
      >
      <Column field="uuid" header="UUID" :sortable="true"></Column>
      <Column>
        <template #body="{ data }">
          <EditBtn @click="editTaxonomy(data)" />
          <DeleteBtn @click="deleteTaxonomy(data)" />
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="taxonomyDialog" style="width: 500px" :modal="true">
      <form id="editTaxonomyForm" @submit.prevent="saveTaxonomy">
        <div class="p-float-label mt-4">
          <InputText id="name" v-model="selectedTaxonomy.name" class="w-full" />
          <label for="name">Name</label>
        </div>
      </form>
      <template #footer>
        <CancelBtn label="Cancel" @click="taxonomyDialog = false" />
        <AcceptBtn type="submit" form="editTaxonomyForm" label="Save" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
interface Taxonomy {
  uuid?: string
  name: string | null
  parentUuid?: string | null
}

useHead({ title: 'Portfolio Report Admin' })

definePageMeta({
  middleware: ['auth'],
})

const showConfirmDialog = useConfirmDialog()

const taxonomyDialog = ref(false)
const selectedTaxonomy = ref<Taxonomy>({ name: '' })

const taxonomies = ref<Taxonomy[]>([])

onMounted(getTaxonomies)

async function getTaxonomies() {
  taxonomies.value = await useApi('/taxonomies/')
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
    await useApi(`/taxonomies/${selectedTaxonomy.value.uuid}`, {
      method: 'put',
      body: selectedTaxonomy.value,
    })
  } else {
    await useApi(`/taxonomies/`, {
      method: 'post',
      body: selectedTaxonomy.value,
    })
  }
  getTaxonomies()
  taxonomyDialog.value = false
}

async function deleteTaxonomy(taxonomy: Taxonomy) {
  const confirmed = await showConfirmDialog({
    message: `Are you sure you want to delete "${taxonomy.name}"?`,
    acceptClass: 'p-button-danger',
  })

  if (confirmed) {
    await useApi(`/taxonomies/${taxonomy.uuid}`, { method: 'delete' })
    getTaxonomies()
  }
}
</script>
