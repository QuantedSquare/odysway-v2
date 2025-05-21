<template>
  <v-container>
    <v-skeleton-loader
      v-if="isLoadingInsurance"
      type="card"
    />
    <!-- v-else -->
    <template v-else-if="!isLoadingInsurance && !isEmpty(insurances)">
      <v-row>
        <v-col
          class="d-flex align-center"
          cols="12"
        >
          <!-- <h2>{{ $t('stepperDevisGroup.insurances') }}</h2> -->
          <h2>Garanties <span class="text-body-1">avec</span></h2>
          <img
            width="90"
            class="ml-2"
            :src="page.assurance_img"
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
              <div class="text-body-1 d-flex align-center">
                {{ page.preference_assurance_multirisque }}
                <v-badge
                  color="secondary"
                  inline
                  content="Conseillé"
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
            :btn-text="deal.iso === 'NP' || deal.iso === 'PE' ? page.accroche_assurance_perou_nepal:page.accroche_assurance_medicale "
            :dialog-text="deal.iso === 'NP' || deal.iso === 'PE' ? page.details_assurance_medicale_perou_nepal:page.details_assurance_medicale "
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
            :label="page.preference_assurance_annulation"
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
            :btn-text="page.accroche_assurance_annulation"
            :dialog-text="page.details_assurance_annulation"
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
            label="Je ne souhaite pas d'assurance"
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
            <span class="font-weight-bold">
              Assurance applicable à tous les voyageurs. <br>
              Le calcul du prix de votre voyage se fera à la prochaine étape.
            </span>
          </v-alert>
        </v-col>
      </v-row>
    </template>
    <template v-else>
      <v-row>
        <v-col>
          <v-alert
            border="start"
            colored-border
            color="secondary"
            elevation="2"
          >
            <span class="font-weight-bold">
              L'assurance n'est pas disponible pour votre voyage.
            </span>
          </v-alert>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup>
import { isEmpty } from 'lodash'

const props = defineProps(['page', 'voyage', 'currentStep', 'ownStep'])
const model = defineModel()
const isLoadingInsurance = ref(true)
const { addSingleParam } = useParams()
const { deal, dealId, updateDeal } = useStepperDeal(props.ownStep)
const { pricePerTraveler } = usePricePerTraveler(deal)

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

watch([deal, () => props.currentStep], async () => {
  isLoadingInsurance.value = true

  if (props.currentStep === props.ownStep) {
    addSingleParam('step', props.ownStep)
  }
  if (deal.value) {
    model.value = true
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
watch(selectedInsurance, (value) => {
  model.value = !!value
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
  if (!dealId.value || !model.value) return false
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
