<template>
  <v-container fluid>
    <v-card
      elevation="0"
      rounded="xl"
      class="border-style text-grey-darken-2"
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
        <!-- MEttre ici earlyBird // lastMinute -->

        <FunnelStepsSummaryMultipleLines
          v-for="(line) in summaryLines"
          v-show="line.displayLine"
          :key="line.left.text"
          :right="line.right"
          :left="line.left"
          :show-divider="!!line.displayDivider"
        />

        <!--  Options -->
        <FunnelStepsSummaryLine>
          <template #left>
            <span class="text-h6 text-black">Options</span>
          </template>
        </FunnelStepsSummaryLine>

        <!-- Chambre individuelle -->
        <FunnelStepsSummaryLine>
          <template #left>
            <span v-if="forceIndivRoom && deal.indivRoom">
              {{ travelerText(+deal.nbAdults, 'indivRoom') }}
            </span>

            <v-tooltip
              v-else
              class=" pointer"
              bottom
            >
              <template #activator="{ props }">
                <div class="d-flex align-center ga-2">
                  <span>  {{ travelerText(+deal.nbAdults, 'indivRoom') }}</span>
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

        <!-- Promo -->
        <!-- <FunnelStepsSummaryLine>
          <template #left>
            Promo.label
          </template>
          <template #right>
            promoValue * dealDetails.nbTravelers
          </template>
        </FunnelStepsSummaryLine> -->
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import dayjs from 'dayjs'
import { mdiInformationOutline } from '@mdi/js'

const props = defineProps(['page', 'voyage', 'currentStep'])
const forceIndivRoom = ref(false) // # TODO: Get from deal || Voyage
const { deal } = useDeal(() => props.currentStep, () => 5)

// watch([dealId, () => props.currentStep], async () => {
//   if (dealId.value) {
//     await fetchDeal(dealId.value)
//     console.log('deal', deal.value)
//   }
// }, { immediate: true })

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

const summaryLines = computed(() => {
  return [
    {
      left: {
        text: 'Dates confirmées',
        classes: 'text-h6 text-black',
      },
      right: {
        text: `${dayjs(deal.value.departureDate).format('DD/MM/YYYY')} au ${dayjs(deal.value.returnDate).format('DD/MM/YYYY')}`,
        classes: '',
      },
      displayLine: !!deal.value.departureDate && !!deal.value.returnDate,
      displayDivider: false,
    },
    {
      left: {
        text: 'Prix de base par voyageur',
      },
      right: {
        text: formatNumber(deal?.value.value, 'currency', 'EUR'),
      },
      displayLine: !!deal.value.value,
      displayDivider: true,
    },
    {
      left: {
        text: 'Prix extension voyage',
      },
      right: {
        text: formatNumber(deal?.value.value, 'currency', 'EUR'),
      },
      displayDivider: true,
      displayLine: deal.value.extensionPrice > 0,
    },
    {
      left: {
        text: 'Details Voyageurs(s)',
        classes: 'text-h6 text-black',
      },
      right: {
        text: '',
      },
      displayLine: true,
      displayDivider: false,
    },
    {
      left: {
        text: travelerText(+deal.value.nbAdults, 'adult'),
      },
      right: {
        text: formatNumber(deal.value.basePricePerTraveler * deal.value.nbAdults, 'currency', 'EUR'),
      },
      displayLine: deal.value.nbAdults > 0,
    },
    {
      left: {
        text: travelerText(+deal.value.nbUnderAge, 'baby'),
      },
      right: {
        text: formatNumber(+deal.value.basePricePerTraveler * deal.value.nbUnderAge, 'currency', 'EUR'),
      },
      displayLine: deal.value.nbUnderAge > 0,
    },
    {
      left: {
        text: travelerText(+deal.value.nbTeen, 'child'),
      },
      right: {
        text: formatNumber(+deal.value.basePricePerTraveler * deal.value.nbTeen, 'currency', 'EUR'),
      },
      displayLine: +deal.value.nbTeen > 0,
      displayDivider: true,
    },
  ]
})
</script>

<style scoped>
.border-style{
  border: 1px solid rgb(var(--v-theme-grey-lighten-1));
}
</style>
