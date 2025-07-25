<template>
  <v-container
    fluid
    class="pa-0 ma-0"
  >
    <v-card
      elevation="0"
      rounded="xl"
      class="text-grey-darken-2 pb-6"
    >
      <v-img
        v-if="voyage.imgSrc"
        class="d-none d-md-flex text-white "
        height="140"
        width="100%"
        :src="voyage.imgSrc"
        :lazy-src="voyage.imgSrc"
        :alt="`Paysage de destination pour le voyage ${voyage?.title}`"
        cover
      >
        <v-container class=" d-flex flex-column justify-center">
          <div class="pa-lg-2  d-flex flex-column align-start">
            <span class="text-h5 text-shadow-2 ">Récapitulatif de votre voyage</span>
            <span class="text-body-1 mb-2 text-shadow-2">{{ voyage.title }}</span>
            <span class="text-body-2 text-shadow-2">{{ model?.travelType || voyage.travelType }}</span>
          </div>
        </v-container>
      </v-img>

      <v-skeleton-loader
        v-if="!model"
        type="card"
      />
      <v-card-text
        v-else
        class="px-5 text-body-1"
      >
        <!-- Dates Section -->
        <FunnelStepsSummaryLine v-if="voyage.departureDate && voyage.returnDate">
          <template #left>
            <span class="text-h6 ">{{ page.summary.dates_confirmed }}</span>
          </template>
          <template #right>
            {{ dayjs(voyage.departureDate).format('DD/MM/YYYY') }} au {{ dayjs(voyage.returnDate).format('DD/MM/YYYY') }}
          </template>
        </FunnelStepsSummaryLine>

        <!-- Base Price Section -->
        <FunnelStepsSummaryLine v-if="voyage.startingPrice">
          <template #left>
            {{ page.summary.base_price }}
          </template>
          <template #right>
            <div v-if="!voyage.gotEarlybird && !voyage.gotLastMinute">
              {{ formatNumber(+voyage.startingPrice + (voyage.includeFlight ? +voyage.flightPrice : 0), 'currency', 'EUR') }}
            </div>
            <div v-else>
              <div class="d-flex flex-column align-end">
                <span class="d-flex flex-column flex-md-row align-end">
                  <v-badge
                    inline
                    color="info"
                    :content="voyage.gotEarlybird ? page.summary.early_bird_badge + formatNumber(voyage.promoEarlybird, 'currency', '€') : page.summary.last_minute_badge + formatNumber(voyage.promoLastMinute, 'currency', '€')"
                  />
                  {{ formatNumber(voyage.startingPrice + voyage.flightPrice - (voyage.gotEarlybird ? voyage.promoEarlybird : voyage.promoLastMinute), 'currency', 'EUR') }}
                </span>
                <span class="text-decoration-line-through">
                  {{ formatNumber(voyage.startingPrice + voyage.flightPrice, 'currency', 'EUR') }}
                </span>
              </div>
            </div>
          </template>
        </FunnelStepsSummaryLine>

        <!-- Extension Price Section -->
        <FunnelStepsSummaryLine v-if="voyage.extensionPrice > 0">
          <template #left>
            {{ page.summary.extension_price }}
          </template>
          <template #right>
            {{ formatNumber(voyage.extensionPrice, 'currency', 'EUR') }}
          </template>
        </FunnelStepsSummaryLine>

        <v-divider class="my-6" />

        <!-- Travelers Details Header -->
        <FunnelStepsSummaryLine>
          <template #left>
            <span class="text-h6 ">{{ page.summary.travelers_details }}</span>
          </template>
        </FunnelStepsSummaryLine>

        <!-- Adult Travelers -->
        <FunnelStepsSummaryLine v-if="model.nbAdults > 0">
          <template #left>
            {{ travelerText(+model.nbAdults, 'adult') }}
          </template>
          <template #right>
            {{ formatNumber(adultPricePerTraveler * model.nbAdults, 'currency', 'EUR') }}
          </template>
        </FunnelStepsSummaryLine>

        <!-- Under Age Travelers -->
        <FunnelStepsSummaryLine v-if="model.nbChildren > 0">
          <template #left>
            {{ travelerText(+model.nbChildren, 'baby') }}
          </template>
          <template #right>
            {{ formatNumber(underAgePricePerTraveler * model.nbChildren, 'currency', 'EUR') }}
          </template>
        </FunnelStepsSummaryLine>

        <v-divider
          v-if="forceIndivRoom || model.indivRoom && +voyage.indivRoomPrice > 0"
          class="my-6"
        />

        <!--  Options -->
        <FunnelStepsSummaryLine v-if="forceIndivRoom || model.indivRoom && +voyage.indivRoomPrice > 0">
          <template #left>
            <span class="text-h6 ">{{ page.summary.options_title }}</span>
          </template>
        </FunnelStepsSummaryLine>

        <!-- Chambre individuelle -->
        <FunnelStepsSummaryLine v-if="forceIndivRoom || model.indivRoom && +voyage.indivRoomPrice > 0">
          <template #left>
            <v-tooltip
              v-if="forceIndivRoom"
              bottom
              :aria-label="page.summary.forced_indiv_room_text"
            >
              <template #activator="{ props }">
                <div class="d-flex align-center ga-2">
                  <span>{{ travelerText(+nbTravelers, 'indivRoom') }}</span>
                  <v-icon
                    size="x-small"
                    v-bind="props"
                  >
                    {{ mdiInformationOutline }}
                  </v-icon>
                </div>
              </template>
              <div>
                {{ page.summary.forced_indiv_room_text }}
              </div>
            </v-tooltip>
            <span v-else>
              {{ travelerText(+nbTravelers, 'indivRoom') }}
            </span>
          </template>
          <template #right>
            {{ formatNumber(voyage.indivRoomPrice * nbTravelers, 'currency', 'EUR') }}
          </template>
        </FunnelStepsSummaryLine>

        <!-- Assurance -->
        <FunnelStepsSummaryLine v-if="model.insurance && model.insuranceCommissionPrice > 0 && (Array.isArray(model.insurance) ? model.insurance.length > 0 && model.insurance[0] !== 'Aucune Assurance' : model.insurance !== 'Aucune Assurance')">
          <template #left>
            {{ travelerText(+nbTravelers, 'insurance') }}
          </template>
          <template #right>
            {{ formatNumber(model.insuranceCommissionPrice * nbTravelers, 'currency', 'EUR') }}
          </template>
        </FunnelStepsSummaryLine>

        <v-divider
          v-if="voyage.promoValue > 0"
          class="my-6"
        />

        <!-- Promo -->
        <FunnelStepsSummaryLine v-if="voyage.promoValue > 0">
          <template #left>
            {{ page.summary.total_discount }}
          </template>
          <template #right>
            -{{ formatNumber(voyage.promoValue * nbTravelers, 'currency', 'EUR') }}
          </template>
        </FunnelStepsSummaryLine>

        <v-divider class="my-6" />

        <!-- Somme déjà réglé -->
        <FunnelStepsSummaryLine v-if="model.alreadyPaid && model.alreadyPaid > 0">
          <template #left>
            {{ page.summary.already_paid }}
          </template>
          <template #right>
            <span class="font-weight-bold ">
              {{ formatNumber(model.alreadyPaid, 'currency', 'EUR') }}
            </span>
          </template>
        </FunnelStepsSummaryLine>

        <!-- Prix Total -->
        <FunnelStepsSummaryLine>
          <template #left>
            {{ page.summary.total_price }}
          </template>
          <template #right>
            <span class="font-weight-bold ">
              {{ formatNumber(totalValue, 'currency', 'EUR') }}
            </span>
          </template>
        </FunnelStepsSummaryLine>

        <!-- Prix Appliqué à régler -->
        <Transition name="slide-fade">
          <FunnelStepsSummaryLine v-if="route.query.isoption !== 'true'">
            <template #left>
              <v-tooltip
                bottom
                :aria-label="page.summary.cancel_text"
              >
                <template #activator="{ props }">
                  <div
                    v-if="appliedPrice > 0"
                    class="d-flex align-center ga-2 text-primary"
                  >
                    <span v-if="route.query.type === 'deposit'">{{ page.summary.deposit_due }}</span>
                    <span v-else-if="route.query.type === 'balance'">{{ page.summary.balance_due }}</span>
                    <span v-else>{{ page.summary.amount_due }}</span>
                    <v-icon
                      size="x-small"
                      v-bind="props"
                    >
                      {{ mdiInformationOutline }}
                    </v-icon>
                  </div>
                  <div v-else-if="voyage.totalTravelPrice < voyage.alreadyPaid">
                    {{ page.summary.already_paid_full }}
                  </div>
                </template>
                <div>
                  {{ page.summary.cancel_text }}
                </div>
              </v-tooltip>
            </template>
            <template #right>
              <span
                class="font-weight-bold text-primary"
              >
                {{ appliedPrice > 0 ? formatNumber(appliedPrice, 'currency', 'EUR') : '-' }}
              </span>
            </template>
          </FunnelStepsSummaryLine>
        </Transition>

        <!-- Full payment required notice -->
        <FunnelStepsSummaryLine v-if="route.query.type === 'full'">
          <template #left>
            <span class="font-italic text-body-2 ">{{ page.summary.full_payment_required }}</span>
          </template>
        </FunnelStepsSummaryLine>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import dayjs from 'dayjs'
