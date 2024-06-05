<script lang="ts" setup>
import { useDateFormat } from '@vueuse/core'

const props = defineProps<{
  value: Date | string
}>()

const date = computed(() => new Date(props.value))
const formattedDate = useDateFormat(date.value, 'YYYY-MM-DD HH:mm:ss')
</script>

<template>
  {{ formattedDate }}
</template>
