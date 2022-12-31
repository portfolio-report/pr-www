<template>
  <Tag class="mx-1 bg-orange-300">
    <NuxtLink :to="linkTo">{{ name }}</NuxtLink>
  </Tag>
</template>

<script setup lang="ts">
const props = defineProps<{ name: string }>()

const linkTo = computed(() => {
  let name = props.name
  if (name.includes(' ')) {
    name = '"' + name + '"'
  }
  return `/search?q=tag:${name}`
})
</script>

<style scoped>
a {
  color: white !important;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
