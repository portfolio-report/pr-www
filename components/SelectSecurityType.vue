<script setup lang="ts">
import Select from 'primevue/select'

defineProps<{ modelValue: string }>()

const emit = defineEmits<{ (e: 'update:modelValue', arg1: string): void }>()

const securityTypeItems = [
  { text: '*', value: '' },
  { text: 'share', value: 'share' },
  { text: 'fund', value: 'fund' },
  { text: 'crypto', value: 'crypto' },
  { text: 'bond', value: 'bond' },
  { text: 'index', value: 'index' },
]

function update(value: string) {
  emit('update:modelValue', value)
}
</script>

<template>
  <Select
    :model-value="modelValue"
    :options="securityTypeItems"
    option-label="text"
    option-value="value"
    :show-clear="true"
    placeholder="Security Type"
    @update:model-value="update"
  />
</template>
