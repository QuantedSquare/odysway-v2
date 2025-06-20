<template>
  <v-col
    v-if="pageStatus === 'success' && voyageStatus === 'success'"
    cols="12"
  >
    <FunnelStepsStepperHeader
      v-model="currentStep"
      :page="page"
      :skipper-mode="skipperMode"
    >
      <v-row class="funnel-stepper d-flex justify-center">
        <v-col
          cols="12"
          class="d-flex justify-center"
        >
          <v-card
            class="border-width relative  w-md-75 w-lg-50 w-xl-33 no-margin-window"
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
              v-if=" currentStep !== 0 && currentStep < 5 "
              :titre="voyage.title"
              :travel-type="voyage.travelType"
              :image="voyage.imgSrc"
              :date="`Du ${dayjs(voyage.departureDate).format('DD/MM/YYYY')} au ${dayjs(voyage.returnDate).format('DD/MM/YYYY')}`"
              :price="voyage.startingPrice"
            />

            <v-stepper-window
              :class="currentStep === 5 ? 'mt-0 mx-0' : ''"
              :model-value="currentStep"
            >
              <v-stepper-window-item>
                <template v-if="skipperMode === 'summary'">
                  <FunnelStepsSummary
                    :current-step="currentStep"
                    :page="page"
                    :voyage="voyage"
                  />

                  <FunnelStepsPaymentRedirect
                    :ref="(component) => registerStepComponent(component, 5)"
                    :page="page"
                    :current-step="currentStep"
                    :own-step="5"
                    :voyage="voyage"
                    @validity-changed="onStepValidityChanged"
                  />
                </template>
                <FunnelStepsSkipper
                  v-else
                  v-model="skipperMode"
                  :page="page"
                />
              </v-stepper-window-item>
              <v-stepper-window-item>
                <FunnelStepsDetails
                  v-if="skipperMode === 'normal'"
                  :ref="(component) => registerStepComponent(component, 1)"
                  :current-step="currentStep"
                  :voyage="voyage"
                  :own-step="1"
                  @validity-changed="onStepValidityChanged"
                />
                <CalendlyContainer
                  v-else
                  :travel-title="voyage.title"
                  :text="page.calendly"
                />
              </v-stepper-window-item>
              <v-stepper-window-item>
                <FunnelStepsTravelersInfos
                  :ref="(component) => registerStepComponent(component, 2)"
                  :current-step="currentStep"
                  :page="page"
                  :own-step="2"
                  @validity-changed="onStepValidityChanged"
                />
              </v-stepper-window-item>
              <v-stepper-window-item>
                <FunnelStepsOptions
                  :ref="(component) => registerStepComponent(component, 3)"
                  :voyage="voyage"
                  :current-step="currentStep"
                  :page="page"
                  :own-step="3"
                  @validity-changed="onStepValidityChanged"
                />
              </v-stepper-window-item>
              <v-stepper-window-item>
                <FunnelStepsInsurances
                  :ref="(component) => registerStepComponent(component, 4)"
                  :current-step="currentStep"
                  :page="page"
                  :own-step="4"
                  @skip-step="nextStep"
                  @validity-changed="onStepValidityChanged"
                />
              </v-stepper-window-item>
              <v-stepper-window-item
                :value="5"
              >
                <FunnelStepsSummary
                  :current-step="currentStep"
                  :page="page"
                  :voyage="voyage"
                  :own-step="5"
                />

                <FunnelStepsPaymentRedirect
                  :ref="(component) => registerStepComponent(component, 5)"
                  :page="page"
                  :current-step="currentStep"
                  :own-step="5"
                  :voyage="voyage"
                  @validity-changed="onStepValidityChanged"
                />
              </v-stepper-window-item>
            </v-stepper-window>

            <v-card-actions>
              <v-stepper-actions
                next-text="Suivant"
                :prev-text="skipperMode !== 'summary' ?'Précédent' : ''"
                @click:next="nextStep()"
                @click:prev="previousStep()"
              >
                <template #next>
                  <div>
                    <v-btn
                      v-if="showNextButton"
                      :disabled="!enablingNextButton"
                      color="secondary"
                      :loading="loading"
                      @click="nextStep"
                    >
                      Suivant
                    </v-btn>
                    <div
                      v-if="currentStep === 5"
                      id="next-btn"
                    />
                  </div>
                </template>
                <template #prev>
                  <v-btn
                    v-if="skipperMode !== 'summary'"
                    :disabled="isPreviousButtonDisabled"
                    @click="previousStep"
                  >
                    Précédent
                  </v-btn>
                </template>
              </v-stepper-actions>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
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
const { step, date_id, booked_id, type } = route.query

