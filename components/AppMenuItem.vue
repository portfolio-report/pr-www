<template>
  <div>
    <template v-if="root">
      <div class="mb-2 text-900 uppercase font-semibold text-sm">
        {{ item.label }}
      </div>
    </template>
    <template v-else>
      <NuxtLink
        :to="item.to || item.url"
        :target="item.target"
        :class="[item.class, { 'p-disabled': item.disabled }]"
        :style="item.style"
        exact
        @click="onClick"
      >
        <i :class="item.icon"></i>
        <span>{{ item.label }}</span>
        <i
          v-if="item.items"
          :class="[
            'ml-auto',
            { 'i-carbon-chevron-down': !active, 'i-carbon-chevron-up': active },
          ]"
        ></i>
      </NuxtLink>
    </template>
  </div>
</template>

<script setup lang="ts">
import { MenuItem } from 'primevue/menuitem'

const props = defineProps<{ item: MenuItem; active: boolean; root: boolean }>()

const emit = defineEmits<{
  (e: 'click', arg1: MouseEvent): void
}>()

function onClick(event: MouseEvent) {
  const item = props.item
  if (item.disabled) {
    event.preventDefault()
    return
  }
  if (!item.to && !item.url) {
    event.preventDefault()
  }
  // execute command
  if (props.item.command) {
    props.item.command({ originalEvent: event, item })
  }

  emit('click', event)
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/mixins.scss';
@import '@/assets/styles/variables.scss';

a {
  cursor: pointer;
  text-decoration: none;
  display: flex;
  align-items: center;
  color: var(--text-color);
  transition: color $transitionDuration;
  border-radius: $borderRadius;
  padding: 0.75rem 1rem;
  transition: background-color 0.15s;

  span {
    margin-left: 0.5rem;
  }

  &:focus {
    @include focused-inset();
  }

  &:hover {
    background-color: var(--surface-hover);
  }

  &.router-link-exact-active {
    font-weight: 700;
    color: var(--primary-color);
  }
}
</style>
