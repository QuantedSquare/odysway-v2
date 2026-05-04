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
    <!-- Header -->
    <v-row class="mb-2">
      <v-col
        cols="12"
        class="d-flex align-center justify-space-between ga-2 pb-0"
      >
        <div class="d-flex align-center ga-2">
          <v-divider
            variant="solid"
            opacity="1"
            thickness="3"
            class="rounded-lg"
            color="secondary"
            vertical
          />
          <h2>{{ page.insurances.title }}</h2>
        </div>
        <SanityImage
          :asset-id="page.insurances.assurance_img.asset._ref"
          auto="format"
        >
          <template #default="{ src }">
            <img
              :src="src"
              width="80"
            >
          </template>
        </SanityImage>
      </v-col>
      <v-col
        cols="12"
        md="11"
      >
        <p class="text-subtitle-2">
          <span class="font-weight-bold">{{ page?.insurances?.not_covered_text || "💡 Vous n'êtes pas encore couvert." }}</span>
          {{ page?.insurances?.choose_protection_text || 'Choisissez votre protection pour voyager sereinement.' }}
        </p>
      </v-col>
    </v-row>

    <v-row class="d-flex flex-column ga-3">
      <!-- Multirisque card -->
      <v-col
        v-if="insurances.rapatriement"
        cols="12"
        class="pa-0"
      >
        <div
          class="insurance-card"
          :class="selectedInsurance === 'rapatriement' ? 'insurance-card--selected' : ''"
          @click="selectedInsurance = 'rapatriement'"
        >
          <div class="d-flex align-start ga-3">
            <v-icon
              class="mt-1 flex-shrink-0"
              :color="selectedInsurance === 'rapatriement' ? 'success' : 'grey-lighten-1'"
            >
              {{ selectedInsurance === 'rapatriement' ? mdiRadioboxMarked : mdiRadioboxBlank }}
            </v-icon>
            <div class="flex-grow-1">
              <div class="d-flex align-center ga-2 mb-1">
                <span class="font-weight-bold text-body-2">{{ page.insurances.preference_assurance_multirisque }}</span>
                <v-badge
                  color="primary"
                  inline
                  :content="page.insurances.conseille_badge"
                />
              </div>
              <p class="text-caption text-grey mb-0">
                {{ page?.insurances?.medical_coverage_text || 'Vous couvre pour les aléas avant votre voyage' }}
              </p>
            </div>
            <span class="font-weight-bold text-body-1 flex-shrink-0">
              +{{ formatNumber(insurances.rapatriement * 100, 'currency', '€') }}/pers.
            </span>
          </div>

          <template v-if="(selectedInsurance === 'rapatriement' && showRapatriementDetails) || (!selectedInsurance && showRapatriementDetails)">
            <v-divider class="my-3" />
            <ul class="insurance-details text-caption">
              <EnrichedText :value="multirisqueDetails" />
            </ul>
          </template>
          <button
            class="text-caption text-decoration-underline mt-2 d-block"
            :class="selectedInsurance !== 'rapatriement' ? 'text-grey' : ''"
            @click.stop="toggleDetails('rapatriement')"
          >
            {{ selectedInsurance === 'rapatriement' && showRapatriementDetails ? (page?.insurances?.toggle_hide_text || 'Masquer ▲') : (page?.insurances?.toggle_show_text || 'Voir les détails ▾') }}
          </button>
        </div>
      </v-col>

      <!-- Annulation card -->
      <v-col
        v-if="insurances.cancel"
        cols="12"
        class="pa-0"
      >
        <div
          class="insurance-card"
          :class="selectedInsurance === 'cancel' ? 'insurance-card--selected' : ''"
          @click="selectedInsurance = 'cancel'"
        >
          <div class="d-flex align-start ga-3">
            <v-icon
              class="mt-1 flex-shrink-0"
              :color="selectedInsurance === 'cancel' ? 'success' : 'grey-lighten-1'"
            >
              {{ selectedInsurance === 'cancel' ? mdiRadioboxMarked : mdiRadioboxBlank }}
            </v-icon>
            <div class="flex-grow-1">
              <div class="d-flex align-center ga-2 mb-1">
                <span class="font-weight-bold text-body-2">{{ page.insurances.preference_assurance_annulation }}</span>
              </div>
              <p class="text-caption text-grey mb-0">
                {{ page?.insurances?.cancel_coverage_text || 'Vous couvre avant et pendant votre voyage' }}
                <!-- {{ page.insurances.accroche_assurance_annulation }} -->
              </p>
            </div>
            <span class="font-weight-bold text-body-1 flex-shrink-0">
              +{{ formatNumber(insurances.cancel * 100, 'currency', '€') }}/pers.
            </span>
          </div>

          <template v-if="selectedInsurance === 'cancel' && showCancelDetails">
            <v-divider class="my-3" />
            <ul class="insurance-details text-caption">
              <EnrichedText :value="page.insurances.accroche_assurance_annulation" />
            </ul>
          </template>
          <button
            class="text-caption text-decoration-underline mt-2 d-block"
            :class="selectedInsurance !== 'cancel' ? 'text-grey' : ''"
            @click.stop="toggleDetails('cancel')"
          >
            {{ selectedInsurance === 'cancel' && showCancelDetails ? 'Masquer ▲' : 'Voir les détails ▾' }}
          </button>
        </div>
      </v-col>

      <!-- No insurance card -->
      <v-col
        v-if="insurances.cancel || insurances.rapatriement"
        cols="12"
        class="pa-0"
      >
        <div
          class="insurance-card insurance-card--dashed"
          :class="selectedInsurance === 'none' ? 'insurance-card--selected-none' : ''"
          @click="selectedInsurance = 'none'"
        >
          <div class="d-flex align-center ga-3">
            <v-icon :color="selectedInsurance === 'none' ? 'primary' : 'grey-lighten-1'">
              {{ selectedInsurance === 'none' ? mdiRadioboxMarked : mdiRadioboxBlank }}
            </v-icon>
            <span
              class="font-weight-bold text-body-2"
              :class="selectedInsurance === 'none' ? 'text-primary' : 'text-grey'"
            >
              {{ page.insurances.no_insurance_label }}
            </span>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Alert -->
    <v-row class="mt-2">
      <v-col cols="12">
        <p class="text-caption text-center text-grey">
          {{ page.insurances.alert }}
        </p>
      </v-col>
    </v-row>

    <!-- Actions -->
    <v-row class="mt-2">
      <v-col
        cols="12"
        class="d-flex flex-column ga-4"
      >
        <v-btn
          color="secondary"
          :disabled="!formValidation"
          class="font-weight-bold"
          block
          height="50"
          @click="submitStepData"
        >
          {{ page?.insurances?.continue_button || 'Continuer' }}
          <v-icon>
            {{ mdiArrowRight }}
          </v-icon>
        </v-btn>
        <v-btn
          class="bg-grey-light text-primary"
          block
          height="50"
          @click="emit('previous')"
        >
          <v-icon>
            {{ mdiArrowLeft }}
          </v-icon> {{ page?.insurances?.previous_button || 'PRÉCÉDENT' }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>

  <!-- Insurance unavailable -->
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
          <span class="font-weight-bold">
            {{ page.insurances.unavailable }}
          </span>
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import _ from 'lodash'
import { mdiRadioboxBlank, mdiRadioboxMarked, mdiArrowLeft, mdiArrowRight } from '@mdi/js'

const { trackReservationStep } = useGtmTracking()

const { insurances, currentStep, ownStep, page, voyage } = defineProps(['insurances', 'voyage', 'currentStep', 'ownStep', 'page'])
const isLoadingInsurance = ref(true)
const { updateDeal } = useStepperDeal()

const model = defineModel()
const emit = defineEmits(['next', 'previous'])

const selectedInsurance = ref(null)
const showRapatriementDetails = ref(true)
const showCancelDetails = ref(true)

const toggleDetails = (type) => {
  if (type === 'rapatriement') {
    if (selectedInsurance.value !== 'rapatriement') {
      selectedInsurance.value = 'rapatriement'
      showRapatriementDetails.value = true
    }
    else {
      showRapatriementDetails.value = !showRapatriementDetails.value
    }
  }
  else if (type === 'cancel') {
    if (selectedInsurance.value !== 'cancel') {
      selectedInsurance.value = 'cancel'
      showCancelDetails.value = true
    }
    else {
      showCancelDetails.value = !showCancelDetails.value
    }
  }
}

const multirisqueDetails = computed(() => {
  const raw = voyage.isCapExploraction
    ? page.insurances.accroche_assurance_perou_nepal
    : page.insurances.accroche_assurance_medicale
  return raw
})

watch([model, () => currentStep, () => insurances], () => {
  if (currentStep !== ownStep) return
  isLoadingInsurance.value = true
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

const formValidation = computed(() => selectedInsurance.value)

const insuranceChoice = computed(() => {
  switch (selectedInsurance.value) {
    case 'rapatriement':
      return { type: 'rapatriement', name: 'Multirisque', price: insurances.rapatriement }
    case 'cancel':
      return { type: 'cancel', name: 'Annulation', price: insurances.cancel }
    default:
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
  if (!model.value) return false
  const dealData = {
    insurance: [insuranceChoice.value.name],
    insuranceCommissionPrice: insuranceChoice.value.price * 100,
    currentStep: 'A fait le choix de l\'assurance',
    insuranceCommissionPerTraveler: insuranceChoice.value.price * 30,
  }
  try {
    updateDeal(dealData)
    const { getCountryFromPhone } = useGtmTracking()
    const additionalData = {
      optin_newsletter: model.value.optinNewsletter,
      user_data: {
        user_id: model.value.email,
        user_mail: model.value.email,
        user_phone: model.value.phone,
        user_country: getCountryFromPhone(model.value.phone),
      },
    }
    trackReservationStep(3, voyage, model.value, additionalData)
    emit('next')
  }
  catch (error) {
    console.log('error updating insurance', error)
    return false
  }
}
</script>

<style scoped>
.insurance-card {
  border: 1px solid rgb(var(--v-border-color));
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
}
.insurance-card--selected {
  border-color: rgb(var(--v-theme-success));
  background-color: rgba(var(--v-theme-success), 0.05);
}
.insurance-card--dashed {
  border-style: dashed;
}
.insurance-card--selected-none {
  border-color: rgb(var(--v-theme-primary));
  border-style: dashed;
}
.insurance-details {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.insurance-details li::before {
  content: "— ";
}
button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: inherit;
}
</style>
