<template>
  <v-row>
    <!-- Last minute deals section -->
    <v-col
      v-if="dealsLastMinute.length > 0"
      cols="12"
    >
      <p class="font-weight-black custom-title my-4">
        Profitez d'une réduction sur nos voyages de
        <span class="text-secondary">dernière minute</span>
      </p>
    </v-col>
    <v-col
      v-for="deal in dealsLastMinute"
      :key="`lastminute-${deal.slug}-${deal.dates[0]?.departure_date}`"
      cols="12"
      sm="6"
      md="4"
    >
      <NextDepartureCard :voyage="deal" />
    </v-col>
    <v-col
      v-if="monthNames.length === 0"
      cols="12"
      class="text-center my-14 text-h4"
    >
      <p>Aucun voyage disponible pour la sélection</p>
    </v-col>

    <!-- Monthly deals section -->
    <template
      v-for="monthName in monthNames"
      :key="monthName"
    >
      <v-col
        cols="12"
      >
        <h3 class="custom-title font-weight-bold mt-6 mb-2">
          {{ monthName }}
        </h3>
      </v-col>

      <v-col
        v-if="dealsToDisplayInMonth(monthName).length === 0"
        cols="12"
        class="text-center my-14 text-h4"
      >
        <p>Aucun voyage disponible pour le mois de {{ monthName }}</p>
      </v-col>

      <v-col
        v-for="(deal, i) in dealsToDisplayInMonth(monthName)"
        v-else
        :key="`${monthName}-${deal.slug}-${i}`"
        cols="12"
        sm="6"
        lg="4"
      >
        <NextDepartureCard :voyage="deal" />
      </v-col>
    </template>
  </v-row>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  filteredDeals: {
    type: Object,
    default: () => { },
  },
  dealsLastMinute: {
    type: Array,
    default: () => [],
  },
  selectedPeriod: {
    type: String,
  },
  toggledBtn: {
    type: String,
  },
})

const monthNames = computed(() => {
  const monthNames = Object.keys(props.filteredDeals)
  return monthNames
})

const dealsToDisplayInMonth = (monthName) => {
  const allDealsInSelectedMonth = props.filteredDeals[monthName] || []
  return allDealsInSelectedMonth
}
</script>

<style scoped>
.custom-title {
  font-weight: 700;
  font-size: 50px;
  line-height: 50px;
}

.list-move,
/* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}

@media (min-width: 960px) {
  .custom-title {
    font-size: 42px !important;
    line-height: 42px !important;
  }
}

@media (max-width: 960px) {
  .custom-title {
    font-size: 42px !important;
    line-height: 42px !important;
  }
}

@media (max-width: 400px) {
  .custom-title {
    font-size: 24px !important;
    line-height: 30px !important;
  }
}
</style>
