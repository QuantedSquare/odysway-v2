<template>
  <v-container>
    <v-card
      elevation="0"
      rounded="xl"
      class="border-style text-grey-darken-2 pb-6"
    >
      <Transition name="fade">
        <v-img
          v-if="voyage.imgSrc"
          color="surface-variant"
          class="blur"
          height="100"
          :lazy-src="voyage.imgSrc"
          cover
        >
          <div class="pa-5 d-flex flex-column align-start">
            <span class="text-h5">{{ voyage.title }}</span>
            <span class="text-body-1">{{ deal?.travelType }}</span>
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
            <span class="text-h6 text-dark">Dates confirmées</span>
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
              {{ formatNumber(deal.value, 'currency', 'EUR') }}
            </div>
            <div v-else>
              <div class="d-flex flex-column align-end">
                <span class="d-flex flex-column flex-md-row align-end">
                  <v-badge
                    inline
                    color="info"
                    :content="deal.gotEarlybird == 'Oui' ? 'EarlyBird: -' + formatNumber(deal.promoEarlybird, 'currency', '€') : 'LastMinute: -' + formatNumber(deal.promoLastMinute, 'currency', '€')"
                  />
                  {{ formatNumber(deal.value - (deal.gotEarlybird == 'Oui' ? deal.promoEarlybird : deal.promoLastMinute), 'currency', 'EUR') }}
                </span>
                <span class="text-decoration-line-through">
                  {{ formatNumber(deal.value, 'currency', 'EUR') }}
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
            <span class="text-h6 text-dark">Détails Voyageurs(s)</span>
          </template>
        </FunnelStepsSummaryLine>

        <!-- Adult Travelers -->
        <FunnelStepsSummaryLine v-if="deal.nbAdults > 0">
          <template #left>
            {{ travelerText(+deal.nbAdults, 'adult') }}
          </template>
          <template #right>
            {{ formatNumber(deal.basePricePerTraveler * deal.nbAdults, 'currency', 'EUR') }}
          </template>
        </FunnelStepsSummaryLine>

        <!-- Under Age Travelers -->
        <FunnelStepsSummaryLine v-if="deal.nbUnderAge > 0">
          <template #left>
            {{ travelerText(+deal.nbUnderAge, 'baby') }}
          </template>
          <template #right>
            {{ formatNumber((+deal.basePricePerTraveler - deal.promoChildren) * deal.nbUnderAge, 'currency', 'EUR') }}
          </template>
        </FunnelStepsSummaryLine>

        <!-- Teen Travelers -->
        <FunnelStepsSummaryLine v-if="deal.nbTeen > 0">
          <template #left>
            {{ travelerText(+deal.nbTeen, 'child') }}
          </template>
          <template #right>
            {{ formatNumber((+deal.basePricePerTraveler - deal.promoTeen) * deal.nbTeen, 'currency', 'EUR') }}
          </template>
        </FunnelStepsSummaryLine>

        <v-divider class="my-6" />
        <!--  Options -->
        <FunnelStepsSummaryLine>
          <template #left>
            <span class="text-h6 text-dark">Options</span>
          </template>
        </FunnelStepsSummaryLine>

        <!-- Chambre individuelle -->
        <FunnelStepsSummaryLine>
          <template #left>
            <span v-if="forceIndivRoom && deal.indivRoom">
              {{ travelerText(+deal.nbTravelers, 'indivRoom') }}
            </span>

            <v-tooltip
              v-else
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
                {{ page.fields.forced_indiv_room_text }}
              </div>
            </v-tooltip>
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

        <v-divider class="my-6" />

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
        <!-- Prix Total -->
        <FunnelStepsSummaryLine v-if="deal.promoValue > 0">
          <template #left>
            <!-- #TODO Remplacer par back -->
            Prix total
          </template>
          <template #right>
            <span class="font-weight-bold text-dark">
              <!-- #TODO  S'assurer que le total soit correct avec touts les ajouts / réductions -->
              {{ formatNumber(deal.value, 'currency', 'EUR') }}
            </span>
          </template>
        </FunnelStepsSummaryLine>

        <!-- Prix Appliqué à régler -->
        <FunnelStepsSummaryLine>
          <template #left>
            <v-tooltip
              bottom
            >
              <template #activator="{ props }">
                <div class="d-flex align-center ga-2">
                  <span> Accompte à régler</span>
                  <v-icon
                    size="x-small"
                    v-bind="props"
                  >
                    {{ mdiInformationOutline }}
                  </v-icon>
                </div>
              </template>
              <div>
                {{ page.fields.cancel_text }}
              </div>
            </v-tooltip>
          </template>
          <template #right>
            <span class="font-weight-bold text-primary">
              <!-- #TODO : Changer par le prix appliquer, total, direct, solde etc... -->
              {{ formatNumber(deal.depositPrice, 'currency', 'EUR') }}
            </span>
          </template>
        </FunnelStepsSummaryLine>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import dayjs from 'dayjs'
import { mdiInformationOutline } from '@mdi/js'

const props = defineProps(['page', 'voyage', 'currentStep'])
const route = useRoute()
const forceIndivRoom = ref(false) // # TODO: Get from deal || Voyage
const { deal } = useStepperDeal(route.query.step)

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
</script>

<style scoped>
.border-style{
  border: 1px solid rgb(var(--v-theme-grey-lighten-1));
}
</style>
