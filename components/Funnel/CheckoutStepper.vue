<template>
  <v-col
    v-if="pageStatus === 'success' && voyageStatus === 'success'"
    cols="12"
  >
    <FunnelStepsStepperHeader
      ref="stepperHeaderRef"
      v-model="currentStep"
      :page="pageTexts"
      :skipper-mode="skipperMode"
      :show-insurance="!!showInsuranceStep"
    >
      <v-row class="funnel-stepper d-flex justify-center">
        <v-col
          cols="12"
          :md="currentStep > 0 ? 7 : 12"
          class="d-flex justify-center "
        >
          <v-card
            class="border-width relative no-margin-window mb-4 "
            :class="skipperMode !== 'summary' && currentStep == 1 ? 'w-100' : ''"
            :elevation="skipperMode !== 'summary' && currentStep < 5 ? 2 : 0"
          >
            <Transition name="fade">
              <v-img
                v-if=" skipperMode !== 'summary' && voyage.imgSrc && currentStep === 0"
                color="surface-variant"
                height="100"
                :src="voyage.imgSrc"
                :alt="`Paysage de destination pour le voyage ${voyage.title}`"
                cover
              />
            </Transition>

            <FunnelCardHeader
              :titre="voyage.title"
              :travel-type="voyage.travelType"
              :image="voyage.imgSrc"
              :date="`Du ${dayjs(voyage.departureDate).format('DD/MM/YYYY')} au ${dayjs(voyage.returnDate).format('DD/MM/YYYY')}`"
              :current-step="currentStep"
              :step-definitions="stepperHeaderRef?.stepDefinitions"
              :skipper-mode="skipperMode"
            />

            <v-stepper-window
              :class="currentStep === 5 ? ' mx-0' : ''"
              :model-value="currentStep"
              class="px-md-6 mt-4"
            >
              <v-stepper-window-item>
                <template v-if="skipperMode === 'summary'">
                  <FunnelStepsSummary
                    :current-step="currentStep"
                    :page="pageTexts"
                    :voyage="voyage"
                  />

                  <FunnelStepsPaymentRedirect
                    v-model="dynamicDealValues"
                    :page="pageTexts"
                    :current-step="currentStep"
                    :voyage="voyage"
                    :own-step="5"
                    @previous="previousStep"
                  />
                </template>
                <FunnelStepsSkipper
                  v-else
                  v-model="skipperMode"
                  :page="pageTexts"
                  :current-step="currentStep"
                  :own-step="0"
                  @next="nextStep"
                />
              </v-stepper-window-item>
              <v-stepper-window-item>
                <FunnelStepsDetails
                  v-if="skipperMode === 'normal'"
                  v-model="dynamicDealValues"
                  :checkout-type="checkoutType"
                  :voyage="voyage"
                  :date-id="date_id"
                  :own-step="1"
                  :page="pageTexts"
                  @next="nextStep"
                  @previous="previousStep"
                />
                <CalendlyContainer
                  v-else
                  :travel-title="voyage.title"
                  :is-funnel="true"
                  @previous="previousStep"
                />
              </v-stepper-window-item>
              <v-stepper-window-item>
                <FunnelStepsTravelersInfos
                  v-model="dynamicDealValues"
                  :current-step="currentStep"
                  :voyage="voyage"
                  :own-step="2"
                  :page="pageTexts"
                  @next="nextStep"
                  @previous="previousStep"
                />
              </v-stepper-window-item>

              <v-stepper-window-item>
                <FunnelStepsOptions
                  v-model="dynamicDealValues"
                  :voyage="voyage"
                  :current-step="currentStep"
                  :page="pageTexts"
                  :own-step="3"
                  @next="nextStep"
                  @previous="previousStep"
                />
              </v-stepper-window-item>
              <v-stepper-window-item v-if="!!showInsuranceStep">
                <FunnelStepsInsurances
                  v-model="dynamicDealValues"
                  :voyage="voyage"
                  :current-step="currentStep"
                  :insurances="insurancesPrice"
                  :page="pageTexts"
                  :own-step="4"
                  @next="nextStep"
                  @previous="previousStep"
                />
              </v-stepper-window-item>
              <v-stepper-window-item
                :value="5"
              >
                <FunnelStepsPaymentRedirect
                  v-model="dynamicDealValues"
                  :page="pageTexts"
                  :current-step="currentStep"
                  :voyage="voyage"
                  :own-step="5"
                  @previous="previousStep"
                />
              </v-stepper-window-item>
            </v-stepper-window>
          </v-card>
        </v-col>

        <v-col
          v-if="currentStep > 0 && (skipperMode === 'normal' || skipperMode === 'summary')"
          cols="12"
          :md="4"
          class="d-none d-md-block"
        >
          <FunnelStepsSummary
            v-model="dynamicDealValues"
            :current-step="currentStep"
            :page="pageTexts"
            :voyage="voyage"
            :own-step="5"
          />
        </v-col>
      </v-row>
      <FunnelStepsBottomSummaryBar
        v-if="currentStep !== 0 && (skipperMode === 'normal' || skipperMode === 'summary')"
        ref="summaryRef"
        :voyage="voyage"
        :page-texts="pageTexts"
        :dynamic-deal-values="dynamicDealValues"
        :current-step="currentStep"
      />
    </FunnelStepsStepperHeader>
  </v-col>
  <v-col
    v-else
    cols="12"
  >
    <v-skeleton-loader
      type="card"
    />
  </v-col>
