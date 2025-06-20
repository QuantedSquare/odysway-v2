<template>
  <v-skeleton-loader
    v-if="isLoadingInsurance"
    type="card"
  />
  <!-- v-else -->
  <v-container v-else-if="!isLoadingInsurance && !_.isEmpty(insurances)">
    <v-row>
      <v-col
        class="d-flex align-center"
        cols="12"
      >
        <h2>{{ page.insurances.title }}</h2>
        <img
          width="90"
          class="ml-2"
          :src="page.insurances.assurance_img"
        >
      </v-col>
    </v-row>
    <!-- Multirisque Insurance -->
    <v-row :class="selectedInsurance === 'rapatriement' ? 'text-primary' : 'text-grey'">
      <v-col
        v-if="insurances.rapatriement"
        cols="8"
      >
        <v-switch
          v-model="selectedInsurance"
          value="rapatriement"
        >
          <template #label>
            <div class="text-body-1 d-flex flex-column ga-2 align-start flex-md-row align-md-center">
              {{ page.insurances.preference_assurance_multirisque }}
              <v-badge
                color="secondary"
                inline
                :content="page.insurances.conseille_badge"
              />
            </div>
          </template>
        </v-switch>
      </v-col>

      <v-col class="d-flex justify-end align-center text-body-1 font-weight-bold">
        + {{ formatNumber(insurances.rapatriement * 100, 'currency', '€') }} / pers.
      </v-col>
      <v-col
        cols="12"
        class="px-16"
      >
        <FunnelStepsDialogLearnMore
          v-if="deal"
          :btn-text="deal.iso === 'NP' || deal.iso === 'PE' ? page.insurances.accroche_assurance_perou_nepal:page.insurances.accroche_assurance_medicale "
          :dialog-text="deal.iso === 'NP' || deal.iso === 'PE' ? page.insurances.details_assurance_medicale_perou_nepal:page.insurances.details_assurance_medicale "
          :page="page"
        />
      </v-col>
    </v-row>

    <!-- Cancellation Insurance -->
    <v-row
      v-if="insurances.cancel"
      :class="selectedInsurance === 'cancel' ? 'text-primary' : 'text-grey'"
    >
      <v-col
        cols="8"
      >
        <v-switch
          v-model="selectedInsurance"
          value="cancel"
          :label="page.insurances.preference_assurance_annulation"
        />
      </v-col>
      <v-col class="d-flex justify-end align-center text-body-1 font-weight-bold">
        + {{ formatNumber(insurances.cancel * 100, 'currency', '€') }} / pers.
      </v-col>
      <v-col
        cols="12"
        class="px-16"
      >
        <FunnelStepsDialogLearnMore
          :btn-text="page.insurances.accroche_assurance_annulation"
          :dialog-text="page.insurances.details_assurance_annulation"
          :page="page"
        />
      </v-col>
    </v-row>

    <v-divider class="mt-4" />
    <!-- No Insurance -->
    <v-row :class="selectedInsurance === 'none' ? '' : 'text-grey'">
      <v-col
        v-if="insurances.cancel || insurances.rapatriement"
        cols="12"
      >
        <!-- :label="$t('stepperDevisGroup.noInsurance')" -->
        <v-switch
          v-model="selectedInsurance"
          value="none"
          :label="page.insurances.no_insurance_label"
        />
      </v-col>
    </v-row>
    <!-- Insurance Unavailable Message -->

    <v-row class="text-caption text-primary">
      <v-col>
        <v-alert
          border="start"
          colored-border
          color="secondary"
          elevation="2"
        >
          <span
            class="font-weight-bold"
            v-html="page.insurances.alert"
          />
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
  <v-container
    v-else
    fluid
  >
    <v-row>
      <v-col>
        <v-alert
          border="start"
          colored-border
          color="secondary"
          elevation="2"
        >
          <span class="font-weight-bold ">
            {{ page.insurances.unavailable }}
          </span>
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import _ from 'lodash'

const props = defineProps(['voyage', 'currentStep', 'ownStep', 'page'])

const isLoadingInsurance = ref(true)
const { addSingleParam } = useParams()
const { deal, dealId, updateDeal } = useStepperDeal(props.ownStep)
const { pricePerTraveler } = usePricePerTraveler(deal)

// New: Local validation state
const isValid = ref(false)
const emit = defineEmits(['validity-changed', 'skip-step'])

// Data
const insurances = ref({
  rapatriement: 0,
  cancel: 0,
})

