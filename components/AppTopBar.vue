<script setup lang="ts">
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'

const router = useRouter()
const route = useRoute()

const searchTerm = ref('')

function search() {
  const q = searchTerm.value
  searchTerm.value = ''
  router.push({ path: '/search', query: { q } })
}
</script>

<template>
  <div class="layout-topbar bg-white">
    <NuxtLink to="/" class="layout-topbar-logo text-gray-600">
      <img class="mx-2 h-4rem" src="/favicon-192.png" alt="Logo">
      <span class="text-2xl font-medium self-center">
        Portfolio Report
      </span>
    </NuxtLink>

    <Button
      v-if="!route.path.startsWith('/search')"
      v-styleclass="{
        selector: '@next',
        enterFromClass: '!hidden',
        enterActiveClass: 'scalein',
        leaveToClass: '!hidden',
        leaveActiveClass: 'fadeout',
        hideOnOutsideClick: true,
      }"
      text
      rounded
      class="p-button-icon-only layout-topbar-menu-button"
    >
      <i class="i-carbon-overflow-menu-vertical" />
    </Button>

    <ul
      v-if="!route.path.startsWith('/search')"
      class="layout-topbar-menu !hidden lg:!flex origin-top"
    >
      <li>
        <form @submit.prevent="search">
          <InputGroup>
            <InputText v-model="searchTerm" placeholder="Search" />
            <Button
              type="submit"
              icon="i-carbon-search i-lg"
              class="p-button-secondary"
            />
          </InputGroup>
        </form>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/variables' as *;

.layout-topbar {
  position: fixed;
  height: 5rem;
  z-index: 997;
  left: 0;
  top: 0;
  width: 100%;
  padding: 0 2rem;
  transition: left $transitionDuration;
  display: flex;
  align-items: center;
  box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.02), 0px 0px 2px rgba(0, 0, 0, 0.05),
    0px 1px 4px rgba(0, 0, 0, 0.08);

  .layout-topbar-logo {
    display: flex;
    align-items: center;
    font-size: 1.5rem;
    font-weight: 500;
    width: 300px;
    border-radius: $borderRadius;

    &:focus {
      @include focused();
    }
  }

  .layout-topbar-button {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    position: relative;
    border-radius: 50%;
    width: 3rem;
    height: 3rem;
    cursor: pointer;
    transition: background-color $transitionDuration;

    &:focus {
      @include focused();
    }

    i {
      font-size: 1.5rem;
    }

    span {
      font-size: 1rem;
      display: none;
    }
  }

  .layout-menu-button {
    margin-left: 2rem;

    &:focus {
      @include focused();
    }
  }

  .layout-topbar-menu-button {
    display: none;

    i {
      font-size: 1.25rem;
    }

    &:focus {
      @include focused();
    }
  }

  .layout-topbar-menu {
    margin: 0 0 0 auto;
    padding: 0;
    list-style: none;
    display: flex;

    .layout-topbar-button {
      margin-left: 1rem;
    }
  }
}

@media (max-width: 991px) {
  .layout-topbar {
    justify-content: space-between;

    .layout-topbar-logo {
      width: auto;
      order: 2;
    }

    .layout-menu-button {
      margin-left: 0;
      order: 1;
    }

    .layout-topbar-menu-button {
      display: inline-flex;
      margin-left: 0;
      order: 3;
    }

    .layout-topbar-menu {
      margin-left: 0;
      position: absolute;
      flex-direction: column;
      background-color: var(--surface-overlay);
      box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.02),
        0px 0px 2px rgba(0, 0, 0, 0.05), 0px 1px 4px rgba(0, 0, 0, 0.08);
      border-radius: $borderRadius;
      padding: 1rem;
      right: 2rem;
      top: 5rem;
      min-width: 15rem;

      .layout-topbar-button {
        margin-left: 0;
        display: flex;
        width: 100%;
        height: auto;
        justify-content: flex-start;
        border-radius: $borderRadius;
        padding: 1rem;

        i {
          font-size: 1rem;
          margin-right: 0.5rem;
        }

        span {
          font-weight: medium;
          display: block;
        }
      }
    }
  }
}

.scalein {
  animation: scalein .15s linear;
}

@keyframes scalein {
  0% {
    opacity: 0;
    transform: scaleY(.8);
    transition: transform .12s cubic-bezier(0,0,.2,1), opacity .12s cubic-bezier(0,0,.2,1);
  }

  to {
    opacity: 1;
    transform: scaleY(1);
  }
}

.fadeout {
  animation: fadeout .15s linear;
}

@keyframes fadeout {
  0% {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}
</style>
