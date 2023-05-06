<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
import { email, required } from '@vuelidate/validators'
import { useVuelidate } from '@vuelidate/core'

useHead({
  title: 'Portfolio Report - Contact',
  link: [
    { rel: 'canonical', href: 'https://www.portfolio-report.net/contact' },
  ],
})
const toast = useToast()

const initialState = {
  name: '',
  email: '',
  subject: '',
  message: '',
}
const state = ref({ ...initialState })

const rules = {
  name: { required },
  email: { required, email },
  subject: { required },
  message: { required },
}

const v$ = useVuelidate(rules, state)

const loading = ref(false)

async function send() {
  if (v$.value.$invalid) {
    v$.value.$touch()
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Please fill all fields.',
      life: 5000,
    })
    return
  }

  loading.value = true

  try {
    await useApi('/contact', { method: 'post', body: state.value })
    state.value = { ...initialState }
    v$.value.$reset()
    toast.add({
      severity: 'success',
      summary: 'Thank you',
      detail: 'Your message has been sent.',
      life: 5000,
    })
    loading.value = false
  } catch (err) {
    loading.value = false
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Message could not be sent. Please try again later.',
      life: 5000,
    })
    // eslint-disable-next-line no-console
    console.log(err)
  }
}
</script>

<template>
  <div class="flex justify-content-center">
    <Card style="width: 800px">
      <template #title>
        Contact
      </template>
      <template #content>
        Please use the
        <a href="https://forum.portfolio-performance.info/">
          discussion forum
        </a>
        for all matters that can be discussed publicly.<br>
        This contact form can be used to establish direct contact with the
        operators for all matters that cannot be discussed publicly.

        <form class="mt-2" @submit.prevent="send">
          <div class="p-float-label mt-4">
            <InputText
              id="formName"
              v-model="v$.name.$model"
              class="w-full"
              :class="{ 'p-invalid': v$.name.$invalid && v$.name.$dirty }"
              @blur="v$.name.$touch"
            />
            <label for="formName">Your name</label>
          </div>

          <div class="p-float-label mt-4">
            <InputText
              id="formEmail"
              v-model="v$.email.$model"
              class="w-full"
              :class="{ 'p-invalid': v$.email.$invalid && v$.email.$dirty }"
              @blur="v$.email.$touch"
            />
            <label form="formEmail">Your email address</label>
          </div>

          <div class="p-float-label mt-4">
            <InputText
              id="formSubject"
              v-model="v$.subject.$model"
              class="w-full"
              :class="{
                'p-invalid': v$.subject.$invalid && v$.subject.$dirty,
              }"
              @blur="v$.subject.$touch"
            />
            <label for="formSubject">Subject</label>
          </div>

          <div class="p-float-label mt-4">
            <Textarea
              id="message"
              v-model="v$.message.$model"
              class="w-full"
              :class="{
                'p-invalid': v$.message.$invalid && v$.message.$dirty,
              }"
              :auto-resize="true"
              @blur="v$.message.$touch"
            />
            <label for="formMessage">Your message</label>
          </div>

          <div class="flex justify-content-end mt-4">
            <TextBtn
              type="submit"
              icon="i-carbon-send"
              label="Send"
              :disabled="loading"
            />
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>
