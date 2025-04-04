<template>
  <v-container>
    <!-- Slot for PromoForm -->
    <slot />
    <v-row>
      <!-- Medical Insurance -->
      <v-col
        v-if="insurances.rapatriement"
        cols="12"
      >
        <v-switch
          v-model="selectedInsurance"
          :label="page.preference_assurance"
          value="rapatriement"
        />
        <FunnelStepsDialogLearnMore
          v-if="deal"
          :btn-text="deal.iso === 'NP' || deal.iso === 'PE' ? page.accroche_assurance_perou_nepal:page.accroche_assurance_medicale "
          :dialog-text="deal.iso === 'NP' || deal.iso === 'PE' ? page.details_assurance_medicale_perou_nepal:page.details_assurance_medicale "
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
          :label="page.preference_assurance_annulation"
        />
        <FunnelStepsDialogLearnMore
          :btn-text="page.accroche_assurance_annulation"
          :dialog-text="page.details_assurance_annulation"
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
      <v-col v-else>
        <div v-html="page.insurances_unavailable " />
      </v-col>
    </v-row>
    <v-row class="text-caption text-primary">
      <v-col>
        Le calcul du prix de votre voyage sera fait à la prochaine étape
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// #TODO: THIS COMPONENT IS JUST A COPY OF INSURANCES.VUE, REMAKE IT INTO A promo form
const props = defineProps(['page', 'voyage', 'currentStep'])
const model = defineModel()

const { fetchDeal, deal, dealId, updateDeal } = useStepperDeal()
// Data
const insurances = ref({
  rapatriement: 0,
  cancel: 0,
})

const fetchInsuranceQuote = async () => {
  try {
    const insurance = await $fetch('/api/v1/chapka/quote', {
      method: 'POST',
      body: {
        pricePerTraveler: 1800,
        countries: 'FR',
        zoneChapka: 2,
        departureDate: '25/09/2025',
        returnDate: '13/10/2025',
        nbTravelers: 5,
      },
    })
    console.log('FETCH INSURANCE QUOTE', insurance)
    return insurance
  }
  catch (error) {
    console.error('Error fetching insurance quote:', error)
    return null
  }
}

// Values
const selectedInsurance = ref('none') // possible values: 'rapatriement', 'cancel', 'none'

watch([dealId, () => props.currentStep], async () => {
  model.value = true
  if (dealId.value) {
    insurances.value = await fetchInsuranceQuote()
    await fetchDeal(dealId.value)
    console.log('deal', deal.value)

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
    pricePerTraveler: 0, // #TODO  Remplacer par recalcul prix avec assurance,
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
