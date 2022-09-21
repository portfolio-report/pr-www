<template>
  <Dialog
    v-model:visible="visible"
    style="width: 600px"
    :modal="true"
    :header="
      security?.uuid ? 'Edit security ' + security.uuid : 'Create security'
    "
  >
    <form id="securityForm" @submit.prevent="save">
      <div class="grid">
        <div class="col-12">
          <div v-if="!!security?.uuid" class="p-float-label mt-4">
            <InputText
              id="uuid"
              v-model="security.uuid"
              disabled
              class="w-20rem"
            />
            <label for="uuid">UUID</label>
          </div>
        </div>
        <div class="col-12">
          <div class="p-float-label mt-4">
            <InputText id="name" v-model="security.name" class="w-full" />
            <label for="name">Name</label>
          </div>
        </div>
        <div class="col-12 md:col-4">
          <div class="p-float-label mt-4">
            <InputText id="isin" v-model="security.isin" class="w-full" />
            <label for="isin">ISIN</label>
          </div>
        </div>
        <div class="col-12 md:col-4">
          <div class="p-float-label mt-4">
            <InputText id="wkn" v-model="security.wkn" class="w-full" />
            <label for="wkn">WKN</label>
          </div>
        </div>
        <div class="col-12 md:col-4">
          <div class="p-float-label mt-4">
            <InputText
              id="type"
              v-model="security.securityType"
              class="w-full"
            />
            <label for="type">Type</label>
          </div>
        </div>
        <div class="col-12 md:col-4">
          <div class="p-float-label mt-4">
            <InputText
              id="symbolXfra"
              v-model="security.symbolXfra"
              class="w-full"
            />
            <label for="symbolXfra">Symbol Frankfurt</label>
          </div>
        </div>
        <div class="col-12 md:col-4">
          <div class="p-float-label mt-4">
            <InputText
              id="symbolXnas"
              v-model="security.symbolXnas"
              class="w-full"
            />
            <label for="symbolXnas">Symbol NASDAQ</label>
          </div>
        </div>
        <div class="col-12 md:col-4">
          <div class="p-float-label mt-4">
            <InputText
              id="symbolXnys"
              v-model="security.symbolXnys"
              class="w-full"
            />
            <label for="symbolXnys">Symbol New York</label>
          </div>
        </div>
      </div>
    </form>
    <template #footer>
      <CancelBtn label="Cancel" @click="cancel" />
      <AcceptBtn type="submit" form="securityForm" label="Save" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { Security } from '~/store/Security.model'

const emptySecurity = {
  name: '',
  isin: '',
  wkn: '',
  securityType: '',
  symbolXfra: '',
  symbolXnas: '',
  symbolXnys: '',
}

const visible = ref(false)
const security = ref<Security>({ ...emptySecurity })
const resolveFunc = ref<null | ((value: Security | null) => void)>(null)
const rejectFunc = ref<null | (() => void)>(null)

function show(s?: Security): Promise<Security | null> {
  security.value = s ? { ...s } : { ...emptySecurity }
  visible.value = true
  return new Promise((resolve, reject) => {
    resolveFunc.value = resolve
    rejectFunc.value = reject
  })
}

defineExpose({ show })

function addDashesToUuid(uuid: string): string {
  if (/^[0-9a-f]{32}$/.test(uuid)) {
    return (
      uuid.slice(0, 8) +
      '-' +
      uuid.slice(8, 12) +
      '-' +
      uuid.slice(12, 16) +
      '-' +
      uuid.slice(16, 20) +
      '-' +
      uuid.slice(20)
    )
  } else {
    return uuid
  }
}

async function save() {
  let ret: Security
  if (security.value.uuid) {
    ret = await useApi(`/securities/${addDashesToUuid(security.value.uuid)}`, {
      method: 'PATCH',
      body: security.value,
    })
  } else {
    ret = await useApi(`/securities/`, {
      method: 'post',
      body: security.value,
    })
  }

  visible.value = false

  if (resolveFunc.value) {
    resolveFunc.value(ret)
  }
}

function cancel() {
  visible.value = false
  if (resolveFunc.value) {
    resolveFunc.value(null)
  }
}
</script>
