<template>
  <v-container
    fluid
    class="mt-10 relative"
  >
    <v-img
      v-if="voyage && voyage.imageSecondary"
      :src="img(voyage.imageSecondary.src, { format: 'webp', quality: 70, height: 900, width: 1536 })"
      :lazy-src="img(voyage.imageSecondary.src, { format: 'webp', quality: 10, height: 900, width: 1536 })"
      size="(max-width: 600) 480px, 1500px"
      :srcset="`${img(voyage.imageSecondary.src, { format: 'webp', quality: 70, width: 640 })} 480w, ${img(voyage.imageSecondary.src, { format: 'webp', quality: 70, width: 1024 })} 1500w`"
      :alt="voyage.imageSecondary.alt"
      height="350px"
      cover
      class="absolute"
    />

    <v-row justify="center">
      <v-col
        v-if="pageStatus === 'success'"
        cols="12"
      >
        <FunnelStepsStepperHeader
          v-model="currentStep"
          :page="page"
          :skipper-mode="skipperChoice"
        >
          <v-row class="funnel-stepper d-flex justify-center">
            <v-col
              cols="12"
              class="d-flex justify-center"
            >
              <v-card
                class="border-width relative w-md-75 w-lg-50 w-xl-33 no-margin-window "
              >
                <v-img
                  color="surface-variant"
                  height="100"
                  :src="voyage.image.src"
                  cover
                  class="align-center"
                >
                  <div class="text-center text-body-1 text-shadow">
                    {{ voyage.title }}
                  </div>
                </v-img>
                <v-stepper-window :model-value="currentStep">
                  <v-stepper-window-item :value="1">
                    <DevisSkipper
                      v-model="skipperChoice"
                      :page="page.first_step"
                    />
                  </v-stepper-window-item>
                  <v-stepper-window-item :value="2">
                    <DevisDetails
                      v-if="skipperChoice === 'devis'"
                      v-model="details"
                      :page="page.second_step"
                    />
                    <DevisUserInfoForm
                      v-if="skipperChoice === 'call' && !showCalendly"
                      v-model="userInfo"
                      :page="page.third_step"
                    />
                    <CalendlyContainer
                      v-else-if="skipperChoice === 'call' && showCalendly"
                      :travel-title="voyage.title"
                      :text="page.calendly.text"
                    />
                    <FunnelTallyForm v-if="skipperChoice === 'tally'" />
                  </v-stepper-window-item>
                  <v-stepper-window-item
                    v-if="skipperChoice === 'devis'"
                    :value="3 "
                  >
                    <DevisUserInfoForm
                      v-model="userInfo"
                      :page="page.third_step"
                    />
                  </v-stepper-window-item>
                </v-stepper-window>
                <v-card-actions>
                  <v-stepper-actions
                    next-text="Suivant"
                    :prev-text="currentStep !== 0 ?'Précédent' : ''"
                    @click:next="nextStep()"
                    @click:prev="previousStep()"
                  >
                    <template #next>
                      <div>
                        <v-btn
                          v-if="displaySubmit"
                          color="secondary"
                          :disabled="!validateInfos"
                          :loading="isLoading"
                          @click="submit"
                        >
                          {{ skipperChoice === 'devis' ? 'Envoyer ma demande de devis' : 'Prendre rendez-vous' }}
                        </v-btn>
                        <v-btn
                          v-else-if="!showCalendly"
                          color="secondary"
                          @click="nextStep"
                        >
                          Suivant
                        </v-btn>
                      </div>
                    </template>
                  </v-stepper-actions>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </FunnelStepsStepperHeader>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useImage } from '#imports'

const config = useRuntimeConfig()
const img = useImage()
const route = useRoute()
const router = useRouter()
const skipperChoice = ref('devis')
const currentStep = ref(1)
const details = ref({
  departureDate: '',
  returnDate: '',
  nbAdults: route.query.nbAdults,
  nbChildren: route.query.nbChildren,
  includeFlight: false,
  departureAirport: '',
})
const isLoading = ref(false)

const showCalendly = ref(false)

