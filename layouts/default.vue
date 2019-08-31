<template>
  <v-app>
    <v-app-bar fixed app>
      <v-img
        class="mx-2"
        src="/favicon-192.png"
        max-height="50"
        max-width="50"
        contain
      />
      <v-toolbar-title v-text="title" />
    </v-app-bar>
    <v-content>
      <v-container>
        <nuxt />
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      title: 'Portfolio Report',
    }
  },
}
</script>
