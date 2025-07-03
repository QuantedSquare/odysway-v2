<template>
  <!-- Loading state -->
  <v-container v-if="!insurances">
    <v-row>
      <v-col>
        <v-skeleton-loader type="card" />
      </v-col>
    </v-row>
  </v-container>
  <!-- Insurance options -->
  <v-container v-else-if="insurances && !_.isEmpty(insurances)">
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
          v-if="model"
          :btn-text="model.iso === 'NP' || model.iso === 'PE' ? page.insurances.accroche_assurance_perou_nepal:page.insurances.accroche_assurance_medicale "
          :dialog-text="model.iso === 'NP' || model.iso === 'PE' ? page.insurances.details_assurance_medicale_perou_nepal:page.insurances.details_assurance_medicale "
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
    <v-row>
      <v-col
        class="d-flex ga-3"
      >
        <v-btn
          class="
        bg-grey-light font-weight-regular"
          @click="emit('previous')"
        >
          Précédent
        </v-btn>
        <v-btn
          color="secondary"
          class="font-weight-bold"
          @click="submitStepData"
        >
          Suivant
        </v-btn>
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

const { insurances, currentStep, ownStep, page } = defineProps(['insurances', 'voyage', 'currentStep', 'ownStep', 'page'])
const isLoadingInsurance = ref(true)
const { addSingleParam } = useParams()
const { updateDeal } = useStepperDeal(ownStep)

const model = defineModel()
const emit = defineEmits(['next', 'previous'])

// Values
const selectedInsurance = ref('none') // possible values: 'rapatriement', 'cancel', 'none'

watch([model, () => currentStep, () => insurances], () => {
  // Only run if we're on the insurance step
  if (currentStep !== ownStep) return

  isLoadingInsurance.value = true

  if (currentStep === ownStep) {
    addSingleParam('step', ownStep)
  }

  if (model.value) {
    if (model.value?.insurance) {
      const insuranceType = model.value.insurance?.toLowerCase()
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

    isLoadingInsurance.value = false
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
      return { type: 'rapatriement', name: 'Multirisque', price: insurances.rapatriement }
    case 'cancel':
      handleGAEvent('cancel')
      return { type: 'cancel', name: 'Annulation', price: insurances.cancel }
    default:
      handleGAEvent('none')
      return { type: 'no_insurance', name: 'Aucune Assurance', price: 0 }
  }
})
watch(insuranceChoice, () => {
  if (model.value) {
    model.value.insurance = insuranceChoice.value.name
    model.value.insuranceCommissionPrice = insuranceChoice.value.price * 100
    model.value.insuranceCommissionPerTraveler = insuranceChoice.value.price * 30
  }
})

const submitStepData = () => {
  // Validate form
  if (!model.value) return false
  const dealData = {
    insurance: [insuranceChoice.value.name],
    insuranceCommissionPrice: (insuranceChoice.value.price * 100),
    currentStep: 'A fait le choix de l\'assurance',
    insuranceCommissionPerTraveler: insuranceChoice.value.price * 30,
  }
  console.log('dealData pushed from insurance', dealData)
  try {
    updateDeal(dealData)
    emit('next')
  }
  catch (error) {
    console.log('error updating insurance', error)
    return false
  }
}
</script>
