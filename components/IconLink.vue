<script setup lang="ts">
const props = defineProps<{
  color?: 'secondary' | 'success'
  to?: string
  href?: string
  target?: string
  icon?: string
  small?: boolean
  type?: 'button' | 'submit' | 'reset'
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
  <NuxtLink
    :to="to"
    :href="to ? undefined : href || '#'"
    :target="target"
    @click="emit('click', $event)"
  >
    <i class="ii" :class="icons" />
  </NuxtLink>
</template>

<style scoped>
a {
  color: #64748b;
}

a:hover {
  color: var(--primary-color);
}
</style>
