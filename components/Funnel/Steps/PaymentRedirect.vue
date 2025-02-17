<template>
  <v-container>
    <!-- Slot for PromoForm -->
    <slot />
    <v-row>
      <v-col
        v-if="groupStepper && !depositDatePassed"
        cols="12"
      >
        <template v-if="isBooking">
          <div class="text-center">
            Souhaitez-vous poser une option gratuitement ? (Celle-ci est valable 7 jours).
          </div>
        </template>
        <template v-else>
          <v-switch
            v-model="checkedOption"
            inset
            hide-details
          >
            <template #label>
              Souhaitez-vous poser une option gratuitement ? (Celle-ci est valable 7 jours).
            </template>
          </v-switch>
        </template>
      </v-col>
      <template v-if="!isBooking">
        <v-divider
          horizontal
          class="ma-2"
        />
        <v-col cols="12">
          <v-switch
            v-model="switch_accept_data_privacy"
            inset
            hide-details
          >
            <template #label>
              <div
                class="pl-1"
                @click.stop=""
                v-html="page.fields.phrase_dacceptation"
              />
            </template>
          </v-switch>
          <v-switch
            v-model="switch_accept_country"
            inset
            hide-details
          >
            <template #label>
              Je me suis renseigné sur les conditions d'entrée dans le pays où s'effectue le voyage
            </template>
          </v-switch>
        </v-col>
      </template>
      <!-- Replace btn "Suivant" in parent -->
      <ClientOnly>
        <Teleport
          v-if="currentStep >= 5"
          to="#next-btn"
        >
          <Transition name="list">
            <v-btn
              v-if="!checkedOption"
              color="info"
              large
              :disabled="(!switch_accept_data_privacy || !switch_accept_country)"
              :to="`/confirmation?voyage=${voyage.slug}&success=true&isoption=true`"
              @click="book"
            >
              Poser une option gratuitement
            </v-btn>
            <v-btn
              v-else
              :loading="loadingStripeSession"
              :disabled="(!switch_accept_data_privacy || !switch_accept_country)"
              @click="stripePay"
            >
              Payer par CB ou Virement
            </v-btn>
          </Transition>
        </Teleport>
      </ClientOnly>
    </v-row>
  </v-container>
</template>

<script setup>
const props = defineProps(['page', 'voyage', 'currentStep', 'ownStep'])
const model = defineModel()
console.log('props', props.voyage)
const { deal, dealId, updateDeal } = useDeal(() => props.currentStep, () => props.ownStep)
// Data
const isBooking = ref(false)
const groupStepper = ref(true)
const depositDatePassed = ref(false)
const checkedOption = ref(false)
const switch_accept_data_privacy = ref(false)
const switch_accept_country = ref(false)

const dataForStripeSession = ref({
  acceptAlmaPaiement: false,
  almaTotalPrice: 0,
})
const loadAlma = false
const loadingStripeSession = ref(false)
const disableAlma = ref(false)
const stripePay = async () => {
  // #TODO Add Stripe payment
  console.log('Stripe payment')
}
const almaPay = async () => {
  // #TODO Add Alma payment
  console.log('Alma payment')
}

const book = async () => {
  // #TODO Add booking
  console.log('Booking')
}

watch([dealId, () => props.currentStep], () => {
  model.value = true
  if (dealId.value) {
    return
  }
}, { immediate: true })

const showOptionOrPayment = computed(() => {
  return checkedOption.value ? 0 : 1
})

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
    // #TODO Add data
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

<style scoped>
.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(40px);
}
.list-leave-to {
  opacity: 0;
  transform: translateY(-40px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}
</style>
