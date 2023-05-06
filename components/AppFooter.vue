<script setup lang="ts">
const config = useRuntimeConfig()

const githubLink = computed(() => {
  if (config.public.gitSha) {
    return (
      `https://github.com/portfolio-report/pr-www/tree/${config.public.gitSha}`
    )
  }
  return 'https://www.github.com/portfolio-report/pr-www'
})
</script>

<template>
  <footer class="flex justify-content-center">
    <IconLink
      v-tooltip.top="'Get help and discuss'"
      href="https://forum.portfolio-performance.info/"
      icon="i-carbon-forum"
    />
    <IconLink
      v-tooltip.top="'Get in contact'"
      to="/contact"
      icon="i-carbon-email"
    />
    <IconLink
      v-tooltip.top="'Source code'"
      :href="githubLink"
      target="_blank"
      icon="i-carbon-logo-github"
    />
  </footer>
</template>

<style scoped>
a {
  margin: 0.75rem;
}
</style>
