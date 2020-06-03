<template>
  <v-btn
    :color="color"
    :loading="loading"
    :disabled="disabled || loading"
    @click="click"
  >
    <slot />
  </v-btn>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class BtnLoading extends Vue {
  @Prop({ default: () => {} })
  action!: Function

  @Prop({ default: '' })
  color!: string

  @Prop({ default: false })
  disabled!: Boolean

  loading = false

  async click() {
    this.loading = true
    await this.action()
    this.loading = false
  }
}
</script>
