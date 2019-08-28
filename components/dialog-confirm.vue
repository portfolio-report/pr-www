<template>
  <v-dialog
    v-model="dialog"
    :max-width="options.width"
    persistent
    @keydown.esc="no"
  >
    <v-card>
      <v-toolbar dark :color="options.color" dense flat>
        <v-toolbar-title class="white--text">{{ title }}</v-toolbar-title>
      </v-toolbar>
      <v-card-text v-show="!!message">{{ message }}</v-card-text>
      <v-card-actions class="pt-0">
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click.native="yes">
          Yes
        </v-btn>
        <v-btn color="grey" text @click.native="no">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data: () => ({
    dialog: false,
    resolve: null,
    reject: null,
    message: null,
    title: null,
    options: {
      color: 'primary',
      width: 300,
    },
  }),
  methods: {
    open({ title, message, ...options }) {
      this.dialog = true
      this.title = title
      this.message = message
      Object.assign(this.options, options)
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },
    yes() {
      this.resolve(true)
      this.dialog = false
    },
    no() {
      this.resolve(false)
      this.dialog = false
    },
  },
}
</script>