const pricePerTraveler = ref(0)
function updatePricePerTraveler(price) {
  pricePerTraveler.value = price
}
provide('pricePerTraveler', { pricePerTraveler, updatePricePerTraveler })
// ================== Page ==================
const { data: page, status: pageStatus } = await useFetch('/api/v1/pages/' + route.name)
// console.log('page', page.value)

const date = ref(null)

const fetchDetails = async () => {
  // Fetch travel_date details
  const res = await apiRequest(`/booking/date/${date_id}`)
  date.value = res
  console.log('=======form RETRIEVED=======', date.value)
  return date.value
}

// ================== Voyage ==================
const { data: voyage, status: voyageStatus, error: voyageError } = useAsyncData(`voyage-${step}`, async () => {
  if (date_id) {
    console.log('date_id', date_id)
    const fetchedDate = await fetchDetails()
    const travel = await queryCollection('voyages').where('slug', '=', fetchedDate.travel_slug).first()
    console.log('travel', travel)
    const destinations = await queryCollection('destinations').where('titre', 'IN', travel.destinations.map(d => d.name)).select('iso', 'chapka', 'titre').all()
    console.log('destinations', destinations)
    if (!travel) {
      throw new Error('Travel not found.')
    }
    console.log('TRAVEL QUERY', travel)

    updatePricePerTraveler(fetchedDate.starting_price)

    const deal = {
      departureDate: fetchedDate.departure_date,
      returnDate: fetchedDate.return_date,
      title: travel.title,
      imgSrc: travel.image.src,
      country: destinations.map(d => d.iso).join(','),
      slug: travel.slug,
      iso: destinations.map(d => d.iso).join(','),
      zoneChapka: +destinations[0]?.chapka || 0,
      indivRoom: travel.pricing.indivRoom,
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
    }
    console.log('!!!!!deal post assign!!!', deal)
    loading.value = false
    return deal
  }
  else {
    console.log('booked_id', booked_id)
    const { deal_id } = await apiRequest(`/booking/booked_date/${booked_id}`)
    // Voyage = Toutes les valeurs fixes
    console.log('fetched deal_id', deal_id)
    const deal = await apiRequest(`/ac/deals/${deal_id}`)
    console.log('deal', deal)

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
      promoChildren: deal.promoChildren / 100,
      // promoTeen: deal.promoTeen / 100,
      maxChildrenAge: deal.maxChildrenAge || 12,
      // maxTeenAge: 18,
      source: 'Devis', // Possible que ça change
      forcedIndivRoom: deal.forcedIndivRoom,
      indivRoomPrice: deal.indivRoomPrice,
      promoEarlybird: deal.promoEarlybird / 100,
      promoLastMinute: deal.promoLastMinute / 100,
      gotLastMinute: deal.gotLastMinute === 'Oui',
      gotEarlybird: deal.gotEarlybid === 'Oui',
      gotIndivRoomAvailable: deal.indivRoom === 'Oui',
      travelType: deal.travelType,
      // {... COMPLETER}
    }
  }
})
console.log('voyage', voyageStatus.value, voyageError.value)

// ================== Stepper Management ==================
const stepComponents = reactive(new Map())
const loading = ref(false)
const currentStep = ref(step ? parseInt(step) : 0)
const skipperMode = ref('normal')
if (route.query.type === 'custom' || route.query.type === 'balance') {
  currentStep.value = 5
  skipperMode.value = 'summary'
}

// New: Per-step validation state
const stepValidation = reactive(new Map())

const enablingNextButton = computed(() => {
  console.log('currentStep', currentStep.value, 'stepValidation', stepValidation.get(currentStep.value))
  return currentStep.value === 0 || stepValidation.get(currentStep.value) === true
})

const registerStepComponent = (component, step) => {
  stepComponents.set(step, component)
}

// New: Handle step validity changes
const onStepValidityChanged = (stepIndex, isValid) => {
  stepValidation.set(stepIndex, isValid)
  console.log('Step validity changed:', stepIndex, isValid, 'All steps:', Object.fromEntries(stepValidation))
}

const nextStep = async () => {
  const currentComponent = stepComponents.get(currentStep.value)

  if (currentComponent && currentComponent.submitStepData) {
    loading.value = true
    const isValid = await currentComponent.submitStepData()
    if (isValid) {
      currentStep.value++
      loading.value = false
    }
  }
  else {
    currentStep.value++
  }
  console.log('currentStep', currentStep.value, skipperMode.value)
}
const previousStep = () => {
  currentStep.value--
}
const showNextButton = computed(() => {
  return (skipperMode.value === 'normal' && currentStep.value < 5) || (skipperMode.value === 'quick' && currentStep.value !== 1)
})

const isPreviousButtonDisabled = computed(() => {
  return currentStep.value === 0 || skipperMode.value === 'summary'
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
