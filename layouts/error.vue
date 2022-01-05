<template>
  <div>
    <div v-if="error.statusCode === 404">
      <h1>Page not found 😟</h1>
      <p>
        Sorry, this page does not exist. If you think, this is wrong, please
        <NuxtLink to="/contact">let us know</NuxtLink>.
      </p>
      <NuxtLink to="/">Go to home page</NuxtLink>
    </div>
    <v-alert v-else :value="true" type="error" outlined>
      {{ error.message }}
    </v-alert>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  name: 'ErrorLayout',

  props: {
    error: {
      type: Object,
      required: true,
    },
  },

  head() {
    return { title: 'Portfolio Report' }
  },
})
</script>
