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
import { defineComponent, ref } from '@nuxtjs/composition-api'

export default defineComponent({
  name: 'ErrorLayout',

  props: {
    action: {
      type: Function,
      default: () => {},
    },

    color: {
      type: String,
      default: '',
    },

    disabled: {
      type: Boolean,
      default: false,
    },
  },

  setup(props: { action: Function }) {
    const loading = ref(false)

    async function click() {
      loading.value = true
      await props.action()
      loading.value = false
    }

    return { loading, click }
  },
})
</script>
