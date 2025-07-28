<template>
  <v-container>
    <!-- Prévoir Promo form -->

    <v-card-text v-if="model && +voyage.alreadyPaid < +voyage.totalTravelPrice">
      <v-row>
        <v-col cols="12">
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
              class="custom-label-position"
              @click.stop=""
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
              class="custom-label-position"
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
              class="custom-label-position"
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

        <!-- Replace btn "Suivant" in parent -->
        <v-row>
          <v-col
            cols="12"
            class="d-flex flex-column align-center justify-center my-6"
          >
            <ClientOnly>
              <Transition name="list">
                <v-btn
                  v-if="checkedOption"
                  class=" text-caption text-uppercase font-weight-bold text-md-body-1"
                  large
                  height="50"
                  :prepend-icon="mdiCalendarOutline"
                  :loading="loadingSession"
                  :disabled="(!switch_accept_data_privacy || !switch_accept_country || alreadyPlacedAnOption)"
                  @click="book"
                >
                  <span class="text-wrap">
                    {{ page.payment.place_option_button }}
                  </span>
                </v-btn>
                <div
                  v-else
                  class="d-flex flex-column flex-md-row ga-2 flex-wrap justify-center "
                >
                  <v-btn
                    height="50"
                    :prepend-icon="mdiCreditCardOutline"
                    class="bg-secondary "
                    :loading="loadingSession"
                    :disabled="(!switch_accept_data_privacy || !switch_accept_country)"
                    @click="stripePay"
                  >
                    <span class="text-wrap">
                      {{ page.payment.pay_stripe_button }}
                    </span>
                  </v-btn>

                  <v-btn
                    v-if="isAlmaPaymentPossible"
                    height="50"
                    :prepend-icon="mdiCreditCardClockOutline"
                    :loading="loadingSession"
                    :disabled="(!switch_accept_data_privacy || !switch_accept_country)"
                    @click="almaPay"
                  >
                    {{ page.payment.pay_alma_button }}
                  </v-btn>
                </div>
              </Transition>
              <div
                v-if="voyage.totalTravelPrice > 400000 && !checkedOption"
                class="text-caption mt-2"
              >
                {{ page.payment.alma_payment_info }}
              </div>
            </ClientOnly>
          </v-col>
          <Transition name="list">
            <v-col
              v-if="alreadyPlacedAnOption"
              cols="12"
            >
              <v-alert
                class="text-center"
                color="error"
                variant="tonal"
              >
                {{ page.payment.option_already_placed_error }}
              </v-alert>
            </v-col>
          </Transition>
          <v-col
            cols="12"
            class="d-flex justify-space-between align-end"
          >
            <v-btn
              v-if="currentStep === 5"
              class="bg-grey-light"
              @click="emit('previous')"
            >
              Retour
            </v-btn>
          </v-col>
        </v-row>
      </v-row>
    </v-card-text>
  </v-container>
</template>

<script setup>
import { mdiCreditCardOutline, mdiCreditCardClockOutline, mdiCalendarOutline } from '@mdi/js'

const { page, currentStep, ownStep, voyage } = defineProps(['page', 'voyage', 'currentStep', 'ownStep'])
const route = useRoute()
const config = useRuntimeConfig()
const alreadyPlacedAnOption = ref(false)

const emit = defineEmits(['previous'])
const model = defineModel()
const { updateDeal } = useStepperDeal(ownStep)
const { addSingleParam } = useParams()
console.log('....', +voyage.alreadyPaid, +voyage.totalTravelPrice)
// Data
// IsBooking à définir si une option dans le stepper uniquement pour poser une option
const isBooking = ref(route.query.type === 'booking')
const checkedOption = ref(route.query.type === 'booking')
const switch_accept_data_privacy = ref(route.query.type === 'booking')
const switch_accept_country = ref(route.query.type === 'booking')

const loadingSession = ref(false)

const isAlmaPaymentPossible = computed(() => {
  if (!model.value) return false

  return route.query.type !== 'custom'
    && voyage.alreadyPaid === 0
    && voyage.totalTravelPrice < 400000
})

const stripePay = async () => {
  loadingSession.value = true
  // Defined as metadata after payment is done
  const contact = {
    firstName: model.value.firstName,
    lastName: model.value.lastName,
    email: model.value.email,
    phone: model.value.phone,
  }
  const dataForStripeSession = {
    paymentType: route.query.type,
    contact: contact,
    currentUrl: route.fullPath,
    insuranceImg: page.assurance_img,
    countries: voyage.iso, // Used by chapka to know if it's a CAP-EXPLORACTION or CAP-EXPLORER
  }
  if (route.query.type === 'custom') {
    Object.assign(dataForStripeSession, {
      amount: +route.query.amount * 100,
    })
  }
  const checkoutLink = await $fetch(`/api/v1/stripe?bookedId=${route.query.booked_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dataForStripeSession),
  })

  if (checkoutLink) {
    trackPixel('trackCustom', 'ClickCB', { voyage: voyage.title })
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
  loadingSession.value = false
}

const almaPay = async () => {
  loadingSession.value = true

  const dataForAlmaSession = {
    paymentType: route.query.type,
    contact: {
      firstName: model.value.firstName,
      lastName: model.value.lastName,
      email: model.value.email,
      phone: model.value.phone,
    },
    currentUrl: route.fullPath,
    insuranceImg: page.assurance_img || '/images/default/chapka.png',
    countries: voyage.iso, // Used by chapka to know if it's a CAP-EXPLORACTION or CAP-EXPLORER
  }

  if (route.query.type === 'custom') {
    Object.assign(dataForAlmaSession, {
      amount: +route.query.amount * 100,
    })
  }

  const checkoutLink = await $fetch(`/api/v1/alma?bookedId=${route.query.booked_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dataForAlmaSession),
  })

  if (checkoutLink.url) {
    trackPixel('trackCustom', 'ClickAlma', { voyage: voyage.title })
    if (localStorage.getItem('consent') === 'granted') {
      trackPixel('track', 'InitiateCheckout', {
        currency: 'EUR',
        amount: +route.query.amount * 100,
      })
    }
    await navigateTo(checkoutLink.url, {
      external: true,
    })
  }
  loadingSession.value = false
}

watch(checkedOption, (value) => {
  if (!value) {
    alreadyPlacedAnOption.value = false
  }
})

const book = async () => {
  loadingSession.value = true

  const res = await fetch(`/api/v1/booking/booked_date/option`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: route.query.booked_id, booked_places: +model.value.nbAdults + +model.value.nbChildren }),
  })
  const data = await res.json()

  if (data.error && data.error === 'La date est déjà réservée') {
    alreadyPlacedAnOption.value = true
    loadingSession.value = false
    return
  }

  const dealData = {
    stage: '27',
    currentStep: 'A posé une option',
    title: voyage.title,
    nbTravelers: +model.value.nbAdults + +model.value.nbChildren,
    firstName: model.value.firstName,
    lastName: model.value.lastName,
  }

  updateDeal(dealData)
  // Check si on ajoute le payment link ici

  if (config.public.environment === 'production') {
    await $fetch('/api/v1/slack/notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dealData),
    })
    trackPixel('trackCustom', 'PoseOption', { voyage: voyage.title })
  }
  await navigateTo(`/confirmation?voyage=${voyage.slug}&isoption=true`)
}

watch(checkedOption, (value) => {
  addSingleParam('isoption', value)
})
</script>

<style scoped>
.list-move,
/* apply transition to moving elements */
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

@media screen and (max-width: 370px) {
  .custom-label-position:deep(.v-selection-control) {
    display: flex;
    flex-direction: column;
  }
}
</style>
