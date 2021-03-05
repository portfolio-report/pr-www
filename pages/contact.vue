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

          <v-form ref="form" v-model="contactFormValid">
            <v-text-field
              v-model="name"
              :rules="nameRules"
              label="Your name"
              outlined
            />
            <v-text-field
              v-model="email"
              :rules="emailRules"
              label="Your email address"
              outlined
            />
            <v-text-field
              v-model="subject"
              :rules="subjectRules"
              label="Subject"
              outlined
            />
            <v-textarea
              v-model="message"
              :rules="messageRules"
              label="Your message"
              outlined
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
import { Component, Vue } from 'nuxt-property-decorator'
import isEmail from 'validator/lib/isEmail'
import BtnLoading from '../components/btn-loading.vue'

@Component({
  components: { BtnLoading },
})
export default class ContactPage extends Vue {
  contactFormValid = false
  showErrorMessage = false
  name = ''
  nameRules = [(v: string) => !!v || 'Required']
  email = ''
  emailRules = [
    (v: string) => !!v || 'Required',
    (v: string) => (!!v && isEmail(v)) || 'Valid email required',
  ]

  subject = ''
  subjectRules = [(v: string) => !!v || 'Required']
  message = ''
  messageRules = [(v: string) => !!v || 'Required']

  async send() {
    this.showErrorMessage = false
    const data = {
      name: this.name,
      email: this.email,
      subject: this.subject,
      message: this.message,
    }
    try {
      await this.$axios.post('/contact', data)
      await (this.$refs.form as any).reset()
    } catch (err) {
      this.showErrorMessage = true
      // eslint-disable-next-line no-console
      console.log(err)
    }
  }

  head() {
    return {
      title: 'Portfolio Report - Contact',
    }
  }
}
</script>
