<template>
  <v-col
    v-if="pageStatus === 'success' && voyageStatus === 'success'"
    cols="12"
  >
    <FunnelStepsStepperHeader
      v-model="currentStep"
      :page="pageTexts"
      :skipper-mode="skipperMode"
      :show-insurance="!!showInsuranceStep"
    >
      <v-row class="funnel-stepper d-flex justify-center">
        <v-col
          cols="12"
          :md="currentStep > 0 ? 7 : 12"
          class="d-flex justify-center"
        >
          <v-card
            class="border-width relative no-margin-window mb-4"
            :elevation=" skipperMode !== 'summary' && currentStep < 5 ? 2 : 0"
          >
            <Transition name="fade">
              <v-img
                v-if=" skipperMode !== 'summary' && voyage.imgSrc && currentStep === 0"
                color="surface-variant"
                height="100"
                :src="voyage.imgSrc"
                cover
              />
            </Transition>

            <FunnelCardHeader
              :titre="voyage.title"
              :travel-type="voyage.travelType"
              :image="voyage.imgSrc"
              :date="`Du ${dayjs(voyage.departureDate).format('DD/MM/YYYY')} au ${dayjs(voyage.returnDate).format('DD/MM/YYYY')}`"
              :current-step="currentStep"
            />

            <v-stepper-window
              :class="currentStep === 5 ? 'mt-0 mx-0' : ''"
              :model-value="currentStep"
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
                <FunnelSteps2Details
                  v-if="skipperMode === 'normal'"
                  v-model="dynamicDealValues"
                  :checkout-type="checkoutType"
                  :current-step="currentStep"
                  :voyage="voyage"
                  :own-step="1"
                  :page="pageTexts"
                  @next="nextStep"
                  @previous="previousStep"
                />
                <!-- <CalendlyContainer
                  v-else
                  :travel-title="voyage.title"
                  :text="pageTexts.calendly"
                /> -->
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
                <!-- <FunnelStepsSummary
                  v-model="dynamicDealValues"
                  :current-step="currentStep"
                  :page="pageTexts"
                  :voyage="voyage"
                  :own-step="5"
                /> -->

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
          v-if="currentStep > 0"
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
        v-if="currentStep !== 0"
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
const { step, date_id, booked_id } = route.query
const summaryRef = useTemplateRef('summaryRef')
const totalValueFromSummary = computed(() => {
  console.log('totalValueFromSummary', summaryRef.value?.totalValueFromSummary)
  return summaryRef.value?.totalValueFromSummary || 0
})
console.log('totalValueFromSummary', totalValueFromSummary.value)
const insurancesPrice = ref(null)

const pricePerTraveler = ref(0)
function updatePricePerTraveler(price) {
  pricePerTraveler.value = price
}
provide('pricePerTraveler', { pricePerTraveler, updatePricePerTraveler })

// ================== Page Texts ==================
const { data: pageTexts, status: pageStatus } = await useAsyncData('checkout-texts', () =>
  queryCollection('checkout').first(),
)
const checkoutType = ref(null)
// We use those 2 ref to compare if we need a loading between steps by comparing the values
const dynamicDealValues = ref(null)
const initialDealValues = ref(null)

