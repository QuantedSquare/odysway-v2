<template>
  <v-container>
    <v-card-text v-if="model && +voyage.alreadyPaid < +voyage.totalTravelPrice">
      <v-row>
        <!-- Summary column (inline) -->
        <v-col
          cols="12"
          md="7"
        >
          <v-expansion-panels
            v-model="summaryPanel"
            class="d-md-none mb-4"
          >
            <v-expansion-panel>
              <v-expansion-panel-title class="font-weight-bold">
                Recapitulatif de votre voyage
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <FunnelStepsSummary
                  v-model="localModel"
                  :current-step="currentStep"
                  :page="page"
                  :voyage="voyage"
                  :own-step="4"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <div class="d-none d-md-block">
            <FunnelStepsSummary
              v-model="localModel"
              :current-step="currentStep"
              :page="page"
              :voyage="voyage"
              :own-step="4"
            />
          </div>
        </v-col>

        <!-- Payment column -->
        <v-col
          cols="12"
          md="5"
        >
          <!-- Terms -->
          <template v-if="!isBooking">
            <v-checkbox
              v-model="switch_accept_data_privacy"
              hide-details
              class="mb-2"
            >
              <template #label>
                <div
                  class="text-body-2 pl-1"
                  @click.stop=""
                  v-html="page.payment.phrase_dacceptation"
                />
              </template>
            </v-checkbox>
            <v-checkbox
              v-model="switch_accept_country"
              hide-details
              class="mb-4"
            >
              <template #label>
                <div class="text-body-2 pl-1">
                  {{ page.payment.accept_country_conditions_text }}
                </div>
              </template>
            </v-checkbox>
          </template>

          <!-- Option toggle -->
          <template v-if="isBooking">
            <div class="text-start mb-4">
              {{ page.payment.ask_for_option_text }}
            </div>
          </template>
          <template v-else-if="route.query.type === 'deposit'">
            <v-switch
              v-model="checkedOption"
              inset
              hide-details
              class="custom-label-position mb-4"
              @click.stop=""
            >
              <template #label>
                <div class="text-body-2 pl-1">
                  {{ page.payment.ask_for_option_text }}
                </div>
              </template>
            </v-switch>
          </template>

          <!-- Payment Buttons -->
          <ClientOnly>
            <Transition name="list">
              <v-btn
                v-if="checkedOption"
                block
                height="56"
                rounded="lg"
                :prepend-icon="mdiCalendarOutline"
                :loading="loadingSession"
                :disabled="(!switch_accept_data_privacy || !switch_accept_country || alreadyPlacedAnOption)"
                class="text-body-1 font-weight-bold mb-3"
                aria-label="Poser une option"
                @click="book"
              >
                <span class="text-wrap">
                  {{ page.payment.place_option_button }}
                </span>
              </v-btn>
              <div
                v-else
                class="d-flex flex-column ga-3"
              >
                <v-btn
                  block
                  height="56"
                  rounded="lg"
                  :prepend-icon="mdiCreditCardOutline"
                  class="bg-secondary font-weight-bold text-body-1"
                  :loading="loadingSession"
                  :disabled="(!switch_accept_data_privacy || !switch_accept_country)"
                  aria-label="Payer par carte"
                  @click="stripePay"
                >
                  <span class="text-wrap">
                    {{ page.payment.pay_stripe_button }}
                  </span>
                </v-btn>

                <v-btn
                  v-if="isAlmaPaymentPossible"
                  block
                  height="56"
                  rounded="lg"
                  variant="outlined"
                  :prepend-icon="mdiCreditCardClockOutline"
                  :loading="loadingSession"
                  :disabled="(!switch_accept_data_privacy || !switch_accept_country)"
                  class="font-weight-bold text-body-1"
                  aria-label="Payer en 3 fois sans frais"
                  @click="almaPay"
                >
                  {{ page.payment.pay_alma_button }}
                </v-btn>
              </div>
            </Transition>

            <div
              v-if="voyage.totalTravelPrice > 400000 && !checkedOption"
              class="text-caption mt-2 text-center"
            >
              {{ page.payment.alma_payment_info }}
            </div>
          </ClientOnly>

          <!-- Trust badges -->
          <div class="d-flex align-center justify-center ga-4 mt-6 text-caption text-grey">
            <div class="d-flex align-center ga-1">
              <v-icon
                :icon="mdiLock"
                size="small"
              />
              <span>Paiement 100% securise</span>
            </div>
          </div>

          <!-- Already placed option error -->
          <Transition name="list">
            <v-alert
              v-if="alreadyPlacedAnOption"
              class="text-center mt-4"
              color="error"
              variant="tonal"
            >
              {{ page.payment.option_already_placed_error }}
            </v-alert>
          </Transition>

          <!-- Back button -->
          <div
            v-if="route.query.type !== 'balance'"
            class="d-flex justify-start mt-6"
          >
            <v-btn
              class="bg-grey-light"
              aria-label="Retour a l'etape precedente"
              @click="emit('previous')"
            >
              Retour
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-container>
</template>

