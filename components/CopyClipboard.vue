<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import type Popover from 'primevue/popover'

const props = defineProps<{ text: string }>()

const { copy } = useClipboard()

const overlay = ref<typeof Popover | null>(null)

async function copyTextToClipboard(event: Event) {
  copy(props.text)

  overlay.value?.show(event)
  await new Promise(resolve => setTimeout(resolve, 1500))
  overlay.value?.hide()
}
</script>

<template>
  <span>
    <slot /> <a class="ii i-carbon-copy cursor-pointer hover:text-primary-500" @click="ev => copyTextToClipboard(ev)" />
    <Popover ref="overlay" :dismissable="false" :close-on-escape="false" :pt="{ content: { class: 'p-0' } }">
      <InlineMessage severity="success">Copied to clipboard</InlineMessage>
    </Popover>
  </span>
</template>