// ================== Voyage ==================
const { data: voyage, status: voyageStatus, error: voyageError } = useAsyncData(`voyage-${step}`, async () => {
  if (date_id) {
    console.log('date_id', date_id)

    // We fetch the date details from BMS, the price and dates
    const fetchedDate = await apiRequest(`/booking/date/${date_id}`)
    console.log('fetchedDate from BMS', fetchedDate)

    // We fetch the travel details from Nuxt, we always need to have one
    const travel = await queryCollection('voyages').where('slug', '=', fetchedDate.travel_slug).first()
    console.log('travel', travel)

    // We fetch the destinations details from Nuxt, used for insurance
    const destinations = await queryCollection('destinations').where('titre', 'IN', travel.destinations.map(d => d.name)).select('iso', 'chapka', 'titre').all()
    console.log('destinations', destinations)

    if (!travel) {
      throw new Error('Travel not found.')
    }
    console.log('TRAVEL QUERY', travel)

    updatePricePerTraveler(fetchedDate.starting_price)
    checkoutType.value = determinePaymentOptions(fetchedDate.departure_date, route.query)
    const travelStaticValues = {
      departureDate: fetchedDate.departure_date,
      returnDate: fetchedDate.return_date,
      title: travel.title,
      imgSrc: travel.image.src,
      country: destinations.map(d => d.iso).join(','),
      slug: travel.slug,
      iso: destinations.map(d => d.iso).join(','),
      zoneChapka: +destinations[0]?.chapka || 0,
      privatisation: travel.privatisationAvailable,
      startingPrice: fetchedDate.starting_price * 100,
      indivRoomPrice: travel.pricing.indivRoomPrice * 100,
      gotIndivRoomAvailable: travel.pricing.indivRoom,
      gotEarlybird: fetchedDate.early_bird && dayjs(fetchedDate.departure_date).isAfter(dayjs().add(7, 'month')) ? 'Oui' : 'Non',
      promoEarlybird: travel.pricing.earlyBirdReduction * 100,
      gotLastMinute: fetchedDate.last_minute && dayjs(fetchedDate.departure_date).isBefore(dayjs().add(1, 'month')) ? 'Oui' : 'Non',
      promoLastMinute: travel.pricing.lastMinuteReduction * 100,
      depositPrice: fetchedDate.startingPrice * 0.3 || 500,
      promoChildren: travel.pricing.childrenPromo * 100,
      maxChildrenAge: travel.pricing.childrenAge,
      source: 'Devis',
      forcedIndivRoom: travel.pricing.forcedIndivRoom,
      travelType: 'Groupe', // TODO: check comment le rendre dynamique
      alreadyPaid: 0,
      totalTravelPrice: fetchedDate.startingPrice * 100,
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
      firstname: '',
      lastname: '',
      optinNewsletter: false,

      // Travelers Infos
      isCouple: false,
      // Options
      specialRequest: '',
      indivRoom: false,
      // Insurances
      insurance: [],
      insuranceCommissionPrice: 0,
      insuranceCommissionPerTraveler: 0,
    }

    initialDealValues.value = {
      ...travelStaticValues,
      ...dynamicValues,
    }
    dynamicDealValues.value = initialDealValues.value
    console.log('dynamicDealValues', dynamicDealValues.value)
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
      nbAdults: +deal.nbAdults,
      nbChildren: +deal.nbChildren,
      nbUnderAge: +deal.nbUnderAge,
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
      insuranceCommissionPrice: deal.insuranceCommissionPrice,
      insuranceCommissionPerTraveler: deal.insuranceCommissionPerTraveler,
    }
    initialDealValues.value = {
      ...dynamicValues,
    }
    dynamicDealValues.value = dynamicValues
    console.log('dynamicDealValues', dynamicDealValues.value)
    checkoutType.value = determinePaymentOptions(deal.departureDate, route.query)
    updatePricePerTraveler(deal.basePricePerTraveler)

    return {
      departureDate: deal.departureDate,
      returnDate: deal.returnDate,
      title: deal.title,
      imgSrc: deal.image || 'https://cdn.buttercms.com/gzdJu2fbQDi9Pl3h80Jn',
      country: deal.country,
      slug: deal.slug,
      iso: deal.iso,
      startingPrice: deal.basePricePerTraveler,
      zoneChapka: +deal.zoneChapka,
      depositPrice: deal.depositPrice, // #Todo faire sauter
      promoChildren: deal.promoChildren,
      maxChildrenAge: deal.maxChildrenAge || 12,
      source: 'Devis', // Possible que ça change
      forcedIndivRoom: deal.forcedIndivRoom === 'Oui',
      indivRoomPrice: deal.indivRoomPrice,
      gotIndivRoomAvailable: deal.indivRoomPrice > 0,
      promoEarlybird: deal.promoEarlybird,
      promoLastMinute: deal.promoLastMinute,
      gotLastMinute: deal.gotLastMinute === 'Oui',
      gotEarlybird: deal.gotEarlybid === 'Oui',
      travelType: deal.travelType,
      extensionPrice: deal.extensionPrice,
      flightPrice: deal.flightPrice,
      promoValue: deal.promoValue,
      alreadyPaid: deal.alreadyPaid,
      totalTravelPrice: deal.value,
    }
  }
})
console.log('voyage', voyage.value, voyageStatus.value, voyageError.value)