</template>

<script setup>
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'

dayjs.extend(customParseFormat)

const route = useRoute()
// const router = useRouter()
const { step, date_id, booked_id } = route.query
const { addSingleParam } = useParams()
const stepperHeaderRef = useTemplateRef('stepperHeaderRef')

const insurancesPrice = ref(null)

// ================== Page Texts ==================
const { data: pageTexts, status: pageStatus } = await useAsyncData('checkout-texts', () =>
  queryCollection('checkout').first(),
)

const checkoutType = ref(null)
// We use those 2 ref to compare if we need a loading between steps by comparing the values
const dynamicDealValues = ref(null)

// ================== Voyage ==================
const { data: voyage, status: voyageStatus } = useAsyncData(`voyage-${step}`, async () => {
  if (date_id) {
    // We fetch the date details from BMS, the price and dates
    const fetchedDate = await apiRequest(`/booking/date/${date_id}`)
    // We fetch the travel details from Nuxt, we always need to have one
    const travel = await queryCollection('voyages').where('slug', '=', fetchedDate.travel_slug).first()
    // We fetch the destinations details from Nuxt, used for insurance
    const destinations = await queryCollection('destinations').where('title', 'IN', travel.destinations.map(d => d.name)).select('iso', 'chapka', 'title').all()

    if (!travel) {
      throw new Error('Travel not found.')
    }

    checkoutType.value = determinePaymentOptions(fetchedDate.departure_date, route.query)
    const travelStaticValues = {
      departureDate: fetchedDate.departure_date,
      returnDate: fetchedDate.return_date,
      title: travel.title,
      imgSrc: travel.image.src || '/images/sur-mesure/AdobeStock_557006728.webp',
      country: destinations.map(d => d.iso).join(','),
      slug: travel.slug,
      iso: destinations.map(d => d.iso).join(','),
      zoneChapka: +destinations[0]?.chapka || 0,
      privatisation: travel.privatisationAvailable,
      startingPrice: fetchedDate.starting_price * 100,
      indivRoomPrice: travel.pricing.indivRoom && travel.pricing.indivRoomPrice > 0 ? travel.pricing.indivRoomPrice * 100 : 0,
      gotIndivRoomAvailable: travel.pricing.indivRoom && travel.pricing.indivRoomPrice > 0,
      gotEarlybird: fetchedDate.early_bird && dayjs(fetchedDate.departure_date).isAfter(dayjs().add(7, 'month')),
      promoEarlybird: travel.pricing.earlyBirdReduction * 100 || 0,
      gotLastMinute: fetchedDate.last_minute && dayjs(fetchedDate.departure_date).isBefore(dayjs().add(1, 'month')),
      promoLastMinute: travel.pricing.lastMinuteReduction * 100 || 0,
      depositPrice: +fetchedDate.starting_price * 0.3,
      promoChildren: travel.pricing.childrenPromo * 100 || 0,
      maxChildrenAge: travel.pricing.childrenAge || 12,
      source: 'Devis',
      forcedIndivRoom: travel.pricing.forcedIndivRoom,
      travelType: 'Groupe', // TODO: check comment le rendre dynamique
      flightPrice: fetchedDate.flight_price * 100 || 0,
      includeFlight: fetchedDate.include_flight,
      extensionPrice: 0,
      promoValue: 0,
      alreadyPaid: 0,
      totalTravelPrice: +fetchedDate.starting_price * 100,
    }

    const dynamicValues = {
      // Details
      nbTravelers: 1,
      nbAdults: 1,
      nbChildren: 0,
      nbUnderAge: 0,
      nbTeen: 0,
      email: '',
      phone: '',
      firstName: '',
      lastName: '',
      optinNewsletter: false,

      // Travelers Infos
      isCouple: false,
      // Options
      specialRequest: '',
      indivRoom: false,
      // Insurances
      insurance: false,
      insuranceCommissionPrice: 0,
      insuranceCommissionPerTraveler: 0,
    }
    await fetchInsuranceQuote(travelStaticValues, dynamicValues)
    dynamicDealValues.value = dynamicValues
    loading.value = false
    return travelStaticValues
  }
  else {
    // Voyage = Toutes les valeurs fixes
    const deal = await apiRequest(`/ac/deals/deal-from-bms?bookedId=${booked_id}`)
    // Initialize travelers data
    const travelersData = {}
    const numberOfTravelers = +deal.nbTravelers || 1

    // Add travelers data for up to 11 travelers
    for (let i = 1; i <= 11; i++) {
      const travelerKey = `traveler${i}`
      if (deal[travelerKey]) {
        // Use existing traveler data from ActiveCampaign
        travelersData[travelerKey] = deal[travelerKey]
      }
      else if (i <= numberOfTravelers) {
        // Initialize empty traveler data for the expected number of travelers
        travelersData[travelerKey] = null
      }
    }

    const dynamicValues = {
      // Details
      nbTravelers: +deal.nbTravelers,
      nbAdults: +deal.nbAdults || 1,
      nbChildren: +deal.nbChildren || 0,
      nbUnderAge: +deal.nbUnderAge || 0,
      email: deal.contact.email,
      phone: deal.contact.phone,
      firstName: deal.contact.firstName,
      lastName: deal.contact.lastName,
      optinNewsletter: false,
      // Travelers Infos
      isCouple: deal.isCouple === 'Oui',
      ...travelersData,
      // Options
      specialRequest: deal.specialRequest,
      indivRoom: deal.indivRoom === 'Oui',
      // Insurances
      insurance: deal.insurance,
      insuranceCommissionPrice: deal.insuranceCommissionPrice || 0,
      insuranceCommissionPerTraveler: deal.insuranceCommissionPerTraveler || 0,
      alreadyPaid: deal.alreadyPaid,
    }

    dynamicDealValues.value = dynamicValues
    checkoutType.value = determinePaymentOptions(deal.departureDate, route.query)

    const voyageStaticValues = {
      departureDate: deal.departureDate,
      returnDate: deal.returnDate,
      title: deal.title,
      imgSrc: deal.image || '/images/default/Odysway-couverture-mongolie.jpeg',
      country: deal.country,
      slug: deal.slug,
      iso: deal.iso,
      startingPrice: deal.basePricePerTraveler,
      zoneChapka: +deal.zoneChapka,
      depositPrice: +deal.depositPrice, // #Todo faire sauter
      promoChildren: deal.promoChildren,
      maxChildrenAge: deal.maxChildrenAge || 12,
      source: 'Devis', // Possible que ça change
      forcedIndivRoom: deal.forcedIndivRoom === 'Oui',
      indivRoomPrice: deal.indivRoomPrice,
      gotIndivRoomAvailable: deal.indivRoomPrice > 0,
      promoEarlybird: deal.promoEarlybird || 0,
      promoLastMinute: deal.promoLastMinute || 0,
      gotLastMinute: deal.gotLastMinute === 'Oui',
      gotEarlybird: deal.gotEarlybid === 'Oui',
      travelType: deal.travelType,
      extensionPrice: deal.extensionPrice || 0,
      includeFlight: deal.includeFlight === 'Oui',
      flightPrice: deal.flightPrice || 0,
      promoValue: deal.promoValue || 0,
      alreadyPaid: deal.alreadyPaid || 0,
      totalTravelPrice: deal.value,
    }

    await fetchInsuranceQuote(voyageStaticValues, dynamicValues)
    return voyageStaticValues
  }
})
// ================== Stepper Management ==================
const loading = ref(false)
const currentStep = ref(step ? parseInt(step) : 0)
const skipperMode = ref('normal')
if (route.query.type === 'custom' || route.query.type === 'balance') {
  currentStep.value = route.query.type === 'custom' ? 1 : 5
  skipperMode.value = route.query.type === 'custom' ? 'normal' : 'summary'
}

