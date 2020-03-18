<template>
  <div>
    <v-alert :value="true" type="error" outlined>
      {{ error.message }}
    </v-alert>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class ErrorLayout extends Vue {
  head() {
    return {
      title: 'Portfolio Report',
    }
  }

  @Prop()
  error!: Object
}
</script>
