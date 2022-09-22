<template>
  <div class="layout-menu-container">
    <ClientOnly>
      <IconLink
        v-if="isDesktop"
        small
        class="absolute right-0 mr-4"
        :icon="layout === 'static' ? 'i-carbon-pin-filled' : 'i-carbon-pin'"
        @click="toggleLayout"
      />
    </ClientOnly>
    <AppSubMenu
      :items="menuItems"
      :root="true"
      @menuitem-click="emit('menuitemClick', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { MenuItem } from 'primevue/menuitem'

const props = defineProps<{
  layout: 'overlay' | 'static'
  isDesktop: boolean
}>()

const emit = defineEmits<{
  (e: 'menuitemClick', arg1: { item: MenuItem }): void
  (e: 'update:layout', arg1: 'overlay' | 'static'): void
}>()

function toggleLayout() {
  if (props.layout === 'static') {
    emit('update:layout', 'overlay')
  } else {
    emit('update:layout', 'static')
  }
}

const menuItems: MenuItem[] = [
  {
    label: 'Public',
    items: [
      { label: 'Search', icon: 'i-carbon-search', to: '/search' },
      { label: 'Statistics', icon: 'i-carbon-analytics', to: '/stats' },
    ],
  },
  {
    label: 'Admin',
    items: [
      {
        label: 'Securities',
        icon: 'i-carbon-currency-dollar',
        to: '/admin/securities',
      },
      {
        label: 'Taxonomies',
        icon: 'i-carbon-tree-view',
        to: '/admin/taxonomies',
      },
      {
        label: 'Statistics',
        icon: 'i-carbon-analytics-custom',
        to: '/admin/stats',
      },
    ],
  },
]
</script>
