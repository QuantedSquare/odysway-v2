<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h2>Personnalisez votre voyage</h2>
      </v-col>
    </v-row>

    <!-- Individual Room -->
    <v-row v-if="voyage.gotIndivRoomAvailable && voyage.indivRoomPrice > 0">
      <v-col cols="12">
        <h3 class="text-body-1 font-weight-bold mb-2">
          {{ page.options.indiv_room_title }}
        </h3>
      </v-col>
      <v-col
        cols="8"
        :class="model.indivRoom ? 'text-primary' : 'text-grey'"
      >
        <v-switch
          v-model="model.indivRoom"
          :label="page.options.indiv_room_label"
          :disabled="forcedIndivRoom"
        />
        <FunnelStepsDialogLearnMore
          :btn-text="page.room_indiv_accroche"
          :dialog-text="page.room_indiv_text"
          :page="page"
        />
      </v-col>
      <v-col
        class="d-flex justify-end align-start text-body-1"
        :class="model.indivRoom ? 'text-primary' : 'text-grey'"
      >
        + {{ formatNumber(voyage.indivRoomPrice, 'currency', '&euro;') }} / pers.
      </v-col>
    </v-row>

    <v-divider
      v-if="voyage.gotIndivRoomAvailable && voyage.indivRoomPrice > 0"
      class="my-4"
    />

    <!-- Insurance Section -->
    <v-row v-if="insurances === null">
      <v-col cols="12">
        <h3 class="text-body-1 font-weight-bold mb-2">
          Assurance voyage
        </h3>
        <v-skeleton-loader type="card" />
      </v-col>
    </v-row>

    <v-row v-else-if="insurances && (insurances.rapatriement || insurances.cancel)">
      <v-col
        cols="12"
        class="d-flex align-center ga-2"
      >
        <h3 class="text-body-1 font-weight-bold">
          Assurance voyage
        </h3>
        <SanityImage
          v-if="page.insurances?.assurance_img?.asset?._ref"
          :asset-id="page.insurances.assurance_img.asset._ref"
          auto="format"
        >
          <template #default="{ src }">
            <img
              :src="src"
              width="70"
              alt="Chapka"
            >
          </template>
        </SanityImage>
      </v-col>

      <v-col cols="12">
        <v-row class="ga-3">
          <!-- Multirisque card -->
          <v-col
            v-if="insurances.rapatriement"
            cols="12"
            md="4"
          >
            <v-card
              :variant="selectedInsurance === 'rapatriement' ? 'elevated' : 'outlined'"
              :class="selectedInsurance === 'rapatriement' ? 'border-primary border-opacity-100' : ''"
              class="pa-4 cursor-pointer insurance-card"
              style="border-width: 2px !important"
              rounded="lg"
              role="button"
              :aria-label="'Assurance Multirisque ' + formatNumber(insurances.rapatriement * 100, 'currency', '&euro;') + ' par personne'"
              @click="selectedInsurance = 'rapatriement'"
            >
              <div class="d-flex justify-space-between align-start mb-2">
                <span class="text-body-1 font-weight-bold">Multirisque</span>
                <v-badge
                  color="secondary"
                  inline
                  :content="page.insurances?.conseille_badge || 'Recommande'"
                />
              </div>
              <div class="text-h6 font-weight-bold text-primary mb-2">
                {{ formatNumber(insurances.rapatriement * 100, 'currency', '&euro;') }}
                <span class="text-caption font-weight-regular">/ pers.</span>
              </div>
              <v-icon
                v-if="selectedInsurance === 'rapatriement'"
                :icon="mdiCheckCircle"
                color="primary"
                size="small"
                class="mb-2"
              />
              <FunnelStepsDialogLearnMore
                v-if="model"
                :btn-text="voyage.isCapExploraction ? page.insurances?.accroche_assurance_perou_nepal : page.insurances?.accroche_assurance_medicale"
                :dialog-text="voyage.isCapExploraction ? page.insurances?.details_assurance_medicale_perou_nepal : page.insurances?.details_assurance_medicale"
                :page="page"
              />
            </v-card>
          </v-col>

          <!-- Annulation card -->
          <v-col
            v-if="insurances.cancel"
            cols="12"
            md="4"
          >
            <v-card
              :variant="selectedInsurance === 'cancel' ? 'elevated' : 'outlined'"
              :class="selectedInsurance === 'cancel' ? 'border-primary border-opacity-100' : ''"
              class="pa-4 cursor-pointer insurance-card"
              style="border-width: 2px !important"
              rounded="lg"
              role="button"
              :aria-label="'Assurance Annulation ' + formatNumber(insurances.cancel * 100, 'currency', '&euro;') + ' par personne'"
              @click="selectedInsurance = 'cancel'"
            >
              <div class="mb-2">
                <span class="text-body-1 font-weight-bold">Annulation</span>
              </div>
              <div class="text-h6 font-weight-bold text-primary mb-2">
                {{ formatNumber(insurances.cancel * 100, 'currency', '&euro;') }}
                <span class="text-caption font-weight-regular">/ pers.</span>
              </div>
              <v-icon
                v-if="selectedInsurance === 'cancel'"
                :icon="mdiCheckCircle"
                color="primary"
                size="small"
                class="mb-2"
              />
              <FunnelStepsDialogLearnMore
                :btn-text="page.insurances?.accroche_assurance_annulation"
                :dialog-text="page.insurances?.details_assurance_annulation"
                :page="page"
              />
            </v-card>
          </v-col>

          <!-- No insurance card -->
          <v-col
            cols="12"
            md="4"
          >
            <v-card
              :variant="selectedInsurance === 'none' ? 'elevated' : 'outlined'"
              :class="selectedInsurance === 'none' ? 'border-primary border-opacity-100' : ''"
              class="pa-4 cursor-pointer insurance-card"
              style="border-width: 2px !important"
              rounded="lg"
              role="button"
              aria-label="Aucune assurance"
              @click="selectedInsurance = 'none'"
            >
              <div class="mb-2">
                <span class="text-body-1 font-weight-bold">Aucune</span>
              </div>
              <div class="text-h6 font-weight-bold text-grey mb-2">
                0 &euro;
              </div>
              <v-icon
                v-if="selectedInsurance === 'none'"
                :icon="mdiCheckCircle"
                color="primary"
                size="small"
              />
            </v-card>
          </v-col>
        </v-row>
      </v-col>

      <v-col cols="12">
        <v-alert
          border="start"
          colored-border
          color="secondary"
          elevation="2"
          class="text-caption"
        >
          <span
            class="font-weight-bold"
            v-html="page.insurances?.alert || 'Nous vous recommandons vivement de souscrire une assurance voyage.'"
          />
        </v-alert>
      </v-col>
    </v-row>

    <v-divider class="my-4" />

    <!-- Special Requests -->
    <v-row>
      <v-col cols="12">
        <h3 class="text-body-1 font-weight-bold">
          {{ page.options.food_details_title }}
        </h3>
      </v-col>
      <v-col cols="12">
        <v-textarea
          v-model="model.specialRequest"
          variant="outlined"
          :label="page.options.special_request_label"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col class="d-flex ga-3">
        <v-btn
          class="bg-grey-light font-weight-regular"
          aria-label="Etape precedente"
          @click="emit('previous')"
        >
          Precedent
        </v-btn>
        <v-btn
          color="secondary"
          class="font-weight-bold"
          :disabled="!formValidation"
          aria-label="Etape suivante"
          @click="submitStepData"
        >
          Suivant
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { mdiCheckCircle } from '@mdi/js'