// ================== Stepper Management ==================
// const stepComponents = reactive(new Map())
const loading = ref(false)
const currentStep = ref(step ? parseInt(step) : 0)
const skipperMode = ref('normal')
if (route.query.type === 'custom' || route.query.type === 'balance') {
  currentStep.value = 5
  skipperMode.value = 'summary'
}

const nextStep = () => {
  // If we're on step 3 (Options) and insurance is not available, skip to summary
  if (currentStep.value === 3 && !showInsuranceStep.value) {
    currentStep.value = 5 // Skip to summary
  }
  else {
    currentStep.value++
  }
}
const previousStep = () => {
  // If we're on summary step and insurance was skipped, go back to options
  if (currentStep.value === 5 && !showInsuranceStep.value) {
    currentStep.value = 3 // Go back to options
  }
  else {
    currentStep.value--
  }
}

const { calculatePricePerPerson } = usePricePerTraveler(dynamicDealValues, voyage)

const fetchInsuranceQuote = async () => {
  try {
    if (!voyage.value || !dynamicDealValues.value) {
      console.log('Missing voyage or dynamicDealValues for insurance quote')
      return
    }
    console.log('voyage.value!!!!', voyage.value)
    console.log('dynamicDealValues.value!!!!', dynamicDealValues.value)
    const pricePerTravelerWithoutInsurance = calculatePricePerPerson(dynamicDealValues.value, voyage.value)
    console.log('Fetching insurance with price per traveler:', pricePerTravelerWithoutInsurance)

    const insurance = await $fetch('/api/v1/chapka/quote', {
      method: 'POST',
      body: {
        pricePerTraveler: pricePerTravelerWithoutInsurance / 100,
        countries: voyage.value.iso,
        zoneChapka: +voyage.value.zoneChapka || 0,
        departureDate: voyage.value.departureDate,
        returnDate: voyage.value.returnDate,
        nbTravelers: +dynamicDealValues.value.nbAdults + +dynamicDealValues.value.nbChildren,
      },
    })
    console.log('FETCH INSURANCE QUOTE', insurance)
    insurancesPrice.value = insurance
  }
  catch (error) {
    console.error('Error fetching insurance quote:', error)
    insurancesPrice.value = null
  }
}

// Watch for changes in voyage and dynamicDealValues to fetch insurance
watch([voyage, dynamicDealValues], async ([newVoyage, newDynamicDealValues]) => {
  if (newVoyage && newDynamicDealValues && newDynamicDealValues.nbAdults !== undefined && newDynamicDealValues.nbChildren !== undefined) {
    await fetchInsuranceQuote()
  }
}, { deep: true, immediate: true })

// Specific watcher for nbAdults and nbChildren changes
watch(() => [dynamicDealValues.value?.nbAdults, dynamicDealValues.value?.nbChildren], async ([newNbAdults, newNbChildren], [oldNbAdults, oldNbChildren]) => {
  if (voyage.value && dynamicDealValues.value
    && (newNbAdults !== oldNbAdults || newNbChildren !== oldNbChildren)) {
    console.log('Number of travelers changed, refetching insurance...', { newNbAdults, newNbChildren, oldNbAdults, oldNbChildren })
    await fetchInsuranceQuote()
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
