<template>
  <v-row align="center" justify="center">
    <v-col cols="12" sm="8" md="6">
      <v-card>
        <v-card-title class="headline lighten-2" primary-title>
          Contact
        </v-card-title>

        <v-card-text>
          Please use the
          <a href="https://forum.portfolio-performance.info/">
            discussion forum</a
          >
          for all matters that can be discussed publicly.<br />
          This contact form can be used to establish direct contact with the
          operators for all matters that cannot be discussed publicly.

          <v-form ref="form" v-model="contactFormValid" class="mt-4">
            <v-text-field
              v-model="name"
              :rules="nameRules"
              label="Your name"
              outlined
              dense
            />
            <v-text-field
              v-model="email"
              :rules="emailRules"
              label="Your email address"
              outlined
              dense
            />
            <v-text-field
              v-model="subject"
              :rules="subjectRules"
              label="Subject"
              outlined
              dense
            />
            <v-textarea
              v-model="message"
              :rules="messageRules"
              label="Your message"
              outlined
              dense
            />
          </v-form>
        </v-card-text>

        <v-divider />

        <v-alert :value="showErrorMessage" type="error" outlined>
          Message could not be send. Please try again later.
        </v-alert>

        <v-card-actions>
          <v-spacer></v-spacer>
          <btn-loading
            color="primary"
            :disabled="!contactFormValid"
            :action="send"
          >
            Send
          </btn-loading>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent, ref, useContext } from '@nuxtjs/composition-api'
import isEmail from 'validator/lib/isEmail'
import BtnLoading from '../components/BtnLoading.vue'

export default defineComponent({
  name: 'ContactPage',

  components: { BtnLoading },

  setup() {
    const { $axios } = useContext()

    const form = ref<HTMLFormElement | null>(null)

    const contactFormValid = ref(false)
    const showErrorMessage = ref(false)
    const name = ref('')
    const nameRules = [(v: string) => !!v || 'Required']
    const email = ref('')
    const emailRules = [
      (v: string) => !!v || 'Required',
      (v: string) => (!!v && isEmail(v)) || 'Valid email required',
    ]

    const subject = ref('')
    const subjectRules = [(v: string) => !!v || 'Required']
    const message = ref('')
    const messageRules = [(v: string) => !!v || 'Required']

    async function send() {
      showErrorMessage.value = false
      const data = {
        name: name.value,
        email: email.value,
        subject: subject.value,
        message: message.value,
      }
      try {
        await $axios.post('/contact', data)
        form.value?.reset()
      } catch (err) {
        showErrorMessage.value = true
        // eslint-disable-next-line no-console
        console.log(err)
      }
    }

    return {
      form,
      contactFormValid,
      showErrorMessage,
      name,
      nameRules,
      email,
      emailRules,
      subject,
      subjectRules,
      message,
      messageRules,
      send,
    }
  },

  head() {
    return {
      title: 'Portfolio Report - Contact',
    }
  },
})
</script>