const { trackReservationStep } = useGtmTracking()

const { voyage, ownStep, page, insurances } = defineProps(['voyage', 'ownStep', 'page', 'insurances'])
const { updateDeal } = useStepperDeal(ownStep)

const model = defineModel()
const emit = defineEmits(['next', 'previous'])

const forcedIndivRoom = computed(() => {
  return voyage?.forcedIndivRoom && voyage.indivRoomPrice > 0 && (model.value.nbAdults + model.value.nbChildren === 1) && model.value.nbChildren === 0
})

watch(forcedIndivRoom, () => {
  model.value.indivRoom = forcedIndivRoom.value
}, { immediate: true })

// ============= Insurance logic (merged from Insurances.vue) =============

const selectedInsurance = ref(null)

// Pre-select Multirisque if available, otherwise restore from model
watch(() => insurances, () => {
  if (!insurances) return

  if (model.value?.insurance) {
    const insuranceType = typeof model.value.insurance === 'string'
      ? model.value.insurance.toLowerCase()
      : Array.isArray(model.value.insurance)
        ? (model.value.insurance[0] || '').toLowerCase()
        : ''
    if (insuranceType.includes('multirisque')) {
      selectedInsurance.value = 'rapatriement'
    }
    else if (insuranceType.includes('annulation')) {
      selectedInsurance.value = 'cancel'
    }
    else {
      selectedInsurance.value = 'none'
    }
  }
  else if (insurances?.rapatriement) {
    // Pre-select Multirisque as smart default
    selectedInsurance.value = 'rapatriement'
  }
}, { immediate: true })

const insuranceChoice = computed(() => {
  if (!insurances) return { type: 'no_insurance', name: 'Aucune Assurance', price: 0 }
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

const formValidation = computed(() => {
  // If insurance is available, require a selection
  if (insurances && (insurances.rapatriement || insurances.cancel)) {
    return !!selectedInsurance.value
  }
  return true
})

const submitStepData = () => {
  const dealData = {
    specialRequest: model.value.specialRequest,
    indivRoom: model.value.indivRoom || forcedIndivRoom.value ? ['Oui'] : ['Non'],
    currentStep: 'A choisi ses options et assurance',
  }

  // Add insurance data
  if (selectedInsurance.value && selectedInsurance.value !== 'none') {
    dealData.insurance = [insuranceChoice.value.name]
    dealData.insuranceCommissionPrice = insuranceChoice.value.price * 100
    dealData.insuranceCommissionPerTraveler = insuranceChoice.value.price * 30
  }
  else {
    dealData.insurance = ['Aucune Assurance']
    dealData.insuranceCommissionPrice = 0
    dealData.insuranceCommissionPerTraveler = 0
  }

  try {
    updateDeal(dealData)

    // GTM: Track reservation_step3 (options + insurance selected)
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
    console.log('error updating Options', error)
  }
}
</script>

<style scoped>
.insurance-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}
.insurance-card:hover {
  transform: scale(1.02);
}
.border-primary {
  border-color: rgb(var(--v-theme-primary)) !important;
}
.cursor-pointer {
  cursor: pointer;
}
:deep(.v-field-label) {
  font-weight: regular !important;
  color: rgb(118, 118, 118, 0.6) !important;
}
</style>
