<template>
  <v-col
    v-if="pageTexts && voyage"
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
              :date="displayedDates"
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
const { voyage, initialDealValues } = defineProps({
  pageTexts: {
    type: Object,
    required: true,
  },
  voyage: {
    type: Object,
    required: true,
  },
  initialDealValues: {
    type: Object,
    required: true,
  },
})
console.log('initialDealValues', initialDealValues)
console.log('voyage in stepper', voyage)

const route = useRoute()

const { step, date_id } = route.query
const { addSingleParam } = useParams()

const stepperHeaderRef = useTemplateRef('stepperHeaderRef')

const insurancesPrice = ref(null)

// We use those 2 ref to compare if we need a loading between steps by comparing the values
const dynamicDealValues = ref(initialDealValues)
console.log('dynamicDealValues', dynamicDealValues.value)
const checkoutType = ref(determinePaymentOptions(voyage.departureDate, route.query))
console.log('checkoutType', checkoutType.value)
// ================== Voyage ==================

const displayedDates = computed(() => {
  const dates = `Du ${dayjs(voyage.departureDate).format('DD/MM/YYYY')} au ${dayjs(voyage.returnDate).format('DD/MM/YYYY')}`
  console.log('displayedDates', dates)
  return dates
})
// ================== Stepper Management ==================
// const loading = ref(false)
const currentStep = ref(step ? parseInt(step) : 0)
const skipperMode = ref('normal')
if (route.query.type === 'custom' || route.query.type === 'balance') {
  currentStep.value = route.query.type === 'custom' ? 1 : 5
  skipperMode.value = route.query.type === 'custom' ? 'normal' : 'summary'
}

// 🧱 Step navigation
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

// 💰 Insurance fetching logic
const { calculatePricePerPerson } = usePricePerTraveler(dynamicDealValues, voyage)

const fetchInsuranceQuote = async () => {
  if (!voyage || !dynamicDealValues.value) return
  const base = calculatePricePerPerson(dynamicDealValues.value, voyage)
  console.log('base', base)
  const indivRoom = dynamicDealValues.value.indivRoom ? voyage.indivRoomPrice : 0
  try {
    const res = await $fetch('/api/v1/chapka/quote', {
      method: 'POST',
      body: {
        pricePerTraveler: (base + indivRoom) / 100,
        countries: voyage.iso,
        zoneChapka: +voyage.zoneChapka || 0,
        departureDate: voyage.departureDate,
        returnDate: voyage.returnDate,
        nbTravelers: +dynamicDealValues.value.nbAdults + +dynamicDealValues.value.nbChildren,
      },
    })
    insurancesPrice.value = res
  }
  catch (e) {
    console.error('Insurance quote failed:', e)
  }
}

watch([() => voyage, dynamicDealValues], fetchInsuranceQuote, { immediate: true })

// Specific watcher for nbAdults, nbChildren, and indivRoom changes
watch(() => [dynamicDealValues.value?.nbAdults, dynamicDealValues.value?.nbChildren, dynamicDealValues.value?.indivRoom], async ([newNbAdults, newNbChildren, newIndivRoom], [oldNbAdults, oldNbChildren, oldIndivRoom]) => {
  if (voyage.value && dynamicDealValues.value
    && (newNbAdults !== oldNbAdults || newNbChildren !== oldNbChildren || newIndivRoom !== oldIndivRoom)) {
    await fetchInsuranceQuote(voyage.value, dynamicDealValues.value)
  }
}, { deep: true })

// Computed property to determine if insurance step should be shown
const showInsuranceStep = computed(() => {
  const v = insurancesPrice.value
  return v && (v.rapatriement || v.cancel)
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
