<template>
  <v-container>
    <!-- Prévoir Promo form -->
    <v-card variant="plain">
      <v-card-text>
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
                  <div class="text-caption text-md-body-1 pl-1">
                    Souhaitez-vous poser une option gratuitement ? (Celle-ci est valable 7 jours).
                  </div>
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
                    class="text-caption text-md-body-1 pl-1"
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
                  <div class="text-caption text-md-body-1 pl-1">
                    Je me suis renseigné sur les conditions d'entrée dans le pays où s'effectue le voyage
                  </div>
                </template>
              </v-switch>
            </v-col>
          </template>
          <!-- Replace btn "Suivant" in parent -->
          <ClientOnly>
            <Teleport
              v-if="currentStep >= 5"
              to="#next-btn"
              defer
            >
              <Transition name="list">
                <v-btn
                  v-if="checkedOption"
                  color="info"
                  class="ml-4"
                  large
                  :disabled="(!switch_accept_data_privacy || !switch_accept_country)"
                  :to="`/confirmation?voyage=${voyage.slug}&success=true&isoption=true`"
                  @click="book"
                >
                  Poser une option gratuitement
                </v-btn>
                <v-btn
                  v-else
                  class="ml-4"
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
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
const props = defineProps(['page', 'voyage', 'currentStep', 'ownStep'])
const model = defineModel()
console.log('props', props.voyage)
const route = useRoute()

const { deal, dealId, updateDeal } = useStepperDeal(props.ownStep)
const { addSingleParam } = useParams()

// Data
const isBooking = ref(false)
const groupStepper = ref(true)
const depositDatePassed = ref(false)
const checkedOption = ref(false)
const switch_accept_data_privacy = ref(false)
const switch_accept_country = ref(false)

const loadingStripeSession = ref(false)

const appliedPrice = computed(() => {
  if (route.query.type === 'full') {
    return deal.value.value// prix_voyage // - this.promo.amount / 100 * this.promo.isValid - this.earlybird.price * this.earlybird.isAvailable - this.lastMinute.price * this.lastMinute.isAvailable
  }
  else if (route.query.type === 'deposit') {
    // Deposit = 30% basePricePerTraveler + insurance + Flight
    return deal.value.depositPrice
  }
  else if (route.query.type === 'custom') {
    return route.query.amount
  }
  else {
    // route.query.type === null || 'balance'
    return deal.value.basePricePerTravel - deal.value.depositPrice
  }
})

const stripePay = async () => {
  console.log('appliedPrice', appliedPrice.value)

  const dataForStripeSession = {
    dealId: dealId.value,
    // Fixed Data from voyage
    image: props.voyage.imgSrc,
    title: props.voyage.title,
    indivRoomPrice: +props.voyage.indivRoomPrice,
    voyage: encodeURIComponent(props.voyage.slug),

    // Dynamic Data from deal and stepper
    appliedPrice: +appliedPrice.value, // #TODO CHANGER
    promo: 5000, // props.promo.amount / 100 * props.promo.isValid, // #TODO checker si valid
    insurances: deal.value.insurance,
    insurancePricePerTraveler: +deal.value.insuranceCommissionPerTraveler || 0,
    nbTravelers: +deal.value.nbTravelers,
    options: deal.value.indivRoom === 'Oui',
    isDeposit: route.query.type === 'deposit',
    includRoom: route.query.type === 'deposit',
    isAdvance: route.query.type === 'deposit',
    restToPay: +deal.value.restToPay,
    childrenPromo: +deal.value.promoChildren, // si valeur de reduc non renseignée on met 0 ?
    teenPromo: +deal.value.promoTeen || 80, // si valeur de reduc non renseignée on met 0 ?
    nbUnderAge: +deal.value.nbUnderAge,
    nbTeen: +deal.value.nbTeen,
    isSold: route.query.type !== 'deposit',
    isPayment: route.query.type === 'deposit',
    pipeline: 1,
    flatRestToPay: +deal.value.flatRestToPay || +deal.value.value, // #TODO Checker comment c'est calculé
    contact: deal.value.contact,
    paymentType: route.query.type,
    currentUrl: route.fullPath,
    insuranceImg: props.page.fields.assurance_img,
  }
  console.log('dataForStripeSession', dataForStripeSession)

  const checkoutLink = await $fetch('/api/v1/stripe/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dataForStripeSession),
  })
  if (checkoutLink) {
    console.log('checkoutLink', checkoutLink)
    await navigateTo(checkoutLink, {
      external: true,
    })
  }
}

const book = async () => {
  // #TODO Add booking
  console.log('Booking')
}

watch([dealId, () => props.currentStep], () => {
  if (props.currentStep === props.ownStep) {
    addSingleParam('step', props.ownStep)
  }
  model.value = true
  if (dealId.value) {
    return
  }
}, { immediate: true })

const showOptionOrPayment = computed(() => {
  return checkedOption.value ? 0 : 1
})
watch(checkedOption, (value) => {
  addSingleParam('isoption', value)
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
