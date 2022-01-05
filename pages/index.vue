<template>
  <div />
</template>

<script lang="ts">
import { defineComponent, useContext, useFetch } from '@nuxtjs/composition-api'

export default defineComponent({
  name: 'IndexPage',

  setup() {
    const { redirect } = useContext()
    useFetch(() => redirect(303, '/search'))
  },
})
</script>
