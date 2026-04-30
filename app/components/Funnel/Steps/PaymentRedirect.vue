<template>
  <v-container class="pa-0 pa-sm-4">
    <v-card-text v-if="model && +voyage.alreadyPaid < +voyage.totalTravelPrice">
      <v-row v-if="route.query.type === 'balance'">
        <v-col class="text-center text-h6">
          Paiement du solde de votre voyage
        </v-col>
      </v-row>

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
            <h2>
              Finaliser ma réservation
            </h2>
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <!-- Option block (only when not already booked and type is deposit) -->
          <template v-if="isBooking && !isSurMesure">
            <div class="text-start">
              {{ page.payment.ask_for_option_text }}
            </div>
          </template>
          <template v-else-if="route.query.type === 'deposit' && !isSurMesure">
            <div
              class="option-block d-flex ga-4 align-start mb-4"
              @click="checkedOption = !checkedOption"
            >
              <v-checkbox
                v-model="checkedOption"
                hide-details
                density="compact"
                @click.stop
              />
              <span class="text-body-2">
                ⏳ <strong>Pas encore prêt ?</strong> Bloquez ce voyage <strong>gratuitement pendant 7 jours</strong>, sans engagement ni paiement.
              </span>
            </div>
          </template>
          <!-- <template v-else-if="isBooking && !isSurMesure">
            <p class="text-body-2 mb-4">
              {{ page.payment.ask_for_option_text }}
            </p>
          </template> -->

          <!-- Acceptances (only when not already booked) -->
          <template v-if="!isBooking && !checkedOption">
            <Transition name="hint-bubble">
              <div
                v-if="!switch_accept_data_privacy || !switch_accept_country"
                class="policy-hint-bubble"
                role="status"
              >
                <v-icon
                  :icon="mdiArrowDownBold"
                  size="16"
                  class="policy-hint-bubble__icon"
                />
                <span>Veuillez confirmer les conditions de vente avant de procéder au paiement</span>
              </div>
            </Transition>
            <v-divider class="my-3" />
            <v-switch
              v-model="switch_accept_data_privacy"
              inset
              color="success"
              hide-details
              class="custom-label-position"
              @click.stop=""
            >
              <template #label>
                <div
                  class="custom-font-switch  pl-1"
                  @click.stop=""
                  v-html="page.payment.phrase_dacceptation"
                />
              </template>
            </v-switch>
            <v-divider class="my-2" />
            <v-switch
              v-model="switch_accept_country"
              inset
              color="success"
              hide-details
              class="custom-label-position"
              @click.stop=""
            >
              <template #label>
                <div class="custom-font-switch pl-1 custom-line-height">
                  {{ page.payment.accept_country_conditions_text }}
                </div>
              </template>
            </v-switch>
            <v-divider class="mt-1 mb-5" />
          </template>
        </v-col>
      </v-row>

      <!-- Payment redirect loader -->
      <Transition name="list">
        <div
          v-if="redirectingToStripe || redirectingToAlma"
          class="d-flex flex-column align-center justify-center py-10 w-100"
        >
          <FunnelFlightProgress
            :loading="true"
            :text="redirectingToAlma ? 'Vous allez être redirigé vers notre partenaire Alma' : 'Vous allez être redirigé vers notre partenaire Stripe'"
          />
        </div>

        <div v-else>
          <ClientOnly>
            <Transition
              name="list"
              mode="out-in"
            >
              <!-- Option mode button -->
              <div
                v-if="checkedOption"
                key="option"
                class="d-flex flex-column ga-3"
              >
                <v-btn
                  color="primary"
                  class="font-weight-bold"
                  large
                  height="56"
                  block
                  :prepend-icon="mdiCalendarOutline"
                  :loading="loadingSession"
                  :disabled="alreadyPlacedAnOption"
                  @click="book"
                >
                  <span class="text-wrap text-body-1">
                    {{ page.payment.place_option_button }}
                  </span>
                </v-btn>
              </div>

              <!-- Payment buttons -->
              <div
                v-else
                key="pay"
                class="d-flex flex-column ga-3"
              >
                <!-- Stripe button -->
                <v-btn
                  height="56"
                  block
                  color="secondary"
                  class="font-weight-bold text-h5 custom-btn-shadow"
                  :loading="loadingSession"
                  @click="stripePay"
                >
                  🔒 {{ route.query.type === 'deposit' ? 'Régler mon acompte' : page.payment.pay_stripe_button }}
                </v-btn>

                <!-- Alma button -->
                <template v-if="isAlmaPaymentPossible">
                  <div class="d-flex align-center ga-2">
                    <v-divider />
                    <span class="custom-grey-font flex-shrink-0">ou</span>
                    <v-divider />
                  </div>

                  <v-btn-toggle
                    v-model="almaInstallments"
                    mandatory
                    color="primary"
                    density="comfortable"
                    divided
                    variant="outlined"
                    class="align-self-center ga-4"
                  >
                    <v-btn
                      :value="3"
                      variant="outlined"
                      color="secondary"
                      class="flex-grow-1 border-sm"
                    >
                      3x
                    </v-btn>
                    <v-btn
                      :value="4"
                      variant="outlined"
                      color="secondary"
                      class="flex-grow-1 border-sm"
                    >
                      4x
                    </v-btn>
                  </v-btn-toggle>

                  <div class="alma-schedule">
                    <button
                      type="button"
                      class="alma-schedule-toggle d-flex align-center justify-space-between w-100"
                      :aria-expanded="showAlmaSchedule"
                      @click="showAlmaSchedule = !showAlmaSchedule"
                    >
                      <span class="alma-schedule-title text-body-2 font-weight-medium">
                        Calendrier de paiement en {{ almaInstallments }} échéances
                      </span>
                      <v-icon
                        :icon="mdiChevronDown"
                        size="20"
                        class="alma-schedule-chevron"
                        :class="{ 'alma-schedule-chevron--open': showAlmaSchedule }"
                      />
                    </button>
                    <v-expand-transition>
                      <div v-show="showAlmaSchedule">
                        <div
                          v-for="(item, idx) in almaSchedule"
                          :key="idx"
                          class="alma-schedule-row d-flex justify-space-between align-center"
                          :class="{ 'alma-schedule-row--first': idx === 0 }"
                        >
                          <span>{{ item.label }}</span>
                          <span v-if="idx === 0 ">{{ formatEuros(item.amount + almaFees) }}</span>
                          <span v-else>{{ formatEuros(item.amount) }}</span>
                        </div>
                        <div class="alma-schedule-total d-flex justify-space-between align-center mt-2 pt-2">
                          <div class="d-flex flex-column">
                            <span class="text-body-2">Total</span>
                            <span class="text-caption text-grey">Dont frais</span>
                          </div>
                          <div class="d-flex flex-column align-end">
                            <span class="font-weight-bold">{{ formatEuros(+voyage.totalTravelPrice + +almaFees) }}</span>
                            <span class="text-grey text-subtitle-2 font-weight-regular">{{ formatEuros(almaFees) }}</span>
                          </div>
                        </div>
                      </div>
                    </v-expand-transition>
                  </div>

                  <v-btn
                    height="56"
                    block
                    variant="outlined"
                    color="secondary"
                    border="sm"
                    :loading="loadingSession"
                    @click="almaPay"
                  >
                    <span class="text-body-1 text-md-body-2 text-primary">Payer en {{ almaInstallments }} fois </span>
                    <v-divider
                      vertical
                      class="mx-2"
                    />
                    <div>
                      <img
                        src="/logos/ALMA.png"
                        height="25"
                        class="mt-1"
                      >
                    </div>
                  </v-btn>
                </template>
                <div
                  v-if="warningAcceptText"
                  class="text-secondary text-center"
                >
                  {{ warningAcceptText }}
                </div>
                <!-- Trust footer -->
                <div class="trust-footer mt-2">
                  <div class="d-flex align-center ga-1 mb-1">
                    &nbsp;&nbsp; 🔒 &nbsp;&nbsp;
                    <span class="text-caption text-grey">Paiement sécurisé</span>
                  </div>
                  <div class="d-flex align-center ga-2">
                    <img
                      src="/logos/ancv.png"
                      height="20"
                    >
                    <span class="text-caption text-grey">
                      Chèques vacances acceptés
                      <span class="text-grey-lighten-1">(valable pour le solde · nous contacter)</span>
                    </span>
                  </div>
                </div>
              </div>
            </Transition>
          </ClientOnly>
        </div>
      </Transition>

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

      <!-- Précédent -->
      <div
        v-if="route.query.type !== 'balance'"
        class="mt-4"
      >
        <v-btn
          class="bg-grey-light text-primary"
          block
          height="50"

          @click="emit('previous')"
        >
          ← PRÉCÉDENT
        </v-btn>
      </div>
    </v-card-text>
  </v-container>