import { mdiInformationOutline } from '@mdi/js'
import formatNumber from '@/utils/formatNumber'

const { voyage, page } = defineProps(['voyage', 'page'])
const route = useRoute()
const model = defineModel()

// Get forceIndivRoom from voyage
const forceIndivRoom = computed(() => {
  return voyage?.forcedIndivRoom || false
})

// Calculate prices per traveler
const adultPricePerTraveler = computed(() => {
  if (!model.value || !voyage) return 0

  let basePrice = voyage.startingPrice || 0

  if (voyage.extensionPrice) {
    basePrice += voyage.extensionPrice
  }
  if (voyage.includeFlight && voyage.flightPrice) {
    basePrice += voyage.flightPrice
  }

  // Apply early bird or last minute discounts
  if (voyage.gotEarlybird && voyage.promoEarlybird) {
    basePrice -= voyage.promoEarlybird
  }
  else if (voyage.gotLastMinute && voyage.promoLastMinute) {
    basePrice -= voyage.promoLastMinute
  }

  return basePrice
})

const underAgePricePerTraveler = computed(() => {
  if (!model.value || !voyage) return 0

  let basePrice = voyage.startingPrice || 0

  // Apply children discount
  if (voyage.promoChildren) {
    basePrice -= voyage.promoChildren
  }
  if (voyage.extensionPrice) {
    basePrice += voyage.extensionPrice
  }
  if (voyage.includeFlight && voyage.flightPrice) {
    basePrice += voyage.flightPrice
  }

  // Apply early bird or last minute discounts
  if (voyage.gotEarlybird && voyage.promoEarlybird) {
    basePrice -= voyage.promoEarlybird
  }
  else if (voyage.gotLastMinute && voyage.promoLastMinute) {
    basePrice -= voyage.promoLastMinute
  }

  return basePrice
})
const nbTravelers = computed(() => {
  return model.value.nbAdults + model.value.nbChildren || 0
})
// Calculate total value dynamically
const totalValue = computed(() => {
  if (!model.value || !voyage) return 0

  const nbTravelers = model.value.nbAdults + model.value.nbChildren || 0
  const nbAdults = model.value.nbAdults || 0
  const nbUnderAge = model.value.nbChildren || 0
  let total = 0

  // Base price for adults
  total += adultPricePerTraveler.value * nbAdults
  // Base price for under age travelers
  total += underAgePricePerTraveler.value * nbUnderAge

  // Individual room cost
  if (model.value.indivRoom && voyage.indivRoomPrice) {
    total += voyage.indivRoomPrice * nbTravelers
  }

  // Insurance cost
  if (model.value.insuranceCommissionPrice) {
    total += model.value.insuranceCommissionPrice * nbTravelers
  }

  // Apply promo value discount
  if (voyage.promoValue) {
    total -= voyage.promoValue * nbTravelers
  }
  return total
})

