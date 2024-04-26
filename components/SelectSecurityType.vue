<script setup lang="ts">
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
  <span class="p-float-label">
    <Dropdown
      class="w-full"
      :model-value="modelValue"
      :options="securityTypeItems"
      option-label="text"
      option-value="value"
      :show-clear="true"
      @update:model-value="update"
    />
    <label>Security Type</label>
  </span>
</template>
