<script setup lang="ts">
useHead({
  title: 'Portfolio Report',
  meta: [{ name: 'description', content: 'Portfolio Report' }],
  link: [
    {
      rel: 'search',
      type: 'application/opensearchdescription+xml',
      href: '/opensearch.xml',
    },
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
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toast />
  </div>
</template>