const nextStep = () => {
  const nextStepValue = currentStep.value === 3 && !showInsuranceStep.value ? 5 : currentStep.value + 1

  currentStep.value = nextStepValue
  addSingleParam('step', nextStepValue.toString())

  // Check if we're going on calendly step to fire pixel:

  if (nextStepValue === 1 && skipperMode.value === 'quick') {
    trackPixel('trackCustom', 'ClicRdv', {
      voyage: voyage.value.title,
    })
  }
}

const previousStep = () => {
  let previousStepValue
  if (currentStep.value === 5 && !showInsuranceStep.value) {
    previousStepValue = 3 // Go back to options
  }
  else {
    previousStepValue = currentStep.value - 1
  }
  currentStep.value = previousStepValue

  addSingleParam('step', previousStepValue.toString())
}

watch(() => route.query.step, (newVal) => {
  if (newVal) {
    currentStep.value = parseInt(newVal)
  }
})

const { calculatePricePerPerson } = usePricePerTraveler(dynamicDealValues, voyage)

const fetchInsuranceQuote = async (voyage, dynamicDealValues) => {
  try {
    if (!voyage || !dynamicDealValues) {
      console.log('Missing voyage or dynamicDealValues for insurance quote')
      return
    }

    const pricePerTravelerWithoutInsurance = calculatePricePerPerson(dynamicDealValues, voyage)
    console.log('indivRoomPrice', voyage?.indivRoomPrice, dynamicDealValues.indivRoom)
    const indivRoomPrice = dynamicDealValues.indivRoom ? voyage?.indivRoomPrice : 0
    const insurance = await $fetch('/api/v1/chapka/quote', {
      method: 'POST',
      body: {
        pricePerTraveler: (pricePerTravelerWithoutInsurance + indivRoomPrice) / 100,
        countries: voyage.iso,
        zoneChapka: +voyage.zoneChapka || 0,
        departureDate: voyage.departureDate,
        returnDate: voyage.returnDate,
        nbTravelers: +dynamicDealValues.nbAdults + +dynamicDealValues.nbChildren,
      },
    })
    insurancesPrice.value = insurance
  }
  catch (error) {
    console.error('Error fetching insurance quote:', error)
    insurancesPrice.value = null
  }
}

