<script setup lang="ts">
import Tag from 'primevue/tag'

defineProps<{ name: string }>()
</script>

<template>
  <Tag
    class="mx-1 p-1 !text-xs !text-white"
    :class="{
      '!bg-teal-500': name === 'share',
      '!bg-purple-500': name === 'fund',
      '!bg-orange-500': name === 'crypto',
      '!bg-gray-500': !['share', 'fund', 'crypto'].includes(name),
    }"
  >
    {{ name }}
  </Tag>
</template>
