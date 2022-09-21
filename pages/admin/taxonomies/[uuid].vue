<template>
  <div>
    <div class="flex align-items-center">
      <h5 class="m-0 flex-grow-1">Taxonomy: {{ root.name }}</h5>
      <AddBtn @click="newTaxonomy" />
    </div>

    <TabView>
      <TabPanel header="Tree">
        <TreeTable :value="taxonomiesTree" class="p-treetable-sm">
          <Column field="name" header="Name" :expander="true"></Column>
          <Column field="code" header="Code"></Column>
          <Column field="uuid" header="UUID"></Column>
          <Column>
            <template #body="{ node }">
              <EditBtn @click="editTaxonomy(node.data)" />
            </template>
          </Column>
        </TreeTable>
      </TabPanel>

      <TabPanel header="List">
        <DataTable
          :value="root.descendants"
          :headers="[
            { text: 'Name', value: 'name' },
            { text: 'Code', value: 'code' },
            { text: 'UUID', value: 'uuid' },
            { text: 'parentUuid', value: 'parentUuid' },
            { value: 'actions' },
          ]"
          class="p-datatable-sm"
        >
          <Column field="name" header="Name" :sortable="true"></Column>
          <Column field="code" header="Code" :sortable="true"></Column>
          <Column field="uuid" header="UUID" :sortable="true"></Column>
          <Column
            field="parentUuid"
            header="Parent UUID"
            :sortable="true"
          ></Column>
          <Column>
            <template #body="{ data }">
              <EditBtn @click="editTaxonomy(data)" />
            </template>
          </Column>
        </DataTable>
      </TabPanel>
    </TabView>

    <Dialog v-model:visible="taxonomyDialog" style="width: 500px" :modal="true">
      <form id="editTaxonomyForm" @submit.prevent="saveTaxonomy">
        <div class="p-float-label mt-4">
          <InputText id="name" v-model="selectedTaxonomy.name" class="w-full" />
          <label for="name">Name</label>
        </div>
        <div class="p-float-label mt-4">
          <InputText id="code" v-model="selectedTaxonomy.code" class="w-full" />
          <label for="code">Code</label>
        </div>
        <div class="p-float-label mt-4">
          <Dropdown
            id="parent"
            v-model="selectedTaxonomy.parentUuid"
            option-label="name"
            option-value="uuid"
            :options="[root, ...root.descendants]"
            class="w-full"
          />
          <label for="parent">Parent</label>
        </div>
      </form>
      <template #footer>
        <div class="flex">
          <div class="flex-grow-1 flex">
            <DeleteBtn
              v-if="!!selectedTaxonomy.uuid"
              label="Delete"
              @click="deleteTaxonomy(selectedTaxonomy)"
            />
          </div>
          <CancelBtn label="Cancel" @click="taxonomyDialog = false" />
          <AcceptBtn type="submit" form="editTaxonomyForm" label="Save" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { TreeNode } from 'primevue/tree'

interface Taxonomy {
  uuid?: string
  parentUuid?: string
  name: string | null
  code: string | null
  children?: Taxonomy[]
}

useHead({ title: 'Portfolio Report Admin' })

definePageMeta({
  middleware: ['auth'],
})

const route = useRoute()

const showConfirmDialog = useConfirmDialog()

const taxonomyDialog = ref(false)
const selectedTaxonomy = ref<Taxonomy>({ name: '', code: '' })

const { data: rawRoot, error } = await useAsyncData(
  `taxonomy:${route.params.uuid}`,
  () =>
    useApi<{
      uuid: string
      name: string
      descendants: Taxonomy[]
    }>(`/taxonomies/${route.params.uuid}`)
)
if (error.value) {
  throw createError({
    statusCode: 404,
    message: 'This page could not be found',
    fatal: true,
  })
}

const root = computed(
  () => rawRoot.value || { uuid: '', name: '', descendants: [] }
)

const taxonomiesTree = computed(() =>
  root.value.uuid ? findChildren(root.value.uuid) : []
)

function findChildren(uuid: string) {
  const ret: TreeNode[] = []

  const children = root.value?.descendants.filter((t) => t.parentUuid === uuid)
  for (const child of children ?? []) {
    ret.push({
      key: child.uuid,
      label: child.name ?? undefined,
      data: child,
      children: findChildren(child.uuid ?? ''),
    })
  }

  return ret
}

async function getTaxonomies() {
  rawRoot.value = await useApi(`/taxonomies/${route.params.uuid}`)
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
  })

  if (confirmed) {
    await useApi(`/taxonomies/${taxonomy.uuid}`, { method: 'delete' })
    getTaxonomies()
  }

  taxonomyDialog.value = false
}
</script>
