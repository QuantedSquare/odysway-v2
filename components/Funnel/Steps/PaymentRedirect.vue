<template>
  <v-container>
    <!-- Prévoir Promo form -->
    <v-card
      v-if="deal && deal.alreadyPaid < deal.value"
      variant="plain"
    >
      <v-card-text>
        <v-row>
          <v-col
            cols="12"
          >
            <template v-if="isBooking">
              <div class="text-start">
                {{ page.payment.ask_for_option_text }}
              </div>
            </template>
            <template v-else-if="route.query.type === 'deposit'">
              <v-switch
                v-model="checkedOption"
                inset
                hide-details
              >
                <template #label>
                  <div class="text-body-2 pl-1">
                    {{ page.payment.ask_for_option_text }}
                  </div>
                </template>
              </v-switch>
            </template>
          </v-col>
          <template v-if="!isBooking">
            <v-divider
              v-if="route.query.type === 'deposit'"
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
                    class="text-body-2 pl-1"
                    @click.stop=""
                    v-html="page.payment.phrase_dacceptation"
                  />
                </template>
              </v-switch>
              <v-switch
                v-model="switch_accept_country"
                inset
                hide-details
              >
                <template #label>
                  <div class="text-body-2 pl-1">
                    {{ page.payment.accept_country_conditions_text }}
                  </div>
                </template>
              </v-switch>
            </v-col>
          </template>
          <Transition name="list">
            <v-alert
              v-if="alreadyPlacedAnOption"
              color="error"
              variant="tonal"
            >
              {{ page.payment.option_already_placed_error }}
            </v-alert>
          </Transition>
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
                  :loading="loadingStripeSession"
                  :disabled="(!switch_accept_data_privacy || !switch_accept_country || alreadyPlacedAnOption)"
                  @click="book"
                >
                  {{ page.payment.place_option_button }}
                </v-btn>
                <v-btn
                  v-else
                  class="ml-md-4"
                  :loading="loadingStripeSession"
                  :disabled="(!switch_accept_data_privacy || !switch_accept_country)"
                  @click="stripePay"
                >
                  {{ page.payment.pay_button }}
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
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const alreadyPlacedAnOption = ref(false)
console.log('runtimeConfig', runtimeConfig)
const { deal, dealId, updateDeal } = useStepperDeal(props.ownStep)
const { addSingleParam } = useParams()

// New: Local validation state
const isValid = ref(false)
const emit = defineEmits(['validity-changed'])

// Data
// IsBooking à définir si une option dans le stepper uniquement pour poser une option
const isBooking = ref(route.query.type === 'booking')
const checkedOption = ref(route.query.type === 'booking')
const switch_accept_data_privacy = ref(route.query.type === 'booking')
const switch_accept_country = ref(route.query.type === 'booking')

const loadingStripeSession = ref(false)

// New: Form validation logic
const formValidation = computed(() => {
  if (isBooking.value) {
    return true // Booking mode is always valid
  }
  return switch_accept_data_privacy.value && switch_accept_country.value && !alreadyPlacedAnOption.value
})

// New: Watch validation and emit changes
watch(formValidation, (isFormValid) => {
  isValid.value = isFormValid
  emit('validity-changed', props.ownStep, isFormValid)
}, { immediate: true })

const stripePay = async () => {
  loadingStripeSession.value = true
  // Defined as metadata after payment is done
  const dataForStripeSession = {
    dealId: dealId.value,
    paymentType: route.query.type,
    contact: deal.value.contact,
    currentUrl: route.fullPath,
    insuranceImg: props.page.assurance_img,
    countries: deal.value.iso, // Used by chapka to know if it's a CAP-EXPLORACTION or CAP-EXPLORER
  }
  if (route.query.type === 'custom') {
    Object.assign(dataForStripeSession, {
      amount: +route.query.amount * 100,
    })
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
    console.log('checkoutLink =====> ', checkoutLink)

    trackPixel('trackCustom', 'ClickCB', { voyage: props.voyage.title })
    if (localStorage.getItem('consent') === 'granted') {
      trackPixel('track', 'InitiateCheckout', {
        currency: 'EUR',
        amount: +route.query.amount * 100,
      })
    }
    await navigateTo(checkoutLink, {
      external: true,
    })
  }
  loadingStripeSession.value = false
}

watch(checkedOption, (value) => {
  if (!value) {
    alreadyPlacedAnOption.value = false
  }
})

// Watch form fields for validation updates
watch([switch_accept_data_privacy, switch_accept_country, alreadyPlacedAnOption], () => {
  if (formValidation.value) {
    emit('validity-changed', props.ownStep, true)
  }
})

const book = async () => {
  loadingStripeSession.value = true

  const res = await fetch(`/api/v1/booking/booked_date/option`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: route.query.booked_id, booked_places: +deal.value.nbTravelers }),
  })
  const data = await res.json()
  console.log('data', data)
  if (data.error && data.error === 'La date est déjà réservée') {
    alreadyPlacedAnOption.value = true
    loadingStripeSession.value = false
    return
  }

  const dealData = {
    dealId: dealId.value,
    stage: '27',
    currentStep: 'A posé une option',
    title: props.voyage.title,
    nbTravelers: +deal.value.nbTravelers,
    firstName: deal.value.contact.firstName,
    lastName: deal.value.contact.lastName,
  }
  await updateDeal(dealData)
  // Check si on ajoute le payment link ici

  if (runtimeConfig.public.env === 'production') {
    await $fetch('/api/v1/slack/notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dealData),
    })
  }
  trackPixel('trackCustom', 'PoseOption', { voyage: props.voyage.title })
  await navigateTo(`/confirmation?voyage=${props.voyage.slug}&isoption=true`)
}

watch([dealId, () => props.currentStep], () => {
  if (props.currentStep === props.ownStep) {
    addSingleParam('step', props.ownStep)
  }
  if (dealId.value) {
    return
  }
}, { immediate: true })

// #TODO Add option only on certain travel ?
// const showOptionOrPayment = computed(() => {
//   return checkedOption.value ? 0 : 1
// })
watch(checkedOption, (value) => {
  addSingleParam('isoption', value)
})

const submitStepData = async () => {
  // Validate form
  if (!dealId.value || !isValid.value) return false
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
