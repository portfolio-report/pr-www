<template>
  <TextBtn
    color="secondary"
    icon="i-carbon-close"
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
}>()

const emit = defineEmits<{ (e: 'click', arg1: MouseEvent): void }>()
</script>
