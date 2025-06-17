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
      <Transition name="fade">
        <v-img
          v-if="voyage.imgSrc"
          color="surface-variant"
          class="blur"
          height="150"
          :src="voyage.imgSrc"
          :lazy-src="voyage.imgSrc"
          cover
        >
          <div class="pa-8  d-flex flex-column align-start">
            <span class="text-h5 text-shadow-2">{{ voyage.title }}</span>
            <span class="text-body-1 text-shadow-2">{{ deal?.travelType }}</span>
          </div>
        </v-img>
      </Transition>
      <v-skeleton-loader
        v-if="!deal"
        type="card"
      />
      <v-card-text
        v-else
        class="px-5 text-body-1"
      >
        <!-- Dates Section -->
        <FunnelStepsSummaryLine v-if="deal.departureDate && deal.returnDate">
          <template #left>
            <span class="text-h6 ">{{ summary.dates_confirmed }}</span>
          </template>
          <template #right>
            {{ dayjs(deal.departureDate).format('DD/MM/YYYY') }} au {{ dayjs(deal.returnDate).format('DD/MM/YYYY') }}
          </template>
        </FunnelStepsSummaryLine>

        <!-- Base Price Section -->
        <FunnelStepsSummaryLine v-if="deal.value">
          <template #left>
            Prix de base par voyageur
          </template>
          <template #right>
            <div v-if="deal.gotEarlybird !== 'Oui' && deal.gotLastMinute !== 'Oui'">
              {{ formatNumber(deal.basePricePerTraveler, 'currency', 'EUR') }}
            </div>
            <div v-else>
              <div class="d-flex flex-column align-end">
                <span class="d-flex flex-column flex-md-row align-end">
                  <v-badge
                    inline
                    color="info"
                    :content="deal.gotEarlybird == 'Oui' ? 'EarlyBird: -' + formatNumber(deal.promoEarlybird, 'currency', '€') : 'LastMinute: -' + formatNumber(deal.promoLastMinute, 'currency', '€')"
                  />
                  {{ formatNumber(deal.basePricePerTraveler - (deal.gotEarlybird == 'Oui' ? deal.promoEarlybird : deal.promoLastMinute), 'currency', 'EUR') }}
                </span>
                <span class="text-decoration-line-through">
                  {{ formatNumber(deal.basePricePerTraveler, 'currency', 'EUR') }}
                </span>
              </div>
            </div>
          </template>
        </FunnelStepsSummaryLine>

        <!-- Extension Price Section -->
        <FunnelStepsSummaryLine v-if="deal.extensionPrice > 0">
          <template #left>
            Prix extension voyage
          </template>
          <template #right>
            {{ formatNumber(deal.extensionPrice, 'currency', 'EUR') }}
          </template>
        </FunnelStepsSummaryLine>

        <v-divider class="my-6" />

        <!-- Travelers Details Header -->
        <FunnelStepsSummaryLine>
          <template #left>
            <span class="text-h6 ">Détails Voyageurs(s)</span>
          </template>
        </FunnelStepsSummaryLine>

        <!-- Adult Travelers -->
        <FunnelStepsSummaryLine v-if="deal.nbAdults > 0">
          <template #left>
            {{ travelerText(+deal.nbAdults, 'adult') }}
          </template>
          <template #right>
            {{ formatNumber((deal.basePricePerTraveler - (deal.gotEarlybird == 'Oui' ? deal.promoEarlybird : (deal.gotLastMinute === 'Oui' ? deal.promoLastMinute : 0))) * deal.nbAdults, 'currency', 'EUR') }}
          </template>
        </FunnelStepsSummaryLine>

        <!-- Under Age Travelers -->
        <FunnelStepsSummaryLine v-if="deal.nbUnderAge > 0">
          <template #left>
            {{ travelerText(+deal.nbUnderAge, 'baby') }}
          </template>
          <template #right>
            {{ formatNumber((+deal.basePricePerTraveler - deal.promoChildren - (deal.gotEarlybird === 'Oui' ? deal.promoEarlybird : (deal.gotLastMinute === 'Oui' ? deal.promoLastMinute : 0))) * deal.nbUnderAge, 'currency', 'EUR') }}
          </template>
        </FunnelStepsSummaryLine>

        <v-divider
          v-if="forceIndivRoom || deal.indivRoom === 'Oui' && +deal.indivRoomPrice > 0"
          class="my-6"
        />

        <!--  Options -->
        <FunnelStepsSummaryLine v-if="forceIndivRoom || deal.indivRoom === 'Oui' && +deal.indivRoomPrice > 0">
          <template #left>
            <span class="text-h6 ">Options</span>
          </template>
        </FunnelStepsSummaryLine>

        <!-- Chambre individuelle -->
        <FunnelStepsSummaryLine v-if="forceIndivRoom || deal.indivRoom === 'Oui' && +deal.indivRoomPrice > 0">
          <template #left>
            <v-tooltip
              v-if="forceIndivRoom "
              bottom
            >
              <template #activator="{ props }">
                <div class="d-flex align-center ga-2">
                  <span>  {{ travelerText(+deal.nbTravelers, 'indivRoom') }}</span>
                  <v-icon
                    size="x-small"
                    v-bind="props"
                  >
                    {{ mdiInformationOutline }}
                  </v-icon>
                </div>
              </template>
              <div>
                {{ page.forced_indiv_room_text }}
              </div>
            </v-tooltip>
            <span v-else>
              {{ travelerText(+deal.nbTravelers, 'indivRoom') }}
            </span>
          </template>
          <template #right>
            {{ formatNumber(deal.indivRoomPrice * deal.nbTravelers, 'currency', 'EUR') }}
          </template>
        </FunnelStepsSummaryLine>

        <!-- Assurance -->
        <FunnelStepsSummaryLine v-if="deal.insurance !== 'Aucune Assurance'">
          <template #left>
            {{ travelerText(+deal.nbTravelers, 'insurance') }}
          </template>
          <template #right>
            {{ formatNumber(deal.insuranceCommissionPrice * deal.nbTravelers, 'currency', 'EUR') }}
          </template>
        </FunnelStepsSummaryLine>

        <v-divider
          v-if="deal.promoValue > 0"
          class="my-6"
        />

        <!-- Promo -->
        <FunnelStepsSummaryLine v-if="deal.promoValue > 0">
          <template #left>
            <!-- #TODO Remplacer par back -->
            Réduction totale appliquée
          </template>
          <template #right>
            -{{ formatNumber(deal.promoValue * deal.nbTravelers, 'currency', 'EUR') }}
          </template>
        </FunnelStepsSummaryLine>

        <v-divider class="my-6" />

        <!-- Somme déjà réglé -->
        <FunnelStepsSummaryLine v-if="deal.alreadyPaid > 0">
          <template #left>
            <!-- #TODO Remplacer par back -->
            Montant déjà réglé
          </template>
          <template #right>
            <span class="font-weight-bold ">
              <!-- #TODO  S'assurer que le total soit correct avec touts les ajouts / réductions -->
              {{ formatNumber(deal.alreadyPaid, 'currency', 'EUR') }}
            </span>
          </template>
        </FunnelStepsSummaryLine>

        <!-- Prix Total -->
        <FunnelStepsSummaryLine>
          <template #left>
            <!-- #TODO Remplacer par back -->
            Prix total
          </template>
          <template #right>
            <span class="font-weight-bold ">
              <!-- #TODO  S'assurer que le total soit correct avec tous les ajouts / réductions -->
              {{ formatNumber(deal.value, 'currency', 'EUR') }}
            </span>
          </template>
        </FunnelStepsSummaryLine>

        <!-- Prix Appliqué à régler -->
        <Transition name="slide-fade">
          <FunnelStepsSummaryLine v-if="route.query.isoption !== 'true'">
            <template #left>
              <v-tooltip
                bottom
              >
                <template #activator="{ props }">
                  <div
                    v-if="appliedPrice > 0"
                    class="d-flex align-center ga-2 text-primary"
                  >
                    <!-- #Todo Passer en computed les textes -->
                    <span v-if="route.query.type === 'deposit'"> Accompte à régler</span>
                    <span v-else-if="route.query.type === 'balance'"> Solde à régler</span>
                    <span v-else>Montant à régler</span>
                    <v-icon
                      size="x-small"
                      v-bind="props"
                    >
                      {{ mdiInformationOutline }}
                    </v-icon>
                  </div>
                  <div v-else>
                    Le voyage est déjà entièrement réglé
                  </div>
                </template>
                <div>
                  {{ page.cancel_text }}
                </div>
              </v-tooltip>
            </template>
            <template #right>
              <span
                class="font-weight-bold text-primary"
              >
                <!-- #TODO : Check si on a toujours la bonne valeur -->
                {{ appliedPrice > 0 ? formatNumber(appliedPrice, 'currency', 'EUR') : '-' }}
              </span>
            </template>
          </FunnelStepsSummaryLine>
        </Transition>

        <!--  #Todo Checker s'il faut ajouter le checking sur la date, si le type "full" est uniquement sur les voyages sous 30jours -->
        <FunnelStepsSummaryLine v-if="route.query.type === 'full'">
          <template #left>
            <!-- #TODO Remplacer par cms -->
            <span class="font-italic text-body-2 ">Le départ du voyage a lieu dans moins de 30 jours, nous vous demandons de régler l'intégralité de la somme, sans acompte.</span>
          </template>
        </FunnelStepsSummaryLine>

        <!-- Text for no Insurance available  -->
        <!-- Le départ est pour bientôt, nous ne pouvons pas vous proposer d'assurances pour cette réservation. -->
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import dayjs from 'dayjs'
import { mdiInformationOutline } from '@mdi/js'

