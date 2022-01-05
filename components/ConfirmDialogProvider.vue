<template>
  <div>
    <slot />
    <v-dialog
      v-model="dialog"
      :max-width="options.width"
      persistent
      @keydown.esc="no"
    >
      <v-form @submit.prevent="yes">
        <v-card>
          <v-toolbar
            v-if="!!options.title"
            dark
            :color="options.color"
            dense
            flat
          >
            <v-toolbar-title class="white--text">
              {{ options.title }}
            </v-toolbar-title>
          </v-toolbar>
          <v-card-text v-show="!!message">
            {{ message }}
          </v-card-text>
          <v-card-actions class="pt-0">
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click.native="no">
              <v-icon>{{ icons.mdiClose }}</v-icon> No
            </v-btn>
            <v-btn type="submit" color="primary" text>
              <v-icon>{{ icons.mdiCheck }}</v-icon> Yes
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  provide,
  reactive,
  toRefs,
} from '@nuxtjs/composition-api'

import {
  ShowConfirmDialogKey,
  ShowConfirmDialogOptions,
} from './useConfirmDialog'
import icons from '@/components/icons'

export default defineComponent({
  setup() {
    const state = reactive({
      dialog: false,
      resolve: (_val: boolean) => {},
      reject: (_val: boolean) => {},
      message: '',
      options: {
        title: '',
        width: 300,
        color: 'primary',
      } as ShowConfirmDialogOptions,
    })

    function showConfirmDialog(
      message: string,
      options: ShowConfirmDialogOptions = {}
    ) {
      state.dialog = true
      state.message = message
      state.options = Object.assign(state.options, options)

      return new Promise<boolean>((resolve, reject) => {
        state.resolve = resolve
        state.reject = reject
      })
    }

    provide(ShowConfirmDialogKey, showConfirmDialog)

    function yes() {
      state.resolve(true)
      state.dialog = false
    }

    function no() {
      state.resolve(false)
      state.dialog = false
    }

    return { ...toRefs(state), yes, no, icons }
  },
})
</script>