</template>

<script setup>
import { mdiCalendarOutline, mdiChevronDown, mdiArrowDownBold } from '@mdi/js'
import { bookingApi, getApiErrorMessage } from '~/utils/bookingApi'

const { trackAddPaymentInfo, trackReservationPoseOption } = useGtmTracking()

const { page, ownStep, voyage } = defineProps(['page', 'voyage', 'currentStep', 'ownStep'])
const route = useRoute()
const config = useRuntimeConfig()
const alreadyPlacedAnOption = ref(false)
const redirectingToStripe = ref(false)
const redirectingToAlma = ref(false)

const emit = defineEmits(['previous'])
const model = defineModel()
const { updateDeal } = useStepperDeal(ownStep)
const { addSingleParam } = useParams()

const isSurMesure = computed(() => voyage.availabilityTypes?.includes('custom'))
const isBooking = ref(route.query.type === 'booking')
const checkedOption = ref(route.query.type === 'booking')
const switch_accept_data_privacy = ref(route.query.type === 'booking')
const switch_accept_country = ref(route.query.type === 'booking')
const warningAcceptText = ref(null)

const loadingSession = ref(false)
const almaInstallments = ref(3)
const showAlmaSchedule = ref(false)

const isAlmaPaymentPossible = computed(() => {
  if (!model.value) return false
  return route.query.type !== 'custom'
    && voyage.alreadyPaid === 0
    && voyage.totalTravelPrice < 400000
})
const almaFees = computed(() => {
  const total = +voyage.totalTravelPrice || 0
  if (almaInstallments.value === 3) {
    return Math.round(total * 0.0173)
  }
  if (almaInstallments.value === 4) {
    return Math.round(total * 0.0258)
  }
  return 0
})

