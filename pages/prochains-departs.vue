<template>
  <v-container>
    <v-row>
      <v-col>
        <h1><span>Découvrez nos voyages</span> <span class="text-primary"> de groupe </span></h1>
        <p>Réservez un voyage groupé et rejoignez un petit groupe de 8 voyageurs maximum.</p>
      </v-col>
    </v-row>
    <v-row
      align="center"
    >
      <v-col
        cols="12"
        sm="auto"
        class="bg-secondary rounded-lg my-4"
      >
        <v-btn-toggle
          v-model="toggledBtn"
          mandatory
          color="secondary"
          density="compact"
          class="d-flex justify-center ga-2"
        >
          <v-btn
            v-for="btn of toggleBtns"
            :key="btn.text"
            :value="btn.value"
            :to="btn.path"
            selected-class="bg-white"
            class="text-decoration-none rounded-lg"
          >
            <span class="text-subtitle-1"> {{ btn.text }}</span>
          </v-btn>
        </v-btn-toggle>
      </v-col>
      <v-col
        cols="12"
        sm="4"
      >
        <v-select
          v-model="selectedFilter"
          :items="sortedMonths"
          density="comfortable"
          label="Trier"
          hide-details
          :prepend-inner-icon="mdiFilterVariant"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <VoyageCardsList
          :filtered-deals="groupByMonthFiltered"
          :deals-lastminute="dealsLastMinuteFiltered"
          :selected-filter="selectedFilter"
          :toggled-btn="toggledBtn"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { mdiFilterVariant } from '@mdi/js'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import 'dayjs/locale/fr'

dayjs.extend(customParseFormat)

const route = useRoute()

const toggledBtn = ref('')
const selectedFilter = ref(capitalizeFirstLetter(dayjs().locale('fr').format('MMMM YYYY')))

const { data: deals } = await useAsyncData(() => {
  return queryCollection('deals').all()
})

const toggleBtns = ref([
  { value: 'all',
    path: '/prochains-departs',
    text: 'Tous',
  },
  { value: 'france',
    path: 'prochains-departs?type=france',
    text: 'En France',
  },
  { value: 'other',
    path: 'prochains-departs?type=other',
    text: 'À l\'étranger',
  },
])

onMounted(() => {
  nextTick(() => {
    toggledBtn.value = route.query?.type || 'all'
  })
})

const filteredDeals = computed(() => {
  const franceDealIso = 'FR'
  const queryType = route.query.type

  return deals.value.filter((deal) => {
    if (queryType === 'france') {
      return deal.iso === franceDealIso && deal.dates.length > 0
    }
    else if (queryType === 'other') {
      return deal.iso !== franceDealIso && deal.dates.length > 0
    }
    else {
      return deal.dates.length > 0
    }
  })
})

const groupByMonth = computed(() => {
  const today = dayjs()

  // Step 1: Create separate objects for each deal-date combination and group by month
  const unsortedResult = {}

  filteredDeals.value.forEach((deal) => {
    deal.dates.forEach((dateInfo) => {
      // Check if the departure date has not passed already
      const departureDate = dayjs(dateInfo.departureDate)
      if (departureDate.isBefore(today)) {
        return
      }

      const monthYear = capitalizeFirstLetter(departureDate.locale('fr').format('MMMM YYYY'))

      if (!unsortedResult[monthYear]) {
        unsortedResult[monthYear] = []
      }

      // Create a new object that combines the deal and this specific date
      const dealWithSingleDate = {
        ...deal,
        dates: [dateInfo], // Include only this specific date
        departureDate: dateInfo.departureDate,
      }

      // Add this deal-date combination to the month
      unsortedResult[monthYear].push(dealWithSingleDate)
    })
  })

  // Step 2: Sort the months chronologically and the deals within each month by departure date
  const monthsArray = Object.keys(unsortedResult).map((monthYear) => {
    // Create a date for sorting (first day of the month)
    const date = dayjs(`01 ${monthYear.toLowerCase()}`, 'DD MMMM YYYY', 'fr')

    // Sort the deals within this month by departure date
    const sortedDeals = unsortedResult[monthYear].sort((a, b) => {
      return dayjs(a.departureDate).valueOf() - dayjs(b.departureDate).valueOf()
    })

    return {
      monthYear,
      date,
      deals: sortedDeals,
    }
  })

  // Sort months chronologically
  monthsArray.sort((a, b) => a.date.valueOf() - b.date.valueOf())

  // Step 3: Convert back to an object with chronologically sorted keys
  const sortedResult = {}
  monthsArray.forEach((item) => {
    sortedResult[item.monthYear] = item.deals
  })

  return sortedResult
})

const sortedMonths = computed(() => {
  return Object.keys(groupByMonth.value)
})

const groupByMonthFiltered = computed(() => {
  return groupByMonth.value[selectedFilter.value]
})

const dealsLastMinuteFiltered = computed(() => {
  const filteredDeals = []
  for (const month in groupByMonth.value) {
    for (const deal of groupByMonth.value[month]) {
      if (deal.dates[0].lastMinute) filteredDeals.push(deal)
    }
  }
  return filteredDeals
})

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
</script>