const fetchInsuranceQuote = async (retrievedDeal) => {
  isLoadingInsurance.value = true
  try {
    console.log('fetch insurance with this data:', {
      // Prix sans assurance ici
      pricePerTraveler: pricePerTraveler.value / 100,
      countries: retrievedDeal.iso,
      zoneChapka: +retrievedDeal.zoneChapka || 0,
      departureDate: retrievedDeal.departureDate,
      returnDate: retrievedDeal.returnDate,
      nbTravelers: +retrievedDeal.nbTravelers,
    })
    const insurance = await $fetch('/api/v1/chapka/quote', {
      method: 'POST',
      body: {
        // Prix sans assurance ici
        pricePerTraveler: pricePerTraveler.value / 100,
        countries: retrievedDeal.iso,
        zoneChapka: +retrievedDeal.zoneChapka || 0,
        departureDate: retrievedDeal.departureDate,
        returnDate: retrievedDeal.returnDate,
        nbTravelers: +retrievedDeal.nbTravelers,
      },
    })
    console.log('FETCH INSURANCE QUOTE', insurance)
    isLoadingInsurance.value = false
    return insurance
  }
  catch (error) {
    console.error('Error fetching insurance quote:', error)
    return null
  }
}

// Values
const selectedInsurance = ref('none') // possible values: 'rapatriement', 'cancel', 'none'

// New: Form validation logic
const formValidation = computed(() => {
  return !isLoadingInsurance.value && !!dealId.value
})

// New: Watch validation and emit changes
watch(formValidation, (isFormValid) => {
  isValid.value = isFormValid
  emit('validity-changed', props.ownStep, isFormValid)
}, { immediate: true })

watch([deal, () => props.currentStep], async () => {
  // Only run if we're on the insurance step
  if (props.currentStep !== props.ownStep) return

  isLoadingInsurance.value = true

  if (props.currentStep === props.ownStep) {
    addSingleParam('step', props.ownStep)
  }
  if (deal.value) {
    console.log('dealId fetched', deal.value)
    insurances.value = await fetchInsuranceQuote(deal.value)

    // If insurance is not available, emit skipStep to parent
    if (!insurances.value || (!insurances.value.rapatriement && !insurances.value.cancel)) {
      emit('skip-step')
      return
    }

    if (deal.value?.insurance) {
      const insuranceType = deal.value.insurance?.toLowerCase()
      if (insuranceType?.includes('multirisque')) {
        selectedInsurance.value = 'rapatriement'
      }
      else if (insuranceType?.includes('annulation')) {
        selectedInsurance.value = 'cancel'
      }
      else {
        selectedInsurance.value = 'none'
      }
    }
  }
}, { immediate: true })

// Analytics
const handleGAEvent = (event) => {
  const EVENTS = {
    rapatriement: { eventLabel: 'Groupe Détail - V-switch assurance médicale' },
    cancel: { eventLabel: 'Groupe Détail - V-switch assurance annulation' },
    none: { eventLabel: 'Groupe Détail - V-switch pas d\'assurance' },
  }
  return EVENTS[event].eventLabel
  // #TODO Add Google Analytics
  // this.$ga.event({
  //   eventCategory: 'Devis',
  //   eventAction: 'Click',
  //   eventLabel: EVENTS[event].eventLabel,
  // })
}
watch(selectedInsurance, (_value) => {
  // Update validation when insurance selection changes
  if (formValidation.value) {
    emit('validity-changed', props.ownStep, true)
  }
})

const insuranceChoice = computed(() => {
  switch (selectedInsurance.value) {
    case 'rapatriement':
      handleGAEvent('rapatriement')
      return { type: 'rapatriement', name: 'Multirisque', price: insurances.value.rapatriement }
    case 'cancel':
      handleGAEvent('cancel')
      return { type: 'cancel', name: 'Annulation', price: insurances.value.cancel }
    default:
      handleGAEvent('none')
      return { type: 'no_insurance', name: 'Aucune Assurance', price: 0 }
  }
})

const submitStepData = async () => {
  // Validate form
  if (!dealId.value || !isValid.value) return false
  const dealData = {
    dealId: dealId.value,
    insurance: [insuranceChoice.value.name],
    insuranceCommissionPrice: (insuranceChoice.value.price * 100),
    currentStep: 'A fait le choix de l\'assurance',
    insuranceCommissionPerTraveler: insuranceChoice.value.price * 30,
  }
  console.log('dealData pushed from insurance', dealData)
  try {
    await updateDeal(dealData)
    return true
  }
  catch (error) {
    console.log('error updating Options', error)
  }
}
defineExpose({
  submitStepData,
})
</script>
