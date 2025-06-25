<script setup lang="ts">
useHead({
  title: 'Portfolio Report',
  meta: [{ name: 'description', content: 'Portfolio Report' }],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      href: '/favicon-32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '180x180',
      href: '/favicon-180.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '192x192',
      href: '/favicon-192.png',
    },
  ],
  bodyAttrs: {
    class: 'bg-gray-50 text-gray-600',
  },
})
</script>

<template>
  <div class="flex justify-center items-center h-screen">
    <Card class="shadow-2" style="min-width: 600px">
      <template #title>
        <div class="text-center">
          <h1 class="mt-0">
            Good bye 👋
          </h1>
        </div>
      </template>

      <template #content>
        Please use the built-in quotes provider in <a href="https://www.portfolio-performance.info/download.html" class="text-blue-500">Portfolio Performance</a>.
      </template>
    </Card>
  </div>
</template>
