<template>
  <v-container
    fluid
    class="mt-10 relative"
  >
    <ClientOnly>
      <v-row justify="center">
        <v-col
          v-if="pageStatus === 'success' && voyage"
          cols="12"
        >
          <FunnelStepsStepperHeader
            ref="stepperHeaderRef"
            v-model="currentStep"
            :page="pageTexts"
            :skipper-mode="skipperChoice"
          >
            <v-row class="funnel-stepper d-flex justify-center">
              <v-col
                cols="12"
                class="d-flex justify-center"
              >
                <v-card
                  class="border-width relative w-md-75 w-lg-50 no-margin-window "
                >
                  <FunnelCardHeader
                    :titre="voyage.title"
                    :travel-type="'Individuel'"
                    :image="voyage.image?.asset?._ref || '/images/default/Odysway-couverture-mongolie.jpeg'"
                    :date="null"
                    :current-step="1"
                    :step-definitions="stepperHeaderRef?.stepDefinitions"
                    :skipper-mode="skipperChoice"
                  />

                  <v-stepper-window :model-value="currentStep">
                    <v-stepper-window-item :value="1">
                      <DevisSkipper
                        v-model="skipperChoice"
                        :page="pageTexts"
                        :voyage="voyage"
                      />
                    </v-stepper-window-item>
                    <v-stepper-window-item :value="2">
                      <DevisDetails
                        v-if="skipperChoice === 'devis'"
                        v-model="details"
                        :page="pageTexts"
                      />
                      <!-- <DevisUserInfoForm
                      v-if="skipperChoice === 'call' && !showCalendly"
                      v-model="userInfo"
                      :page="pageTexts"
                    /> -->
                      <CalendlyContainer
                        v-if="skipperChoice === 'call'"
                        :travel-title="voyage.title"
                        :text="pageTexts.calendly.text"
                        :is-funnel="true"
                        :voyage="voyage"
                        funnel-type="devis"
                      />
                      <FunnelTallyForm
                        v-if="skipperChoice === 'tally'"
                        :voyage="voyage"
                      />
                    </v-stepper-window-item>
                    <v-stepper-window-item
                      v-if="skipperChoice === 'devis'"
                      :value="3"
                    >
                      <DevisUserInfoForm
                        v-model="userInfo"
                        :page="pageTexts"
                        @submit="submit"
                      />
                    </v-stepper-window-item>
                  </v-stepper-window>
                  <v-card-actions :class="currentStep === 1 ? 'd-flex justify-center' : ''">
                    <v-stepper-actions
                      :next-text="pageTexts.buttons.next"
                      :prev-text="currentStep !== 0 ? pageTexts.buttons.previous : ''"
                      @click:next="nextStep()"
                      @click:prev="previousStep()"
                    >
                      <template #next>
                        <div>
                          <v-btn
                            v-if="currentStep === 2 && skipperChoice === 'devis'"
                            color="secondary"
                            :disabled="!validateRequiredInfosOnStep2"
                            @click="nextStep"
                          >
                            {{ pageTexts.buttons.next }}
                          </v-btn>
                          <v-btn
                            v-else-if="currentStep === 1"
                            color="secondary"
                            @click="nextStep"
                          >
                            {{ pageTexts.buttons.next }}
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
    </ClientOnly>
  </v-container>
</template>

<script setup>
const { trackDevisStep } = useGtmTracking()
const { formatVoyageForGtm } = useGtmVoyageFormatter()

useSeo({
  seoData: {
    robotsIndex: false,
    robotsFollow: false,
  },
})
const route = useRoute()
const router = useRouter()
const skipperChoice = ref('devis')
const currentStep = ref(1)
const details = ref({
  includeDates: false,
  departureDate: '',
  returnDate: '',
  nbAdults: route.query.nbAdults || 1,
  nbChildren: route.query.nbChildren || 0,
  includeFlight: false,
  departureAirport: null,
})

const showCalendly = ref(false)

const userInfo = ref({
  firstname: '',
  lastname: '',
  email: '',
  phone: '',
  validatePhone: false,
  acceptTerms: false,
  subscribeToNewsletter: false,
  departureAirport: '',
  loading: false,
})
const stepperHeaderRef = useTemplateRef('stepperHeaderRef')

const sanity = useSanity()

const voyageQuery = groq`*[_type == "voyage" && slug.current == $slug][0]{
  title,
  "slug": slug.current,
  image,
  travelType,
  pricing,
  destinations[]-> {
    _id,
    title,
    iso,
    chapka
  }
}`

const { data: voyage } = await useAsyncData(`voyages-${route.query.slug}`, () =>
  sanity.fetch(voyageQuery, { slug: route.query.slug }),
)

const destinations = computed(() => voyage.value?.destinations || [])

const devisQuery = groq`*[_type == "devis"][0]{
  fil_dariane_devis,
  first_step,
  second_step,
  third_step,
  calendly,
  buttons,
  form_labels,
  options
}`