// Specific watcher for nbAdults, nbChildren, and indivRoom changes
watch(() => [dynamicDealValues.value?.nbAdults, dynamicDealValues.value?.nbChildren, dynamicDealValues.value?.indivRoom], async ([newNbAdults, newNbChildren, newIndivRoom], [oldNbAdults, oldNbChildren, oldIndivRoom]) => {
  if (voyage.value && dynamicDealValues.value
    && (newNbAdults !== oldNbAdults || newNbChildren !== oldNbChildren || newIndivRoom !== oldIndivRoom)) {
    await fetchInsuranceQuote(voyage.value, dynamicDealValues.value)
  }
}, { deep: true })

// Computed property to determine if insurance step should be shown
const showInsuranceStep = computed(() => {
  return insurancesPrice.value
    && (insurancesPrice.value.rapatriement || insurancesPrice.value.cancel)
})
</script>

<style scoped>
@media screen and (min-width: 768px) {
  .border-width {
    border-radius: 30px!important;
    height: fit-content!important;
  }
  .funnel-stepper{
    min-height: 50vh!important;
    width:100%;
  }
  .no-margin-window {
    max-width: 1440px;
  }
  .no-margin-window .v-stepper-window {
  margin-left:0!important;
  margin-right:0!important;
  }
}
.fade-enter-active {
  transition: all 0.3s ease-out;
}

.fade-enter-from {
  transform: translateY(-40px);
}

.fade-leave-active {
  position: absolute;
}
.bg-img-filter{
  filter: brightness(0.5);
}
</style>
