<template>
  <v-layout justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-card>
        <v-card-title class="headline lighten-2" primary-title>
          Contact
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="contactFormValid">
            <v-text-field v-model="name" :rules="nameRules" label="Your name" />
            <v-text-field
              v-model="email"
              :rules="emailRules"
              label="Your email address"
            />
            <v-text-field
              v-model="subject"
              :rules="subjectRules"
              label="Subject"
            />
            <v-textarea
              v-model="message"
              :rules="messageRules"
              label="Your message"
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
    </v-flex>
  </v-layout>
</template>

<script>
import BtnLoading from '../components/btn-loading'
import isEmail from 'validator/lib/isEmail'

export default {
  components: { BtnLoading },
  data() {
    return {
      contactFormValid: false,
      showErrorMessage: false,
      name: '',
      nameRules: [v => !!v || 'Required'],
      email: '',
      emailRules: [
        v => !!v || 'Required',
        v => (!!v && isEmail(v)) || 'Valid email required',
      ],
      subject: '',
      subjectRules: [v => !!v || 'Required'],
      message: '',
      messageRules: [v => !!v || 'Required'],
    }
  },
  methods: {
    async send() {
      this.showErrorMessage = false
      const data = {
        name: this.name,
        email: this.email,
        subject: this.subject,
        message: this.message,
      }
      try {
        await this.$axios.post('/api/contact', data)
        this.$refs.form.reset()
      } catch (err) {
        this.showErrorMessage = true
        // eslint-disable-next-line no-console
        console.log(err)
      }
    },
  },
  head() {
    return {
      title: 'Portfolio Report - Contact',
    }
  },
}
</script>