const { data: pageTexts, status: pageStatus } = await useAsyncData('devis-texts', () =>
  sanity.fetch(devisQuery),
)

// GTM: Track devis_step0 on page load (CSV line 950)
// Note: We start by tracking 'classic' type since user hasn't chosen yet
// Individual flows (classic/rdv/surmesure) will track their step1 when choice is made
onMounted(() => {
  if (voyage.value) {
    const formattedVoyage = formatVoyageForGtm(voyage.value)
    // Track generic devis entry - the CSV doesn't differentiate types at step0
    trackDevisStep('classic', 0, formattedVoyage)
  }
})

const nextStep = () => {
  // GTM: Track devis_classic_step2 when moving from details to user info
  if (currentStep.value === 2 && skipperChoice.value === 'devis' && voyage.value) {
    const formattedVoyage = formatVoyageForGtm(voyage.value)
    const userData = {
      travelers_count: +details.value.nbAdults + +details.value.nbChildren,
      include_dates: details.value.includeDates,
      include_flight: details.value.includeFlight,
    }
    trackDevisStep('classic', 2, formattedVoyage, userData)
  }

  currentStep.value++
}
const validateRequiredInfosOnStep2 = computed(() => {
  if (details.value.includeFlight && !details.value.departureAirport) {
    return false
  }
  else if (details.value.includeDates && (!details.value.departureDate || !details.value.returnDate)) {
    return false
  }
  return true
})
const previousStep = () => {
  currentStep.value--
  if (showCalendly.value) {
    showCalendly.value = false
    currentStep.value = 2
  }
}

const submit = async () => {
  userInfo.value.loading = true
  const stage = (userInfo.value.email === 'test@test.com' || userInfo.value.email === 'ottmann.alex@gmail.com') ? '75' : '2'
  const utmSource = localStorage.getItem('utmSource')
  const voyageBody = {
    value: voyage.value.pricing.startingPrice * 100,
    title: voyage.value.title,
    currency: 'eur',
    group: '1',
    owner: '1',
    stage: stage,
    // CustomFields
    specialRequest: details.value.comment + (details.value.includeFlight ? `- Aéroport de départ : ${details.value.departureAirport}` : ''),
    departureDate: details.value.departureDate.length > 0 ? details.value.departureDate : '',
    returnDate: details.value.returnDate.length > 0 ? details.value.returnDate : '',
    travelType: voyage.value.travelType || 'Individuel',
    nbTravelers: +details.value.nbAdults + +details.value.nbChildren,
    nbChildren: +details.value.nbChildren,
    nbAdults: +details.value.nbAdults,
    nbTeen: 0,
    nbUnderAge: +details.value.nbChildren,
    country: destinations.value.map(d => d.iso).join(','),
    iso: destinations.value.map(d => d.iso).join(','),
    zoneChapka: +destinations.value[0]?.chapka || 0,
    image: getImageUrl(voyage.value?.image?.asset?._ref) || '/images/default/Odysway-couverture-mongolie.jpeg',
    currentStep: skipperChoice.value === 'devis' ? 'Souhaite réserver/planifier un voyage individuel' : 'Souhaite des infos',
    alreadyPaid: 0,
    restToPay: 0,
    utm: utmSource || '',
    slug: voyage.value.slug,
    basePricePerTraveler: voyage.value.pricing.startingPrice * 100,
    includeFlight: details.value.includeFlight ? 'Oui' : 'Non',
    depositPrice: voyage.value.pricing.startingPrice * 100 * 0.3,
    maxChildrenAge: voyage.value.pricing.childrenAge || 12,
    promoChildren: voyage.value.pricing.childrenPromo || 0,
    // maxTeenAge: voyage.maxTeenAge || 18,
    source: 'Demande d\'infos',
    // Contacts
    email: userInfo.value.email,
    phone: userInfo.value.phone,
    firstname: userInfo.value.firstname,
    lastname: userInfo.value.lastname,
  }
  await apiRequest('/ac/deals', 'post', voyageBody)
  if (skipperChoice.value === 'devis') {
    trackPixel('track', 'Lead')

    // GTM: Track devis_classic_confirmation
    const { getCountryFromPhone } = useGtmTracking()
    const formattedVoyage = formatVoyageForGtm(voyage.value)
    const additionalData = {
      optin_newsletter: userInfo.value.subscribeToNewsletter,
      user_data: {
        email: userInfo.value.email,
        phone: userInfo.value.phone,
        user_country: getCountryFromPhone(userInfo.value.phone),
      },
    }
    trackDevisStep('classic', 'confirmation', formattedVoyage, additionalData)

    router.push('/confirmation?voyage=' + voyage.value.slug + '&devis=true')
  }
  else if (skipperChoice.value === 'call') {
    trackPixel('trackCustom', 'ClickRDV', {
      voyage: voyage.value.title,
    })
    showCalendly.value = true
  }
  userInfo.value.loading = false
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
.no-margin-window{
  max-width: 1440px;
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
