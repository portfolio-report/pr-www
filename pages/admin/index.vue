<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6></v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component({ layout: 'admin' })
export default class IndexPage extends Vue {
  head() {
    return {
      title: 'Portfolio Report Admin',
    }
  }
}
</script>
