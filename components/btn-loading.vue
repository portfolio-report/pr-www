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

<script>
export default {
  props: {
    action: { type: Function, default: () => {} },
    color: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
  },

  data: () => ({
    loading: false,
  }),

  methods: {
    async click() {
      this.loading = true
      await this.action()
      this.loading = false
    },
  },
}
</script>
