<template>
  <v-dialog v-model="dialog" :max-width="width" persistent @keydown.esc="no">
    <v-form @submit.prevent="yes">
      <v-card>
        <v-toolbar v-if="!!title" dark :color="color" dense flat>
          <v-toolbar-title class="white--text">{{ title }}</v-toolbar-title>
        </v-toolbar>
        <v-card-text v-show="!!message">
          {{ message }}
        </v-card-text>
        <v-card-actions class="pt-0">
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click.native="no">
            <v-icon>{{ mdiClose }}</v-icon> No
          </v-btn>
          <v-btn type="submit" color="primary" text>
            <v-icon>{{ mdiCheck }}</v-icon> Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, mixins } from 'nuxt-property-decorator'

import { IconsMixin } from '@/components/icons-mixin'

@Component
export default class DialogConfirm extends mixins(Vue, IconsMixin) {
  dialog = false
  resolve: any
  reject: any
  message = ''
  title = ''
  color = 'primary'
  width = 300

  public open({
    title = '',
    message,
    color = 'primary',
    width = 300,
  }: {
    title?: string
    message: string
    color?: string
    width?: number
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
