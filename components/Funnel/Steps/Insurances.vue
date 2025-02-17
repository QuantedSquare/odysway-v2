<template>
  <v-container>
    <v-skeleton-loader
      v-if="isLoadingInsurance"
      type="card"
    />
    <!-- v-else -->
    <v-row v-else>
      <v-col
        class="d-flex align-center"
        cols="12"
      >
        <!-- <h2>{{ $t('stepperDevisGroup.insurances') }}</h2> -->
        <h2>Garanties <span class="text-body-1">avec</span></h2>
        <img
          width="90"
          class="ml-2"
          :src="page.fields.assurance_img"
        >
      </v-col>
      <!-- Medical Insurance -->
      <v-col
        v-if="insurances.rapatriement"
        cols="12"
      >
        <v-switch
          v-model="selectedInsurance"
          :label="page.fields.preference_assurance"
          value="rapatriement"
        />
        <FunnelStepsDialogLearnMore
          v-if="deal"
          :btn-text="deal.iso === 'NP' || deal.iso === 'PE' ? page.fields.accroche_assurance_perou_nepal:page.fields.accroche_assurance_medicale "
          :dialog-text="deal.iso === 'NP' || deal.iso === 'PE' ? page.fields.details_assurance_medicale_perou_nepal:page.fields.details_assurance_medicale "
        />
      </v-col>
      <!-- Cancellation Insurance -->
      <v-col
        v-if="insurances.cancel"
        cols="12"
      >
        <v-switch
          v-model="selectedInsurance"
          value="cancel"
          :label="page.fields.preference_assurance_annulation"
        />
        <FunnelStepsDialogLearnMore
          :btn-text="page.fields.accroche_assurance_annulation"
          :dialog-text="page.fields.details_assurance_annulation"
        />
      </v-col>
      <!-- No Insurance -->
      <v-col
        v-if="insurances.cancel || insurances.rapatriement"
        cols="12"
      >
        <!-- :label="$t('stepperDevisGroup.noInsurance')" -->
        <v-switch
          v-model="selectedInsurance"
          value="none"
          label="Je ne souhaite pas d'assurance"
        />
      </v-col>
      <!-- Insurance Unavailable Message -->
    </v-row>
    <v-row class="text-caption text-primary">
      <v-col>
        Le calcul du prix de votre voyage sera fait à la prochaine étape
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const props = defineProps(['page', 'voyage', 'currentStep', 'ownStep'])
const model = defineModel()
const isLoadingInsurance = ref(true)

const { deal, dealId, updateDeal } = useDeal(() => props.currentStep, () => props.ownStep)
// Data
const insurances = ref({
  rapatriement: 0,
  cancel: 0,
})

const fetchInsuranceQuote = async (retrievedDeal) => {
  isLoadingInsurance.value = true
  try {
    console.log('fetch insurance with this data:', {
      pricePerTraveler: +retrievedDeal.pricePerTraveler,
      countries: retrievedDeal.iso,
      zoneChapka: +retrievedDeal.zoneChapka || 0,
      departureDate: retrievedDeal.departureDate,
      returnDate: retrievedDeal.returnDate,
      nbTravelers: +retrievedDeal.nbTravelers,
    })
    const insurance = await $fetch('/api/v1/chapka/quote', {
      method: 'POST',
      body: {
        pricePerTraveler: +retrievedDeal.pricePerTraveler,
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

watch([deal, () => props.currentStep], async () => {
  model.value = true
  if (props.currentStep === props.ownStep) {
    addAnotherParameter('currentStep', props.ownStep)
  }
  if (deal.value) {
    console.log('dealId fetched', deal.value)
    insurances.value = await fetchInsuranceQuote(deal.value)

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
  if (!dealId.value || !model.value) return false
  const dealData = {
    dealId: dealId.value,
    value: +deal.value.value, // #TODO  Remplacer par recalcul total avec assurance
    pricePerTraveler: +deal.value.pricePerTraveler, // #TODO  Remplacer par recalcul prix avec assurance,
    insurance: [insuranceChoice.value.name],
    insuranceCommissionPrice: (insuranceChoice.value.price * 100),
    currentStep: 'A fait le choix de l\'assurance',
    // totalTravelPrice: this.dealData.value, ... #TODO
    insuranceCommissionPerTraveler: insuranceChoice.value.price * 30,
    //
  }
  console.log('dealData', dealData)
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
