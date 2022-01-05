<template>
  <div>
    <v-select
      :value="value"
      :items="securityTypeItems"
      label="Security Type"
      dense
      outlined
      @input="update"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  name: 'SelectSecurityType',

  props: {
    value: {
      type: String,
      default: '',
    },
  },

  setup(_props, { emit }) {
    const securityTypeItems = [
      { text: '*', value: '' },
      { text: 'share', value: 'share' },
      { text: 'fund', value: 'fund' },
      { text: 'bond', value: 'bond' },
      { text: 'index', value: 'index' },
    ]

    function update(event: string) {
      emit('input', event)
    }

    return { securityTypeItems, update }
  },
})
</script>
