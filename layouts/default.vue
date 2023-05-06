<script setup lang="ts">
const containerClass = ref<Array<string | { [key: string]: boolean }>>([
  'layout-wrapper',
  'layout-overlay',
])
</script>

<template>
  <div :class="containerClass">
    <AppTopBar />

    <div class="layout-main-container">
      <div class="layout-main">
        <slot />
      </div>
      <AppFooter />
    </div>
  </div>
</template>

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
