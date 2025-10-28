<template>
  <v-row>
    <!-- Last minute deals section -->
    <v-col v-if="dealsLastMinute.length > 0" cols="12">
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
      <VoyageCard :voyage="deal" />
    </v-col>

    <!-- Monthly deals section -->
    <template v-for="monthName in paginatedMonthNames" :key="monthName">
      <v-col v-if="selectedPeriod === 'Toutes périodes'" cols="12">
        <h3 class="custom-title font-weight-bold mt-6 mb-2">
          {{ monthName }}
        </h3>
      </v-col>

      <v-col v-if="dealsToDisplayInMonth(monthName).length === 0" cols="12">
        <p>Aucun voyage disponible pour le mois de {{ monthName }}</p>
      </v-col>

      <v-col
        v-for="(deal, i) in dealsToDisplayInMonth(monthName)"
        v-else
        :key="`${monthName}-${deal.slug}-${i}`"
        cols="12"
        sm="6"
        md="4"
      >
        <VoyageCard :voyage="deal" />
      </v-col>
    </template>

    <!-- Pagination -->
    <v-col v-if="nbPages > 1" cols="12">
      <v-pagination
        v-model="pagination.currentPage"
        :length="nbPages"
        :total-visible="5"
        variant="flat"
        density="comfortable"
        rounded="circle"
        active-color="primary"
        elevation="3"
        class="my-4"
        @click="goTo(scrollTarget, { offset: -50 })"
        @next="pagination.currentPage++"
        @prev="pagination.currentPage--"
      />
    </v-col>
  </v-row>
</template>

<script setup>
import { useGoTo } from 'vuetify'
import { ref, computed, watch } from 'vue'

const props = defineProps({
  filteredDeals: {
    type: Object,
    default: () => {},
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

const goTo = useGoTo()
const scrollTarget = ref(null)

const pagination = ref({
  currentPage: 1,
  itemsPerPage: 9,
})

const paginatedMonthNames = computed(() => {
  const monthNames = Object.keys(props.filteredDeals)

  if (props.selectedPeriod === 'Toutes périodes') {
    // When 'Toutes périodes', we show exactly one month per "page" in the UI.
    const start = (pagination.value.currentPage - 1)
    const end = start + 1 // Always show only one month
    return monthNames.slice(start, end)
  }

  return monthNames
})

const dealsToDisplayInMonth = (monthName) => {
  const allDealsInSelectedMonth = props.filteredDeals[monthName] || []
  if (props.selectedPeriod === 'Toutes périodes') {
    return allDealsInSelectedMonth
  }

  const start = (pagination.value.currentPage - 1) * pagination.value.itemsPerPage
  const end = pagination.value.currentPage * pagination.value.itemsPerPage
  return allDealsInSelectedMonth.slice(start, end)
}

const nbPages = computed(() => {
  if (props.selectedPeriod === 'Toutes périodes' && Object.keys(props.filteredDeals).length > 1) {
    return Object.keys(props.filteredDeals).length
  }

  const monthName = Object.keys(props.filteredDeals)[0]
  const totalDealsInMonth = props.filteredDeals[monthName]?.length || 0
  return Math.ceil(totalDealsInMonth / pagination.value.itemsPerPage)
})

watch(
  () => props.selectedPeriod,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      pagination.value.currentPage = 1
    }
  },
)

watch(
  () => props.toggledBtn,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      pagination.value.currentPage = 1
    }
  },
)
</script>

<style scoped>
.custom-title {
font-weight: 700;
font-size: 50px;
line-height: 50px;
}
.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to{
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
    font-size: 42px!important;
    line-height: 42px!important;
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
