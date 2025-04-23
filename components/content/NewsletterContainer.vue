<template>
  <v-container :fluid="width < 1440">
    <v-row align="center">
      <v-col
        cols="12"
        md="6"
      >
        <h2 class="text-h2 text-center text-md-left pb-3">
          <slot name="title" />
        </h2>
        <h5 class="text-h5 text-center text-md-left ">
          <slot name="subtitle" />
        </h5>
      </v-col>
      <v-spacer />
      <v-col
        cols="12"
        md="5"
      >
        <v-text-field
          id="newsletter"
          v-model="email"
          variant="solo"
          outlined
          flat
          hide-details
          :readonly="emailSentToBrevo"
          persistent-hint
          density="compact"
          bg-color="white"
          placeholder="Entrez votre adresse email"
          type="email"
        >
          <template #append-inner>
            <v-btn-secondary
              height="62"
              width="161"
              class="my-3 text-body-1"
              @click="subscribeToNewsletter"
            >
              S'inscrire
            </v-btn-secondary>
            <v-dialog
              v-model="dialogEmailSent"
              width="auto"
            >
              <v-card
                max-width="300px"
                text="Merci pour votre inscription à notre newsletter, vous recevrez bientôt nos inspirations et idées pour voyager autrement 🌍"
              >
                <template #actions>
                  <v-btn
                    class="ms-auto"
                    text="Ok"
                    @click="dialogEmailSent = false"
                  />
                </template>
              </v-card>
            </v-dialog>
          </template>
        </v-text-field>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { z } from 'zod'

const { gtag } = useGtag()

const { width } = useDisplay()
const email = ref('')
const emailSentToBrevo = ref(false)
const dialogEmailSent = ref(false)

const validEmail = computed(() => {
  return z.string().email().safeParse(email.value).success
})

const subscribeToNewsletter = async () => {
  const newsletterData = {
    email: email.value,
    listIds: [18],
    listName: 'Optin Newsletter',
    state: 'Optin Newsletter',
  }
  if (validEmail.value) {
    await apiRequest('/brevo/optin', 'post', newsletterData)
    email.value = ''
    validEmail.value = false
    emailSentToBrevo.value = true
    dialogEmailSent.value = true
    gtag('event',
      'click',
      {
        event_category: 'Newsletter',
        event_action: 'subscribe',
        event_label: `Newsletter Subscription`,
        event_value: 1,
      })
  }
}
</script>

<style scoped>
/* Center placeholder */
:deep(.v-field__input) {
  align-items: center !important;
}
</style>
