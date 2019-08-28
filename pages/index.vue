<template>
  <v-layout justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-card class="elevation-12">
        <v-card-title class="headline">
          Security search
        </v-card-title>
        <v-form v-model="searchFormValid" @submit.prevent="search">
          <v-card-text>
            <v-text-field
              v-model="searchTerm"
              :rules="searchRules"
              label="ISIN/WKN/Symbol/Name"
              clearable
              append-icon="mdi-magnify"
            />
            <v-select
              v-model="securityType"
              :items="securityTypeItems"
              label="Security type"
            />

            <v-alert v-model="noResults" type="info" outlined>
              Sorry, no results were found.
            </v-alert>

            <v-alert v-model="error" type="error" outlined>
              Sorry, there was an error:<br />{{ errorText }}
            </v-alert>

            <v-alert v-model="resultsLimited" type="warning" outlined>
              Output limited to 10 results.
            </v-alert>
          </v-card-text>
          <v-card-actions>
            <a @click="showContactForm = true">Get in contact</a>
            <v-spacer />
            <v-btn
              type="submit"
              color="primary"
              :loading="searching"
              :disabled="!searchFormValid || searching"
            >
              Search
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>

      <v-card v-for="result in results" :key="result.uuid">
        <v-card-title>
          <span>{{ result.name }}</span>
          <v-chip small color="primary" text-color="white">
            {{ result.security_type }}
          </v-chip>
        </v-card-title>
        <v-card-text>
          <ul>
            <li>
              ISIN: <b>{{ result.isin }}</b>
            </li>
            <li>
              WKN: <b>{{ result.wkn }}</b>
            </li>
            <li v-if="result.markets['XFRA']">
              Symbol (Frankfurt):
              <b>{{ result.markets['XFRA'].symbol }}</b>
            </li>
            <li v-if="result.markets['XNAS']">
              Symbol (NASDAQ):
              <b>{{ result.markets['XNAS'].symbol }}</b>
            </li>
            <li v-if="result.markets['XNYS']">
              Symbol (New York):
              <b>{{ result.markets['XNYS'].symbol }}</b>
            </li>
          </ul>
        </v-card-text>
      </v-card>

      <v-dialog v-model="showContactForm" width="500">
        <v-card>
          <v-card-title class="headline grey lighten-2" primary-title>
            Contact
            <v-spacer />
            <v-btn color="grey" text icon @click="showContactForm = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-form v-model="contactFormValid">
              <v-text-field
                v-model="name"
                :rules="nameRules"
                label="Your name"
              />
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

          <v-divider></v-divider>

          <v-alert :value="showErrorMessage" type="error" outlined>
            Message could not be send. Please try again later.
          </v-alert>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              :disabled="!contactFormValid && !sendingContactForm"
              :loading="sendingContactForm"
              @click="send"
            >
              Send
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-flex>
  </v-layout>
</template>

<script>
import isEmail from 'validator/lib/isEmail'

export default {
  components: {},
  head() {
    return {
      title: 'Portfolio Report'
    }
  },
  data() {
    return {
      searchFormValid: false,
      searchTerm: '',
      searchRules: [v => !!v || 'Required'],
      securityType: 'share',
      securityTypeItems: [
        { text: 'share', value: 'share' },
        { text: 'bond', value: 'bond' },
        { text: '[all]', value: '' }
      ],
      results: [],
      noResults: false,
      searching: false,
      error: false,
      errorText: '',
      showContactForm: false,
      contactFormValid: false,
      sendingContactForm: false,
      showErrorMessage: false,
      name: '',
      nameRules: [v => !!v || 'Name is required'],
      email: '',
      emailRules: [
        v => !!v || 'Email is required',
        v => isEmail(v) || 'Email must be valid'
      ],
      subject: '',
      subjectRules: [v => !!v || 'Subject is required'],
      message: '',
      messageRules: [v => !!v || 'Message is required']
    }
  },
  computed: {
    resultsLimited: {
      get() {
        return this.results.length === 10
      }
    }
  },
  methods: {
    search() {
      this.searching = true
      this.noResults = false
      this.error = false
      fetch(
        `/api/securities/search/${encodeURIComponent(
          this.searchTerm.trim()
        )}?type=${encodeURIComponent(this.securityType)}`
      )
        .then(res => {
          if (res.ok) {
            return res
          } else {
            throw new Error(res.statusText)
          }
        })
        .then(res => res.json())
        .then(res => {
          this.searching = false
          this.results = res
          this.noResults = this.results.length === 0
        })
        .catch(error => {
          this.searching = false
          this.results = []
          this.noResults = false
          this.error = true
          this.errorText = error.message
        })
    },
    send() {
      this.sendingContactForm = true
      this.showErrorMessage = false
      const data = {
        name: this.name,
        email: this.email,
        subject: this.subject,
        message: this.message
      }
      this.$axios
        .post('/api/contact', data)
        .then(res => {
          this.sendingContactForm = false
          this.showContactForm = false
        })
        .catch(err => {
          this.sendingContactForm = false
          this.showErrorMessage = true
          // eslint-disable-next-line no-console
          console.log(err)
        })
    }
  }
}
</script>