function travelerText(nbTraveler, type) {
  const text = {
    adult: {
      single: 'Voyageur Adulte',
      multiple: 'Voyageurs Adultes',
    },
    child: {
      single: 'Voyageur Adolescent',
      multiple: 'Voyageurs Adolescents',
    },
    baby: {
      single: 'Voyageur Enfant',
      multiple: 'Voyageurs Enfants',
    },
    indivRoom: {
      single: 'Chambre Individuelle',
      multiple: 'Chambres Individuelles',
    },
    insurance: {
      single: 'Assurance ' + (Array.isArray(model.value?.insurance) ? model.value?.insurance[0] || '' : model.value?.insurance || ''),
      multiple: 'Assurance ' + (Array.isArray(model.value?.insurance) ? model.value?.insurance[0] || '' : model.value?.insurance || ''),
    },
  }

  if (nbTraveler > 1) {
    return `${nbTraveler} x ${text[type].multiple}`
  }
  else {
    return `${nbTraveler} x ${text[type].single}`
  }
}

// function calculatDepositeValue(data) {
//     // WE take the total value of the deal, we substract the flight price and the insurance price
//     const baseToCalculateDepositValue = +data.value - ((data.includeFlight ? data.flightPrice : 0) * data.nbTravelers) - ((data.insuranceCommissionPrice ?? 0) * data.nbTravelers)
//     // We take 30% of the baseToCalculateDepositValue (which include options and reduction) and add the flight price if it's included
//     // Insurance is added in another line item
//     return Math.floor((baseToCalculateDepositValue) * 0.3 + (data.includeFlight ? data.flightPrice : 0) * data.nbTravelers)
//   }

function calculateDepositValue(data) {
  const nbTravelers = data.nbAdults + data.nbChildren || 0
  const baseToCalculateDepositValue = +totalValue.value - ((data.includeFlight ? data.flightPrice : 0) * nbTravelers) - ((data.insuranceCommissionPrice ?? 0) * nbTravelers)
  return Math.floor((baseToCalculateDepositValue) * 0.3 + (data.includeFlight ? data.flightPrice : 0) * nbTravelers) + ((data.insuranceCommissionPrice ?? 0) * nbTravelers)
}

const appliedPrice = computed(() => {
  if (!model.value) return 0

  if (model.value.alreadyPaid >= totalValue.value) {
    return 0
  }
  else {
    if (route.query.type === 'deposit') {
      return calculateDepositValue(model.value)
    }
    else if (route.query.type === 'balance') {
      return totalValue.value - model.value.alreadyPaid
    }
    else if (route.query.type === 'full') {
      return totalValue.value - model.value.alreadyPaid
    }
    else { // type = 'custom'
      return route.query.amount * 100
    }
  }
})
defineExpose({
  totalValue,
})
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
.text-shadow-2{
  text-shadow: 0px 0px 5px rgba(0, 0, 0, 1);
}
</style>
