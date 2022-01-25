<template>
  <v-app>
    <v-navigation-drawer
      v-if="authenticated"
      v-model="leftDrawerOpen"
      fixed
      app
    >
      <v-list>
        <v-list-item
          v-for="menuItem in menuItems"
          :key="menuItem.name"
          router
          :to="menuItem.to"
          exact
        >
          <v-list-item-action>
            <v-icon>{{ menuItem.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ menuItem.name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar fixed app>
      <v-app-bar-nav-icon
        v-if="authenticated"
        @click="leftDrawerOpen = !leftDrawerOpen"
      />
      <nuxt-link to="/">
        <v-img
          class="mx-2"
          src="/favicon-192.png"
          max-height="50"
          max-width="50"
          contain
          to="/"
        />
      </nuxt-link>
      <nuxt-link to="/" class="title">
        <v-toolbar-title v-text="title" />
      </nuxt-link>
      <v-spacer />
      <v-btn v-if="!authenticated" to="/login" text>Log in</v-btn>
      <v-menu v-if="authenticated" open-on-hover bottom offset-y>
        <template #activator="{ on }">
          <v-btn color="primary" text v-on="on">
            <v-icon>{{ icons.mdiAccount }}</v-icon>
            {{ username }}
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="logout">
            <v-list-item-avatar>
              <v-icon>{{ icons.mdiLogoutVariant }}</v-icon>
            </v-list-item-avatar>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-main>
      <v-container>
        <ConfirmDialogProvider>
          <SecurityDialogProvider>
            <nuxt />
          </SecurityDialogProvider>
        </ConfirmDialogProvider>
      </v-container>
    </v-main>
    <v-footer>
      <v-spacer />
      <v-tooltip top>
        <template #activator="{ on }">
          <v-btn
            href="https://forum.portfolio-performance.info/"
            icon
            v-on="on"
          >
            <v-icon>{{ icons.mdiForum }}</v-icon>
          </v-btn>
        </template>
        <span>Get help and discuss</span>
      </v-tooltip>
      <v-tooltip top>
        <template #activator="{ on }">
          <v-btn to="/contact" icon v-on="on">
            <v-icon>{{ icons.mdiEmail }}</v-icon>
          </v-btn>
        </template>
        <span>Get in contact</span>
      </v-tooltip>
      <v-tooltip top>
        <template #activator="{ on }">
          <v-btn
            href="https://www.github.com/tfabritius/pr-www"
            target="_blank"
            icon
            v-on="on"
          >
            <v-icon>{{ icons.mdiSourceRepository }}</v-icon>
          </v-btn>
        </template>
        <span>Source code</span>
      </v-tooltip>
      <v-spacer></v-spacer>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  useContext,
  useMeta,
} from '@nuxtjs/composition-api'

import icons from '@/components/icons'
import SecurityDialogProvider from '@/components/SecurityDialogProvider.vue'
import ConfirmDialogProvider from '@/components/ConfirmDialogProvider.vue'

export default defineComponent({
  name: 'DefaultLayout',

  components: { SecurityDialogProvider, ConfirmDialogProvider },

  setup() {
    const { $auth } = useContext()

    const { title, link } = useMeta()
    title.value = 'Portfolio Report'
    link.value = [
      {
        rel: 'search',
        type: 'application/opensearchdescription+xml',
        href: '/opensearch.xml',
      },
    ]

    const leftDrawerOpen = ref(false)

    const menuItems = [
      { name: 'Home', icon: icons.mdiHome, to: '/' },
      { name: 'Statistics', icon: icons.mdiPoll, to: '/stats' },
      {
        name: 'Securities',
        icon: icons.mdiCurrencyUsd,
        to: '/admin/securities',
      },
      {
        name: 'Taxonomies',
        icon: icons.mdiFamilyTree,
        to: '/admin/taxonomies',
      },
      {
        name: 'Statistics (admin)',
        icon: icons.mdiPoll,
        to: '/admin/stats',
      },
    ]

    const authenticated = computed(() => $auth.loggedIn && $auth.user?.isAdmin)

    const username = computed(() => $auth.user?.username)

    const logout = $auth.logout

    return {
      leftDrawerOpen,
      menuItems,
      authenticated,
      username,
      logout,
      title,
      icons,
    }
  },

  head: {},
})
</script>

<style scoped>
.title {
  color: inherit;
  text-decoration: inherit;
}
</style>
