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
      :show-insurance="false"
    >
      <v-row class="funnel-stepper d-flex justify-center">
        <v-col
          cols="12"
          :md="currentStep < 4 ? 7 : 12"
          class="d-flex justify-center "
        >
          <v-card
            class="border-width relative no-margin-window mb-4 "
            :class="skipperMode !== 'summary' && currentStep === 1 ? 'w-100' : ''"
            :elevation="skipperMode !== 'summary' && currentStep < 4 ? 2 : 0"
          >
            <Transition name="fade">
              <v-img
                v-if="skipperMode !== 'summary' && voyage.imgSrc && currentStep === 0"
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
              :class="currentStep === 4 ? ' mx-0' : ''"
              :model-value="currentStep"
              class="px-md-6 mt-4"
            >
              <!-- Step 0: Skipper (for non-normal modes like devis, call, etc.) -->
              <v-stepper-window-item :value="0">
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
                    :own-step="4"
                    @previous="previousStep"
                  />
                </template>
                <FunnelStepsSkipper
                  v-else-if="skipperMode !== 'normal'"
                  v-model="skipperMode"
                  :page="pageTexts"
                  :current-step="currentStep"
                  :own-step="0"
                  @next="nextStep"
                />
              </v-stepper-window-item>

              <!-- Step 1: Email Capture (normal mode) -->
              <v-stepper-window-item :value="1">
                <FunnelStepsEmailCapture
                  v-if="skipperMode === 'normal'"
                  v-model="dynamicDealValues"
                  :checkout-type="checkoutType"
                  :voyage="voyage"
                  :date-id="date_id"
                  :own-step="1"
                  :page="pageTexts"
                  @next="nextStep"
                />
                <CalendlyContainer
                  v-else
                  :travel-title="voyage.title"
                  :is-funnel="true"
                  :voyage="voyage"
                  @previous="previousStep"
                />
              </v-stepper-window-item>

              <!-- Step 2: Voyageurs (Details) -->
              <v-stepper-window-item :value="2">
                <FunnelStepsDetails
                  v-model="dynamicDealValues"
                  :checkout-type="checkoutType"
                  :voyage="voyage"
                  :date-id="date_id"
                  :own-step="2"
                  :page="pageTexts"
                  @next="nextStep"
                  @previous="previousStep"
                />
              </v-stepper-window-item>

              <!-- Step 3: Options & Insurance -->
              <v-stepper-window-item :value="3">
                <FunnelStepsOptions
                  v-model="dynamicDealValues"
                  :voyage="voyage"
                  :current-step="currentStep"
                  :page="pageTexts"
                  :own-step="3"
                  :insurances="insurancesPrice"
                  @next="nextStep"
                  @previous="previousStep"
                />
              </v-stepper-window-item>

              <!-- Step 4: Payment -->
              <v-stepper-window-item :value="4">
                <FunnelStepsPaymentRedirect
                  v-model="dynamicDealValues"
                  :page="pageTexts"
                  :current-step="currentStep"
                  :voyage="voyage"
                  :own-step="4"
                  @previous="previousStep"
                />
              </v-stepper-window-item>
            </v-stepper-window>
          </v-card>
        </v-col>

        <!-- Summary sidebar: steps 1-3 only, hidden on step 4 (inline) -->
        <v-col
          v-if="currentStep > 0 && currentStep < 4 && (skipperMode === 'normal' || skipperMode === 'summary')"
          cols="12"
          :md="4"
          class="d-none d-md-block"
        >
          <FunnelStepsSummary
            v-model="dynamicDealValues"
            :current-step="currentStep"
            :page="pageTexts"
            :voyage="voyage"
            :own-step="4"
          />
        </v-col>
      </v-row>
      <FunnelStepsBottomSummaryBar
        v-if="currentStep > 0 && (skipperMode === 'normal' || skipperMode === 'summary')"
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

const { trackReservationStep, trackRdvClick } = useGtmTracking()

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

const route = useRoute()

const { step, date_id } = route.query

// GTM: Track reservation step on mount based on current step
onMounted(() => {
  const currentStepNumber = step ? parseInt(step) : 1
  console.log('currentStepNumber', step)
  trackReservationStep(currentStepNumber, voyage, dynamicDealValues.value)
})
const { addSingleParam } = useParams()

const stepperHeaderRef = useTemplateRef('stepperHeaderRef')

const insurancesPrice = ref(null)

const dynamicDealValues = ref(initialDealValues)
console.log('dynamicDealValues', dynamicDealValues.value)
const checkoutType = ref(determinePaymentOptions(voyage.departureDate, route.query))

// ================== Voyage ==================

const displayedDates = computed(() => {
  const dates = `Du ${dayjs(voyage.departureDate).format('DD/MM/YYYY')} au ${dayjs(voyage.returnDate).format('DD/MM/YYYY')}`
  return dates
})
// ================== Stepper Management ==================
// For normal mode: steps 1-4 (no step 0)
// For other modes (devis, call, etc.): keep legacy step 0 behavior
const currentStep = ref(step ? parseInt(step) : 1)
const skipperMode = ref('normal')

if (route.query.type === 'custom' || route.query.type === 'balance') {
  currentStep.value = route.query.type === 'custom' ? 2 : 4
  skipperMode.value = route.query.type === 'custom' ? 'normal' : 'summary'
}

const nextStep = () => {
  const nextStepValue = currentStep.value + 1
  currentStep.value = nextStepValue
  addSingleParam('step', nextStepValue.toString())

  if (skipperMode.value === 'quick') {
    trackRdvClick()
  }
  else {
    trackReservationStep(nextStepValue, voyage, dynamicDealValues.value)
  }
}

const previousStep = () => {
  const previousStepValue = currentStep.value - 1
  currentStep.value = previousStepValue
  addSingleParam('step', previousStepValue.toString())
}

watch(() => route.query.step, (newVal) => {
  if (newVal) {
    currentStep.value = parseInt(newVal)
  }
})

// Insurance fetching logic
const { calculatePricePerPerson } = usePricePerTraveler(dynamicDealValues, voyage)

const fetchInsuranceQuote = async () => {
  if (!voyage || !dynamicDealValues.value) return
  const base = calculatePricePerPerson(dynamicDealValues.value, voyage)

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
        isCapExploraction: voyage.isCapExploraction,
        nbTravelers: +dynamicDealValues.value.nbAdults + +dynamicDealValues.value.nbChildren,
        isoContact: dynamicDealValues.value.isoContact,
      },
    })
    console.log('res in fetchInsuranceQuote', res)
    insurancesPrice.value = res
  }
  catch (e) {
    console.error('Insurance quote failed:', e)
  }
}

watch([() => voyage, dynamicDealValues], fetchInsuranceQuote, { immediate: true })

// Specific watcher for nbAdults, nbChildren, and indivRoom changes
watch(() => [dynamicDealValues.value?.nbAdults, dynamicDealValues.value?.nbChildren, dynamicDealValues.value?.indivRoom], async ([newNbAdults, newNbChildren, newIndivRoom], [oldNbAdults, oldNbChildren, oldIndivRoom]) => {
  if (voyage && dynamicDealValues.value
    && (newNbAdults !== oldNbAdults || newNbChildren !== oldNbChildren || newIndivRoom !== oldIndivRoom)) {
    await fetchInsuranceQuote()
  }
}, { deep: true })
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
