<script setup lang="ts">
const props = defineProps<{
  color?: 'secondary' | 'success'
  icon?: string
  label?: string
  small?: boolean
  solid?: boolean
  type?: 'button' | 'submit' | 'reset'
  form?: string
}>()

const emit = defineEmits<{
  (e: 'click', arg1: MouseEvent): void
}>()

const icons = computed(() => {
  if (props.icon && !props.small) {
    return `${props.icon} i-lg`
  }
  return props.icon
})
</script>

<template>
  <Button
    :type="type"
    :icon="icons"
    :class="{
      'p-button-text': !solid,
      'p-button-rounded': !label,
      'x-button-small': small,
      'p-button-secondary': color === 'secondary',
      'p-button-success': color === 'success',
    }"
    :label="label"
    :form="form"
    @click="emit('click', $event)"
  >
    <slot />
  </Button>
</template>

<style scoped>
.p-button.x-button-small {
  height: 2rem !important;
  width: 2rem !important;
}
</style>
