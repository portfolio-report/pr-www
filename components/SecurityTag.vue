<template>
  <v-chip small color="secondary" text-color="white">
    <NuxtLink :to="linkTo">{{ name }}</NuxtLink>
  </v-chip>
</template>

<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  name: 'SecurityTag',

  props: {
    name: {
      type: String,
      default: () => '',
    },
  },

  setup(props) {
    const linkTo = computed(() => {
      let name = props.name
      if (name.includes(' ')) {
        name = '"' + name + '"'
      }
      return `/search?q=tag:${name}`
    })

    return { linkTo }
  },
})
</script>

<style scoped>
a {
  color: white !important;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