const props = defineProps(['page', 'voyage', 'currentStep', 'ownStep', 'summary'])
const route = useRoute()
const forceIndivRoom = ref(false) // # TODO: Get from deal || Voyage
const { deal } = useStepperDeal(props.ownStep)

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
      single: 'Assurance ' + deal.value?.insurance,
      multiple: 'Assurance ' + deal.value?.insurance,
    },

  }
  if (nbTraveler > 1) {
    return `${nbTraveler} x ${text[type].multiple}`// this.$t('estimate.multiple' + type + 'Traveler')
  }
  else {
    return `${nbTraveler} x ${text[type].single}`// this.$t('estimate.' + type + 'Traveler')
  }
}

function calculateDepositValue(data) {
  const baseToCalculateDepositValue = +data.value - (data.flightPrice ?? 0) * data.nbTravelers - ((data.insuranceCommissionPrice ?? 0) * data.nbTravelers)
  return Math.floor((baseToCalculateDepositValue) * 0.3 + (data.flightPrice ?? 0) * data.nbTravelers) + ((data.insuranceCommissionPrice ?? 0) * data.nbTravelers)
}

const appliedPrice = computed(() => {
  if (deal.value.alreadyPaid >= deal.value.value) {
    return 0
  }
  else {
    if (route.query.type === 'deposit') {
      return calculateDepositValue(deal.value)
    }
    else if (route.query.type === 'balance') {
      return deal.value.value - deal.value.alreadyPaid
    }
    else if (route.query.type === 'full') {
      // #TODO à checker, utile au final d'avoir un full ?
      return deal.value.value - deal.value.alreadyPaid
    }
    else { // type = 'custom'
      return route.query.amount * 100
    }
  }
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
