<template>
  <v-chip small color="secondary" text-color="white">
    {{ name }}
  </v-chip>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  name: 'SecurityTag',

  props: {
    name: {
      type: String,
      default: () => '',
    },
  },
})
</script>
