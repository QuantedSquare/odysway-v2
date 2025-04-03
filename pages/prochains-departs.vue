<template>
  <v-container class="mt-16">
    <v-row>
      <v-col>
        <h1><span>Découvrez nos voyages</span> <span class="text-primary"> de groupe </span></h1>
        <p>Réservez un voyage groupé et rejoignez un petit groupe de 8 voyageurs maximum.</p>
      </v-col>
    </v-row>
    <v-row>
      <div class="bg-secondary pa-2 rounded-lg">
        <v-btn-toggle
          v-model="filter"
          base-color="secondary"
          color="white"
          mandatory
          variant="plain"
          density="compact"
          class="d-flex ga-2"
        >
          <v-btn
            value="all"
            text="Tous"
            to="prochains-departs"
            class="text-decoration-none rounded-lg"
          />
          <v-btn
            value="france"
            text="En France"
            :to="{ path: '/prochains-departs', query: { type: 'france' } }"
            class="text-decoration-none rounded-lg"
          />
          <v-btn
            value="other"
            text="À l'étranger"
            :to="{ path: '/prochains-departs', query: { type: 'other' } }"
            class="text-decoration-none rounded-lg"
          />
        </v-btn-toggle>
      </div>
      <VoyageCardsList
        :value="filter"
        :filtered-deals="groupByMonth"
      />
    </v-row>
  </v-container>
</template>

<script setup>
import _ from 'lodash'
import dayjs from 'dayjs'

const route = useRoute()

const filter = ref(route.query.type || 'all')

const { data: deals } = await useAsyncData(() => {
  return queryCollection('deals').all()
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

      const monthYear = departureDate.format('MMMM YYYY')

      if (!unsortedResult[monthYear]) {
        unsortedResult[monthYear] = []
      }

      // Create a new object that combines the deal and this specific date
      const dealWithSingleDate = {
        ...deal,
        dates: [dateInfo], // Include only this specific date
        departureDate: dateInfo.departureDate, // Add departure date at the top level for easier sorting
      }

      // Add this deal-date combination to the month
      unsortedResult[monthYear].push(dealWithSingleDate)
    })
  })

  // Step 2: Sort the months chronologically and the deals within each month by departure date
  const monthsArray = Object.keys(unsortedResult).map((monthYear) => {
    const date = dayjs(monthYear, 'MMMM YYYY')

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
</script>
