<template>
  <ClientOnly>
    <v-container
      :fluid="width <= 1600"
      class="py-1"
    >
      <v-row align="center">
        <template v-if="!isOnVoyage">
          <v-col
            cols="12"
            md="6"
          >
            <h2 class="text-h3 text-center text-md-left pb-3 ">
              <slot name="title" />
            </h2>
            <h4 class="text-h5 text-center text-md-left text-grey">
              <slot name="subtitle" />
            </h4>
          </v-col>
          <v-spacer />
        </template>
        <v-col
          cols="12"
          :md="isOnVoyage ? 12 : 6"
          :lg="isOnVoyage ? 12 : 5"
          class="pb-2"
          :class="isOnVoyage ? 'px-0' : ''"
        >
          <div
            class="d-flex flex-column  align-center rounded-md px-3 pt-md-2  "
            :class="isOnVoyage ? '' : 'flex-md-row bg-white'"
          >
            <v-text-field
              id="newsletter"
              v-model="email"
              :variant="isOnVoyage ? 'outlined' : 'solo'"
              rounded="md"
              :class="isOnVoyage ? 'border-color-secondary' : ''"
              flat
              hide-details
              :readonly="emailSentToBrevo"
              persistent-hint
              density="comfortable"
              :bg-color="isOnVoyage ? 'grey-light-3' : 'white'"
              class="w-100"
              type="email"
              @keyup.enter="subscribeToNewsletter"
            >
              <template #label>
                <!-- Vuetify classes does not work for scaling labels -->
                <h3 class="d-none d-md-block">
                  {{ newsletterContent?.emailPlaceholder || 'Entrez votre adresse email' }}
                </h3>
                <h4 class="d-md-none">
                  {{ newsletterContent?.emailPlaceholder || 'Entrez votre adresse email' }}
                </h4>
              </template>
              <template
                v-if="isOnVoyage"
                #append-inner
              >
                <v-btn
                  icon
                  variant="text"
                  color="secondary"
                  size="small"
                  :disabled="emailSentToBrevo"
                  :loading="isLoading"
                  @click="subscribeToNewsletter"
                >
                  <v-icon
                    color="secondary"
                    size="25"
                  >
                    {{ mdiArrowRight }}
                  </v-icon>
                </v-btn>
              </template>
            </v-text-field>
            <v-btn-secondary
              v-if="!isOnVoyage"
              :height="mdAndUp ? 62 : 40"
              :width="mdAndUp ? 161 : 100"
              class="my-3 text-body-1 font-weight-bold"
              rounded="md"
              :block="!mdAndUp"
              :disabled="emailSentToBrevo"
              :loading="isLoading"
              @click="subscribeToNewsletter"
            >
              {{ newsletterContent?.subscribeButton || "S'inscrire" }}
            </v-btn-secondary>
            <v-snackbar
              v-model="dialogEmailSent"
              :timeout="5000"
            >
              <template v-if="isNewsletterSubscription">
                {{ newsletterContent?.successMessage || 'Merci pour votre inscription à notre newsletter, vous recevrez bientôt nos inspirations et idées pour voyager autrement 🌍' }}
              </template>
              <template v-else>
                Merci pour votre inscription, nous vous enverrons un email dès que de nouvelles dates seront disponibles pour ce voyage.
              </template>
              <template #actions>
                <v-btn
                  color="blue"
                  variant="text"
                  @click="dialogEmailSent = false"
                >
                  {{ newsletterContent?.closeButton || 'Close' }}
                </v-btn>
              </template>
            </v-snackbar>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </ClientOnly>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { z } from 'zod'
import { mdiArrowRight } from '@mdi/js'

const props = defineProps({
  isOnVoyage: {
    type: Boolean,
    default: false,
  },
  voyage: {
    type: Object,
    default: null,
  },
})

const sanity = useSanity()

const { data: newsletterContent } = await useAsyncData('newsletter-content', () =>
  sanity.fetch(`*[_type == "newsletter"][0]{
  emailPlaceholder,
  subscribeButton,
  successMessage,
  closeButton
}`),
)

const { trackNewsletterSubscription, trackInscriptionAlerte } = useGtmTracking()

const { width, mdAndUp } = useDisplay()
const email = ref('')
const emailSentToBrevo = ref(false)
const dialogEmailSent = ref(false)
const isNewsletterSubscription = ref(true)
const isLoading = ref(false)

const validEmail = computed(() => {
  return z.string().email().safeParse(email.value).success && !emailSentToBrevo.value
})

const subscribeToNewsletter = async () => {
  if (!validEmail.value) return

  const newsletterData = {
    email: email.value,
    listIds: [18],
    listName: 'Optin Newsletter',
    state: 'Optin Newsletter',
  }

  // Track GTM event: inscription_alerte on voyage pages, newsletter otherwise
  if (props.isOnVoyage) {
    trackInscriptionAlerte(email.value)

    // Create ActiveCampaign deal for voyage alert subscription
    if (props.voyage) {
      isNewsletterSubscription.value = false
      isLoading.value = true
      const utmSource = localStorage.getItem('utmSource')
      const dealData = {
        value: props.voyage.pricing?.startingPrice * 100 || 0,
        title: props.voyage.title,
        currency: 'eur',
        group: '1',
        owner: '1',
        stage: '75', // Alert subscription stage
        // CustomFields
        travelType: 'Voyage de Groupe',
        country: props.voyage.destinations?.[0]?.title || '',
        iso: props.voyage.destinations?.[0]?.iso || '',
        zoneChapka: +props.voyage.destinations?.[0]?.chapka || 0,
        image: getImageUrl(props.voyage.image?.asset?._ref) || '/images/default/Odysway-couverture-mongolie.jpeg',
        currentStep: 'Inscription alerte départs',
        alreadyPaid: 0,
        restToPay: 0,
        utm: utmSource || '',
        slug: props.voyage.slug?.current || props.voyage.slug,
        basePricePerTraveler: props.voyage.pricing?.startingPrice * 100 || 0,
        source: 'Inscription alerte',
        // Contact
        email: email.value,
      }

      try {
        console.log('dealData', dealData)
        await apiRequest('/ac/deals', 'post', dealData)
      }
      catch (error) {
        console.error('Error creating ActiveCampaign deal:', error)
      }
      finally {
        isLoading.value = false
      }
    }
  }
  else {
    isNewsletterSubscription.value = true
    trackNewsletterSubscription(email.value)
    await apiRequest('/brevo/optin', 'post', newsletterData)
  }

  emailSentToBrevo.value = true
  dialogEmailSent.value = true
}
</script>

<style scoped>
/* Center placeholder */
:deep(.v-field-label) {
  font-weight: bold !important;
  font-size:12px;
  color: rgba(var(--v-theme-secondary))!important;
}
:deep(.v-field){
  color: rgba(var(--v-theme-secondary))!important;
}
</style>
