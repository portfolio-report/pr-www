<template>
  <ul>
    <li
      v-for="(item, i) of items.filter((i) => visible(i))"
      :key="i"
      :style="item.style"
      :class="{
        'x-menuitem-separator': item.separator,
        'x-menuitem-root': root && !item.separator,
      }"
    >
      <template v-if="!item.separator">
        <AppMenuItem
          :item="item"
          :root="root ?? false"
          :active="activeIndex === i && !item.to && !item.disabled"
          @click="onMenuItemClick({ event: $event, item, index: i })"
        />
        <Transition name="layout-submenu-wrapper">
          <AppSubMenu
            v-show="root || activeIndex === i"
            v-if="item.items"
            :items="item.items"
            @menuitem-click="emit('menuitemClick', $event)"
          />
        </Transition>
      </template>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { MenuItem } from 'primevue/menuitem'

defineProps<{ items: MenuItem[]; root?: boolean }>()

const emit = defineEmits<{
  (
    e: 'menuitemClick',
    arg1: { event: Event; item: MenuItem; index: number }
  ): void
}>()

// Index of active element, null if no element is active
const activeIndex = ref<number | null>(null)

function onMenuItemClick({
  event,
  item,
  index,
}: {
  event: Event
  item: MenuItem
  index: number
}) {
  activeIndex.value = index === activeIndex.value ? null : index
  emit('menuitemClick', { event, item, index })
}

function visible(item: MenuItem) {
  return typeof item.visible === 'function'
    ? item.visible()
    : item.visible !== false
}
</script>

<style scoped lang="scss">
.x-menuitem-separator {
  border-top: 1px solid var(--surface-d);
  margin: 0.25rem 0;
}

.x-menuitem-root {
  margin-top: 0.75rem;

  &:first-child {
    margin-top: 0;
  }
}

ul {
  list-style-type: none;
  margin: 0;
  padding: 0;

  &.layout-submenu-wrapper-enter-from,
  &.layout-submenu-wrapper-leave-to {
    max-height: 0;
  }

  &.layout-submenu-wrapper-enter-to,
  &.layout-submenu-wrapper-leave-from {
    max-height: 1000px;
  }

  &.layout-submenu-wrapper-leave-active {
    overflow: hidden;
    transition: max-height 0.45s cubic-bezier(0, 1, 0, 1);
  }

  &.layout-submenu-wrapper-enter-active {
    overflow: hidden;
    transition: max-height 1s ease-in-out;
  }

  ul {
    padding-left: 1rem;
  }
}
</style>
