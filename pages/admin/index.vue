<template>
  <div />
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
