<template>
  <div>
    <v-select
      :value="value"
      :items="securityTypeItems"
      label="Security Type"
      @input="update"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class SelectSecurityType extends Vue {
  @Prop({ default: '' })
  value!: string

  securityTypeItems = [
    { text: '*', value: '' },
    { text: 'share', value: 'share' },
    { text: 'fund', value: 'fund' },
    { text: 'bond', value: 'bond' },
    { text: 'index', value: 'index' },
  ]

  update(event: string) {
    this.$emit('input', event)
  }
}
</script>
