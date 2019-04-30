<template>
  <div>
    <v-alert :value="true" type="error" outline>
      {{ error.message }}
    </v-alert>
  </div>
</template>

<script>
export default {
  // eslint-disable-next-line
  props: { error: Object }
}
</script>
