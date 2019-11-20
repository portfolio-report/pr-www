<template>
  <span :class="{ 'red--text': oldText != newText }">
    {{ oldText }}
    <br />
    <span v-if="oldText != newText" class="green--text">
      {{ newText }}
    </span>
  </span>
</template>

<script>
export default {
  props: {
    oldText: { type: String, default: '' },
    newText: { type: String, default: '' },
  },
}
</script>
