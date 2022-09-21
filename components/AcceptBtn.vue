<template>
  <TextBtn
    :type="type"
    :form="form"
    icon="i-carbon-checkmark"
    :small="small"
    :label="label"
    @click="emit('click', $event)"
  >
    <slot />
  </TextBtn>
</template>

<script setup lang="ts">
defineProps<{
  label?: string
  small?: boolean
  type?: 'button' | 'submit' | 'reset'
  form?: string
}>()

const emit = defineEmits<{ (e: 'click', arg1: MouseEvent): void }>()
</script>
