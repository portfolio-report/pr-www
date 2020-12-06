<template>
  <v-dialog v-model="dialog" :max-width="width" persistent @keydown.esc="no">
    <v-card>
      <v-toolbar dark :color="color" dense flat>
        <v-toolbar-title class="white--text">{{ title }}</v-toolbar-title>
      </v-toolbar>
      <v-card-text v-show="!!message">{{ message }}</v-card-text>
      <v-card-actions class="pt-0">
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click.native="yes">Yes</v-btn>
        <v-btn color="grey" text @click.native="no">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class DialogConfirm extends Vue {
  dialog = false
  resolve: any
  reject: any
  message = ''
  title = ''
  color = 'primary'
  width = 300

  public open({
    title,
    message,
    color = 'primary',
    width = 300,
  }: {
    title: string
    message: string
    color: string
    width: number
  }) {
    this.dialog = true
    this.title = title
    this.message = message
    this.color = color
    this.width = width
    return new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }

  yes() {
    this.resolve(true)
    this.dialog = false
  }

  no() {
    this.resolve(false)
    this.dialog = false
  }
}
</script>
