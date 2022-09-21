<template>
  <div class="layout-topbar">
    <NuxtLink to="/" class="layout-topbar-logo">
      <img class="mx-2 h-4rem" src="/favicon-192.png" to="/" alt="Logo" />
      <span class="text-2xl font-medium align-self-center text-color">
        Portfolio Report
      </span>
    </NuxtLink>

    <Button
      v-show="authenticated"
      class="p-link layout-menu-button layout-topbar-button"
      @click.prevent="emit('menuToggle')"
    >
      <i class="i-carbon-menu"></i>
    </Button>

    <Button
      v-styleclass="{
        selector: '@next',
        enterClass: 'hidden',
        enterActiveClass: 'scalein',
        leaveToClass: 'hidden',
        leaveActiveClass: 'fadeout',
        hideOnOutsideClick: true,
      }"
      class="p-link layout-topbar-menu-button layout-topbar-button"
    >
      <i class="i-carbon-overflow-menu-vertical"></i>
    </Button>

    <ul class="layout-topbar-menu hidden lg:flex origin-top">
      <li>
        <form v-if="$route.path != '/search'" @submit.prevent="search">
          <div class="p-inputgroup">
            <InputText v-model="searchTerm" placeholder="Search" />
            <Button
              type="submit"
              icon="i-carbon-search i-lg"
              class="p-button-secondary"
            >
            </Button>
          </div>
        </form>
      </li>
      <ClientOnly>
        <template v-if="authenticated">
          <li>
            <Button class="p-link layout-topbar-button">
              <i class="i-carbon-settings"></i>
              <span>Settings</span>
            </Button>
          </li>
          <li>
            <Button class="p-link layout-topbar-button" @click="userMenuToggle">
              <i class="i-carbon-user-avatar"></i>
              <span>User {{ auth.username.toUpperCase() }}</span>
            </Button>
            <Menu ref="userMenu" :model="userMenuItems" :popup="true"></Menu>
          </li>
        </template>
        <li v-else>
          <NuxtLink to="/login">
            <Button class="p-link layout-topbar-button">
              <i class="i-carbon-login"></i>
              <span>Sign in</span>
            </Button>
          </NuxtLink>
        </li>
      </ClientOnly>
    </ul>
  </div>
</template>

<script setup lang="ts">
import Menu from 'primevue/menu'
import { MenuItem } from 'primevue/menuitem'

import { useAuthStore } from '~/store/auth'

const emit = defineEmits<{ (e: 'menuToggle'): void }>()

const router = useRouter()
const auth = useAuthStore()

const searchTerm = ref('')

const authenticated = computed(() => auth.loggedIn && auth.isAdmin)

function search() {
  const q = searchTerm.value
  searchTerm.value = ''
  router.push({ path: '/search', query: { q } })
}

const userMenu = ref<Menu>()
const userMenuToggle = (event: Event) => {
  userMenu.value?.toggle(event)
}
const userMenuItems = ref<MenuItem[]>([
  {
    label: 'Log out',
    items: [
      {
        label: 'Log out',
        icon: 'i-carbon-logout',
        command: () => auth.logout(),
      },
    ],
  },
])
</script>

<style lang="scss" scoped>
@import '@/assets/styles/mixins.scss';
@import '@/assets/styles/variables.scss';

.layout-topbar {
  position: fixed;
  height: 5rem;
  z-index: 997;
  left: 0;
  top: 0;
  width: 100%;
  padding: 0 2rem;
  background-color: var(--surface-card);
  transition: left $transitionDuration;
  display: flex;
  align-items: center;
  box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.02), 0px 0px 2px rgba(0, 0, 0, 0.05),
    0px 1px 4px rgba(0, 0, 0, 0.08);

  .layout-topbar-logo {
    display: flex;
    align-items: center;
    color: var(--surface-900);
    font-size: 1.5rem;
    font-weight: 500;
    width: 300px;
    border-radius: $borderRadius;

    img {
      height: 2.5rem;
      margin-right: 0.5rem;
    }

    &:focus {
      @include focused();
    }
  }

  .layout-topbar-button {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    position: relative;
    color: var(--text-color-secondary);
    border-radius: 50%;
    width: 3rem;
    height: 3rem;
    cursor: pointer;
    transition: background-color $transitionDuration;

    &:hover {
      color: var(--text-color);
      background-color: var(--surface-hover);
    }

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
  }

  .layout-topbar-menu-button {
    display: none;

    i {
      font-size: 1.25rem;
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
</style>