const userInfo = ref({
  firstname: '',
  lastname: '',
  email: '',
  phone: '',
  acceptTerms: false,
  subscribeToNewsletter: false,
  departureAirport: '',
})

const validateInfos = computed(() => {
  console.log('userInfo', userInfo.value)
  return userInfo.value.firstname && userInfo.value.lastname && userInfo.value.email && userInfo.value.phone && userInfo.value.acceptTerms
})

const voyage = await queryCollection('voyages').where('slug', '=', route.query.slug).first()
console.log('voyage', voyage)
const destination = await queryCollection('destinations').where('slug', '=', voyage.destinations[0].slug).first()
console.log('destination', destination)
const { data: page, status: pageStatus } = await useFetch('/api/v1/pages/' + route.name)
console.log('page', page)

const nextStep = () => {
  currentStep.value++
}
const previousStep = () => {
  currentStep.value--
  if (showCalendly.value) {
    showCalendly.value = false
    currentStep.value = 2
  }
}
const displaySubmit = computed(() => {
  return !showCalendly.value && ((skipperChoice.value === 'devis' && currentStep.value === 3) || (skipperChoice.value === 'call' && currentStep.value === 2))
})
const submit = async () => {
  isLoading.value = true
  const voyageBody = {
    value: voyage.pricing.startingPrice * 100,
    title: voyage.title,
    currency: 'eur',
    group: '1',
    owner: '1',
    stage: config.public.environment === 'development' ? '48' : '2',
    // CustomFields
    specialRequest: details.value.comment + (details.value.includeFlight ? `- Aéroport de départ : ${details.value.departureAirport}` : ''),
    departureDate: details.value.departureDate.length > 0 ? details.value.departureDate : '',
    returnDate: details.value.returnDate.length > 0 ? details.value.returnDate : '',
    travelType: voyage.travelType || 'Individuel',
    nbTravelers: +details.value.nbAdults + +details.value.nbChildren,
    nbChildren: +details.value.nbChildren,
    nbAdults: +details.value.nbAdults,
    nbTeen: 0,
    nbUnderAge: +details.value.nbChildren,
    country: destination.titre,
    iso: destination.iso,
    zoneChapka: +destination.chapka,
    image: voyage.image.src || 'https://cdn.buttercms.com/gzdJu2fbQDi9Pl3h80Jn',
    currentStep: skipperChoice.value === 'devis' ? 'Souhaite réserver/planifier un voyage individuel' : 'Souhaite des infos',
    alreadyPaid: 0,
    restToPay: 0,
    utm: route.query.utm || '',
    slug: voyage.slug,
    basePricePerTraveler: voyage.pricing.startingPrice * 100,
    flightTickets: details.value.includeFlight ? 'Oui' : 'Non',
    depositPrice: voyage.pricing.startingPrice * 100 * 0.3,
    maxChildrenAge: voyage.pricing.childrenAge || 12,
    promoChildren: voyage.pricing.childrenPromo || 0,
    // maxTeenAge: voyage.maxTeenAge || 18,
    source: 'Demande d\'infos',
    // Contacts
    email: userInfo.value.email,
    phone: userInfo.value.phone,
    firstname: userInfo.value.firstname,
    lastname: userInfo.value.lastname,
  }
  console.log('voyageBody', voyageBody)
  await apiRequest('/ac/deals', 'post', voyageBody)
  if (skipperChoice.value === 'devis') {
    trackPixel('track', 'Lead')
    router.push('/confirmation?voyage=' + voyage.slug + '&devis=true')
  }
  else if (skipperChoice.value === 'call') {
    trackPixel('trackCustom', 'CalendlyRDV')
    showCalendly.value = true
  }
  isLoading.value = false
}
</script>

<style scoped>
.relative {
  position: relative;
}
.absolute {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
@media screen and (min-width: 768px) {
  .border-width {
    border-radius: 30px!important;
    height: fit-content!important;
  }
  .funnel-stepper{
    min-height: 50vh!important;
    padding: 2em;

  }

}
@media screen and (max-width: 768px) {
  .no-margin-window .v-stepper-window {
  margin-left:0!important;
  margin-right:0!important;
  }
}
</style>