const formatEuros = cents => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100)

const almaSchedule = computed(() => {
  const installments = almaInstallments.value
  const total = +voyage.totalTravelPrice || 0
  const base = Math.floor(total / installments)
  const remainder = total - base * installments
  const labelFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' })
  const today = new Date()
  return Array.from({ length: installments }, (_, i) => {
    const date = new Date(today)
    date.setMonth(date.getMonth() + i)
    return {
      label: i === 0 ? 'Aujourd\'hui' : labelFormatter.format(date),
      amount: i === installments - 1 ? base + remainder : base,
    }
  })
})

const stripePay = async () => {
  // User need to check the switches first
  if (!switch_accept_data_privacy.value || !switch_accept_country.value) {
    warningAcceptText.value = 'Veuillez confirmer les conditions de vente avant de procéder au paiement'
    return
  }
  else {
    warningAcceptText.value = null
  }
  loadingSession.value = true
  redirectingToStripe.value = true
  const contact = {
    firstName: model.value.firstName,
    lastName: model.value.lastName,
    email: model.value.email,
    phone: model.value.phone,
  }
  const dataForStripeSession = {
    paymentType: route.query.type,
    contact,
    currentUrl: route.fullPath,
    insuranceImg: page.assurance_img || 'https://odysway.com/images/default/chapka.png',
    countries: voyage.iso,
    booked_id: route.query.booked_id,
    departureDate: voyage.departureDate,
    returnDate: voyage.returnDate,
  }
  if (route.query.type === 'custom') {
    Object.assign(dataForStripeSession, { amount: +route.query.amount * 100 })
  }
  const checkoutLink = await $fetch(`/api/v1/stripe?bookedId=${route.query.booked_id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    await navigateTo(checkoutLink, { external: true })
  }
  else {
    redirectingToStripe.value = false
  }
  loadingSession.value = false
}

const almaPay = async () => {
  if (!switch_accept_data_privacy.value || !switch_accept_country.value) {
    warningAcceptText.value = 'Veuillez confirmer les conditions de vente avant de procéder au paiement'
    return
  }
  else {
    warningAcceptText.value = null
  }
  loadingSession.value = true
  redirectingToAlma.value = true
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
    installments: almaInstallments.value,
  }
  if (route.query.type === 'custom') {
    Object.assign(dataForAlmaSession, { amount: +route.query.amount * 100 })
  }
  const checkoutLink = await $fetch(`/api/v1/alma?bookedId=${route.query.booked_id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    await navigateTo(checkoutLink.url, { external: true })
  }
  else {
    redirectingToAlma.value = false
  }
  loadingSession.value = false
}

watch(checkedOption, (value) => {
  if (!value) alreadyPlacedAnOption.value = false
  addSingleParam('isoption', value)
})

const book = async () => {
  loadingSession.value = true
  try {
    await bookingApi.placeOption({ id: route.query.booked_id, booked_places: +model.value.nbAdults + +model.value.nbChildren })
  }
  catch (err) {
    if (getApiErrorMessage(err) === 'La date est déjà réservée') {
      alreadyPlacedAnOption.value = true
      loadingSession.value = false
      return
    }
    console.error(getApiErrorMessage(err, 'Erreur option'))
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
  if (config.public.environment === 'production') {
    await $fetch('/api/v1/slack/notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
</script>

<style scoped>
.option-block {
  background-color: rgba(43,76,82,0.04);
  border: 1.5px dashed rgba(43,76,82,0.2);
  border-radius: 10px;
  padding: 14px 16px;
  cursor: pointer;
}

.trust-footer {
  border-top: 1px solid rgba(0,0,0,0.08);
  padding-top: 12px;
}

.alma-schedule {
  background-color: rgba(0,0,0,0.02);
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 10px;
  padding: 14px 16px;
}
.alma-schedule-toggle {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: inherit;
}
.alma-schedule-chevron {
  transition: transform 0.25s ease;
}
.alma-schedule-chevron--open {
  transform: rotate(180deg);
}
.alma-schedule-row {
  padding: 8px 0;
  font-size: 14px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
.alma-schedule-row:nth-last-child(2) {
  border-bottom: none!important;

}
.alma-schedule-row--first {
  font-weight: 700;
}
.alma-schedule-total {
  border-top: 1px solid rgba(0,0,0,0.08);
}

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
    line-height: 10px !important;
  }
}
.text-body-2:deep() {
  line-height: 20px !important;
}
.custom-font-switch:deep(){
  font-size:13px;
}
.custom-font-switch:deep(a){
  color: rgb(var(--v-theme-primary));
  text-decoration: underline;
}
.custom-grey-font{
  text-align: center;
    font-size: 12px;
    color: #84989a;
    font-weight: bold;
}
.custom-vertical-divider{
  width:1px;
  height:25px;

  background-color:rgb(var(--v-theme-grey-light));
}
.custom-btn-shadow{
 box-shadow: 0 4px 14px rgba(219,102,68,0.35)!important;
}

.policy-hint-bubble {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  border-color: rgb(var(--v-theme-secondary));
  color: rgb(var(--v-theme-secondary));
  font-size: 13px;
  line-height: 1.35;
  padding: 10px 14px;
  border-radius: 12px;
  margin: 8px 0 14px;
  box-shadow: 0 4px 14px rgba(219,102,68,0.25);
}
.policy-hint-bubble::after {
  content: '';
  position: absolute;
  left: 28px;
  bottom: -6px;
  width: 14px;
  height: 14px;
  background-color: white;
  transform: rotate(45deg);
  border-radius: 2px;
}
.policy-hint-bubble__icon {
  flex-shrink: 0;
}

.hint-bubble-enter-active,
.hint-bubble-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.hint-bubble-enter-from,
.hint-bubble-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
