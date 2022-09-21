<template>
  <Dialog
    header="Create multiple securities"
    :modal="true"
    style="width: 600px"
    :visible="modelValue"
    @update:visible="setVisible"
  >
    <Textarea
      v-model="textInput"
      :auto-resize="true"
      class="w-full"
      placeholder="Paste ISINs here"
    />

    <div class="mt-2">
      <Chip v-for="isin in isins" :key="isin" class="m-1 text-sm">
        {{ isin }}
      </Chip>
    </div>

    <div class="mt-2">
      <Button
        :action="batchCreate"
        :disabled="isins.length === 0"
        icon="i-lg i-carbon-list-checked"
        :label="'Create all ' + isins.length + ' securities'"
        :loading="loading"
      >
      </Button>
    </div>

    <Message v-if="securitiesCreated > 0" severity="info">
      {{ securitiesCreated }} securities created
    </Message>

    <template #footer>
      <CancelBtn label="Close" @click="setVisible(false)" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { Security } from '~/store/Security.model'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  (e: 'update'): void
  (e: 'update:modelValue', arg1: boolean): void
}>()

watch(
  () => props.modelValue,
  (selection, _prevSelection) => {
    if (selection === true) {
      textInput.value = ''
      securitiesCreated.value = 0
    }
  }
)

const loading = ref(false)

const securitiesCreated = ref(0)
const textInput = ref('')

const isins = computed(() => {
  const isinRegex = /\b([A-Z]{2})([A-Z0-9]{9})([0-9]{1})\b/g
  const isins = [...textInput.value.matchAll(isinRegex)].map((e) => e[0])

  // return unique values
  return [...new Set(isins)]
})

async function batchCreate() {
  loading.value = true
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
    await useApi(`/securities/`, { method: 'post', body: security })
    securitiesCreated.value += 1
  }
  loading.value = false
}

function setVisible(value: boolean) {
  emit('update:modelValue', value)
  if (value === false && securitiesCreated.value > 0) {
    emit('update')
  }
}
</script>
