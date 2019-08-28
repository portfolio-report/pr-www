<template>
  <div>
    <v-alert :value="true" type="error" outlined>
      {{ error.message }}
    </v-alert>
  </div>
</template>

<script>
export default {
  head() {
    return {
      title: 'Portfolio Report'
    }
  },
  // eslint-disable-next-line
  props: { error: Object }
}
</script>
