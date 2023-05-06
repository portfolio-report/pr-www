<script setup lang="ts">
defineProps({ error: { type: Object, required: true } })

useHead({ title: 'Portfolio Report' })
</script>

<template>
  <div class="flex justify-content-center align-items-center h-screen">
    <Card class="shadow-2" style="min-width: 600px">
      <template #title>
        <div class="text-center">
          <i
            class="ii i-carbon-warning-alt text-orange-500"
            style="font-size: 5rem"
          />
          <h1 class="mt-0">
            <span v-if="error.statusCode === 404">Page not found 😟</span>
            <span v-else>
              {{ error.statusMessage }} ({{ error.statusCode }})
            </span>
          </h1>
        </div>
      </template>

      <template #content>
        <div v-if="error.statusCode === 404" class="text-center">
          <p>
            Sorry, this page does not exist. If you think, this is wrong, please
            <NuxtLink to="/contact">
              let us know
            </NuxtLink>.
          </p>
          <NuxtLink to="/">
            Go to home page
          </NuxtLink>
        </div>
        <div v-else>
          {{ error.message }}
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-html="error.description" />
        </div>
      </template>
    </Card>
  </div>
</template>
