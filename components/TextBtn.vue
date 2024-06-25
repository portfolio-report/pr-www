<script setup lang="ts">
const props = defineProps<{
  color?: 'secondary' | 'success'
  icon?: string
  label?: string
  small?: boolean
  solid?: boolean
  type?: 'button' | 'submit' | 'reset'
  form?: string
  disabled?: boolean
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
    :text="!solid"
    :rounded="!label"
    :size="small ? 'small' : undefined"
    :severity="color"
    :label="label"
    :form="form"
    :disabled="disabled"
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
