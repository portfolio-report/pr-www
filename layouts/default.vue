<template>
  <div :class="containerClass" @click="onWrapperClick">
    <AppTopBar @menu-toggle="onMenuToggle" />
    <div class="layout-sidebar" @click="onSidebarClick">
      <AppMenu
        v-model:layout="layoutMode"
        :is-desktop="isDesktop"
        @menuitem-click="onMenuItemClick"
      />
    </div>

    <div class="layout-main-container">
      <div class="layout-main">
        <slot />
      </div>
      <AppFooter />
    </div>

    <Transition name="layout-mask">
      <div
        v-if="mobileMenuActive"
        class="layout-mask p-component-overlay"
      ></div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { MenuItem } from 'primevue/menuitem'

import { useAuthStore } from '~/store/auth'

const layoutMode = ref<'static' | 'overlay'>('static')
const staticMenuInactive = ref(false)
const overlayMenuActive = ref(false)
const mobileMenuActive = ref(false)

const menuClick = ref<boolean>()

const auth = useAuthStore()

const { width } = useWindowSize()
const isDesktop = computed(() => width.value >= 992)

function onMenuToggle() {
  menuClick.value = true
  if (isDesktop.value) {
    if (layoutMode.value === 'overlay') {
      if (mobileMenuActive.value === true) {
        overlayMenuActive.value = true
      }
      overlayMenuActive.value = !overlayMenuActive.value
      mobileMenuActive.value = false
    } else if (layoutMode.value === 'static') {
      staticMenuInactive.value = !staticMenuInactive.value
    }
  } else {
    mobileMenuActive.value = !mobileMenuActive.value
  }
}

function onSidebarClick() {
  menuClick.value = true
}

function onMenuItemClick(event: { item: MenuItem }) {
  if (!event.item.items) {
    overlayMenuActive.value = false
    mobileMenuActive.value = false
  }
}

function onWrapperClick() {
  if (!menuClick.value) {
    overlayMenuActive.value = false
    mobileMenuActive.value = false
  }
  menuClick.value = false
}

function addClass(element: HTMLElement, className: string) {
  if (element.classList) element.classList.add(className)
  else element.className += ' ' + className
}
function removeClass(element: HTMLElement, className: string) {
  if (element.classList) element.classList.remove(className)
  else
    element.className = element.className.replace(
      new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'),
      ' '
    )
}

onBeforeUpdate(() => {
  if (mobileMenuActive.value) {
    addClass(document.body, 'overflow-hidden')
  } else {
    removeClass(document.body, 'overflow-hidden')
  }
})

const containerClass = ref<Array<string | { [key: string]: boolean }>>([
  // Classes to be used in SSR:
  'layout-wrapper',
  'layout-overlay',
])
// and to be updated by:
watchEffect(
  () => {
    if (!auth.loggedIn) {
      containerClass.value = ['layout-wrapper', 'layout-overlay']
    } else {
      containerClass.value = [
        'layout-wrapper',
        {
          'layout-overlay': layoutMode.value === 'overlay',
          'layout-static': layoutMode.value === 'static',
          'layout-static-sidebar-inactive':
            staticMenuInactive.value && layoutMode.value === 'static',
          'layout-overlay-sidebar-active':
            overlayMenuActive.value && layoutMode.value === 'overlay',
          'layout-mobile-sidebar-active': mobileMenuActive.value,
        },
      ]
    }
  },
  { flush: 'post' }
)
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.layout-main {
  flex: 1 1 auto;
}
.layout-main-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  justify-content: space-between;
  transition: margin-left $transitionDuration;
  padding: 7rem 2rem 0rem 4rem;
}

.layout-sidebar {
  position: fixed;
  width: 300px;
  height: calc(100vh - 9rem);
  z-index: 999;
  overflow-y: auto;
  user-select: none;
  top: 7rem;
  left: 2rem;
  transition: transform $transitionDuration, left $transitionDuration;
  background-color: var(--surface-overlay);
  border-radius: $borderRadius;
  padding: 1.5rem;
  box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.02), 0px 0px 2px rgba(0, 0, 0, 0.05),
    0px 1px 4px rgba(0, 0, 0, 0.08);
}

@media (min-width: 992px) {
  .layout-wrapper {
    &.layout-overlay {
      .layout-main-container {
        margin-left: 0;
        padding-left: 2rem;
      }

      .layout-sidebar {
        transform: translateX(-100%);
        left: 0;
        top: 0;
        height: 100vh;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }

      &.layout-overlay-sidebar-active {
        .layout-sidebar {
          transform: translateX(0);
        }
      }
    }

    &.layout-static {
      .layout-main-container {
        margin-left: 300px;
      }

      &.layout-static-sidebar-inactive {
        .layout-sidebar {
          transform: translateX(-100%);
          left: 0;
        }

        .layout-main-container {
          margin-left: 0;
          padding-left: 2rem;
        }
      }
    }

    .layout-mask {
      display: none;
    }
  }
}

@media (max-width: 991px) {
  .layout-wrapper {
    .layout-main-container {
      margin-left: 0;
      padding-left: 2rem;
    }

    .layout-sidebar {
      transform: translateX(-100%);
      left: 0;
      top: 0;
      height: 100vh;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }

    .layout-mask {
      z-index: 998;
      background-color: var(--maskbg);

      &.layout-mask-enter-from,
      &.layout-mask-leave-to {
        background-color: transparent;
      }
    }

    &.layout-mobile-sidebar-active {
      .layout-sidebar {
        transform: translateX(0);
      }

      .layout-mask {
        display: block;
      }
    }
  }
}
</style>
