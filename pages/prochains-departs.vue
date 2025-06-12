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
const loading = ref(false)
const travels = ref([])
const toggledBtn = ref('all')
const selectedFilter = ref('Toutes périodes')
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

const fetchTravels = async () => {
  loading.value = true
  const res = await fetch('/api/v1/booking/travels-by-date')
  const data = await res.json()
  travels.value = data
  console.log('travels', travels.value)
  loading.value = false
}
fetchTravels()

onMounted(() => {
  nextTick(() => {
    toggledBtn.value = route.query?.type || 'all'
  })
})

const filteredTravels = computed(() => {
  const franceDealIso = 'FR'
  const queryType = toggledBtn.value
  return travels.value.filter((travel) => {
    const iso = Array.isArray(travel.iso) ? travel.iso[0] : travel.iso
    if (queryType === 'france') {
      return iso === franceDealIso && travel.dates.length > 0
    }
    else if (queryType === 'other') {
      return iso !== franceDealIso && travel.dates.length > 0
    }
    else {
      return travel.dates.length > 0
    }
  })
})

const groupByMonth = computed(() => {
  const today = dayjs()
  const unsortedResult = {}
  filteredTravels.value.forEach((travel) => {
    travel.dates.forEach((dateInfo) => {
      const departureDate = dayjs(dateInfo.departure_date)
      if (departureDate.isBefore(today)) {
        return
      }
      const monthYear = capitalizeFirstLetter(departureDate.locale('fr').format('MMMM YYYY'))
      if (!unsortedResult[monthYear]) {
        unsortedResult[monthYear] = []
      }
      const travelWithSingleDate = {
        ...travel,
        dates: [dateInfo],
        departureDate: dateInfo.departure_date,
      }
      unsortedResult[monthYear].push(travelWithSingleDate)
    })
  })
  const monthsArray = Object.keys(unsortedResult).map((monthYear) => {
    const date = dayjs(`01 ${monthYear.toLowerCase()}`, 'DD MMMM YYYY', 'fr')
    const sortedTravels = unsortedResult[monthYear].sort((a, b) => {
      return dayjs(a.departureDate).valueOf() - dayjs(b.departureDate).valueOf()
    })
    return {
      monthYear,
      date,
      travels: sortedTravels,
    }
  })
  monthsArray.sort((a, b) => a.date.valueOf() - b.date.valueOf())
  const sortedResult = {}
  monthsArray.forEach((item) => {
    sortedResult[item.monthYear] = item.travels
  })
  console.log('sortedResult', sortedResult)
  return sortedResult
})

const sortedMonths = computed(() => {
  const sort = Object.keys(groupByMonth.value)
  sort.unshift('Toutes périodes')
  return sort
})

const groupByMonthFiltered = computed(() => {
  if (selectedFilter.value === 'Toutes périodes') {
    return filteredTravels.value
  }
  else {
    return groupByMonth.value[selectedFilter.value]
  }
})

const dealsLastMinuteFiltered = computed(() => {
  const filteredTravels = []
  for (const month in groupByMonth.value) {
    for (const travel of groupByMonth.value[month]) {
      if (travel.dates[0].last_minute) filteredTravels.push(travel)
    }
  }
  return filteredTravels
})

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
</script>
