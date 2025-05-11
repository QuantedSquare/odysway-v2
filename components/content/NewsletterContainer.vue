<template>
  <v-container
    :fluid="width < 1440"
  >
    <v-row align="center">
      <template v-if="!isOnVoyage">
        <v-col
          cols="12"
          md="6"
        >
          <h2 class="text-h2 text-center text-md-left pb-3 ">
            <slot name="title" />
          </h2>
          <h5 class="text-h5 text-center text-md-left ">
            <slot name="subtitle" />
          </h5>
        </v-col>
        <v-spacer />
      </template>
      <v-col
        cols="12"
        :md="isOnVoyage ? 12 : 6"
        :lg="isOnVoyage ? 12 : 5"
      >
        <div
          class="d-flex flex-column flex-md-row align-center rounded-md px-3 pt-2"
          :class="isOnVoyage ? 'bg-grey-light' : 'bg-white'"
        >
          <v-text-field
            id="newsletter"
            v-model="email"
            variant="solo"
            rounded="md"
            outlined
            flat
            hide-details
            :readonly="emailSentToBrevo"
            persistent-hint
            density="compact"
            :bg-color="isOnVoyage ? 'grey-light' : 'white'"
            class="w-100"
            label="Entrez votre adresse email"
            type="email"
          />
          <v-btn-secondary
            :height="mdAndUp ? 62 : 40"
            :width="mdAndUp ? 161 : 100"
            class="my-3 text-body-1 font-weight-bold "
            rounded="md"
            :block="!mdAndUp"
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
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { z } from 'zod'

defineProps({
  isOnVoyage: {
    type: Boolean,
    default: false,
  },
})
const { gtag } = useGtag()

const { width, mdAndUp } = useDisplay()
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
        debug_mode: true,
      })
  }
}
</script>

<style scoped>
/* Center placeholder */
:deep(.v-field-label) {
  font-weight: bold !important;
  color: rgb(var(--v-theme-grey-darken-2)) !important;
  font-size: 14px !important;
  width: 100% !important;
}

@media (max-width: 500px) {
  :deep(.v-field-label) {
    font-size: 13px !important;
  }
}
</style>