<script setup>
import { mdiCreditCardOutline, mdiCreditCardClockOutline, mdiCalendarOutline, mdiLock } from '@mdi/js'
import { bookingApi, getApiErrorMessage } from '~/utils/bookingApi'

const { trackAddPaymentInfo, trackReservationPoseOption } = useGtmTracking()

const { page, currentStep, ownStep, voyage } = defineProps(['page', 'voyage', 'currentStep', 'ownStep'])
const route = useRoute()
const config = useRuntimeConfig()
const alreadyPlacedAnOption = ref(false)

const emit = defineEmits(['previous'])
const model = defineModel()
const localModel = computed({
  get: () => model.value,
  set: () => {},
})
const { updateDeal } = useStepperDeal(ownStep)
const { addSingleParam } = useParams()

const isBooking = ref(route.query.type === 'booking')
const checkedOption = ref(route.query.type === 'booking')
const switch_accept_data_privacy = ref(route.query.type === 'booking')
const switch_accept_country = ref(route.query.type === 'booking')

const loadingSession = ref(false)
const summaryPanel = ref(0) // Expanded by default on mobile

const isAlmaPaymentPossible = computed(() => {
  if (!model.value) return false

  return route.query.type !== 'custom'
    && voyage.alreadyPaid === 0
    && voyage.totalTravelPrice < 400000
})

const stripePay = async () => {
  loadingSession.value = true
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
    insuranceImg: page.assurance_img || 'https://odysway.com/images/default/chapka.png',
    countries: voyage.iso,
    booked_id: route.query.booked_id,
    departureDate: voyage.departureDate,
    returnDate: voyage.returnDate,
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
    const { getCountryFromPhone } = useGtmTracking()
    const userData = {
      user_id: model.value.email,
      user_mail: model.value.email,
      user_phone: model.value.phone,
      user_country: getCountryFromPhone(model.value.phone) || 'Unknown',
    }
    trackAddPaymentInfo(voyage, model.value, 'stripe', userData)

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
    insuranceImg: page.assurance_img || 'https://odysway.com/images/default/chapka.png',
    countries: voyage.iso,
    departureDate: voyage.departureDate,
    returnDate: voyage.returnDate,
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
    const { getCountryFromPhone } = useGtmTracking()
    const userData = {
      user_id: model.value.email,
      user_mail: model.value.email,
      user_phone: model.value.phone,
      user_country: getCountryFromPhone(model.value.phone) || 'Unknown',
    }
    trackAddPaymentInfo(voyage, model.value, 'alma', userData)

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

  try {
    await bookingApi.placeOption({ id: route.query.booked_id, booked_places: +model.value.nbAdults + +model.value.nbChildren })
  }
  catch (err) {
    if (getApiErrorMessage(err) === 'La date est deja reservee') {
      alreadyPlacedAnOption.value = true
      loadingSession.value = false
      return
    }
    console.error(getApiErrorMessage(err, 'Erreur option'))
  }

  const dealData = {
    stage: '27',
    currentStep: 'A pose une option',
    title: voyage.title,
    nbTravelers: +model.value.nbAdults + +model.value.nbChildren,
    firstName: model.value.firstName,
    lastName: model.value.lastName,
  }

  updateDeal(dealData)

  if (config.public.environment === 'production') {
    await $fetch('/api/v1/slack/notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dealData),
    })
  }

  const { getCountryFromPhone } = useGtmTracking()
  const userData = {
    user_id: model.value.email,
    user_mail: model.value.email,
    user_phone: model.value.phone,
    user_country: getCountryFromPhone(model.value.phone) || 'Unknown',
  }
  trackReservationPoseOption(voyage, model.value, userData)

  await navigateTo(`/confirmation?voyage=${voyage.slug}&isoption=true`)
}

watch(checkedOption, (value) => {
  addSingleParam('isoption', value)
})
</script>

<style scoped>
.list-move,
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
