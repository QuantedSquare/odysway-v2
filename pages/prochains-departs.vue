<template>
  <v-container
    fluid
    class="px-2 px-md-4 pt-0"
  >
    <SearchHeroSection
      :is-next-departures="true"
      :destination="{ periodFilter: selectedFilter }"
    >
      <v-container class="d-flex justify-center">
        <v-row
          justify="center"
          align="center"
          class="rounded-md bg-white filter-wrapper"
        >
          <v-col
            cols="12"
            sm="auto"
          >
            <v-btn-toggle
              v-model="toggledBtn"
              mandatory
              density="compact"
              class="d-flex justify-center ga-2"
            >
              <v-btn
                v-for="btn of toggleBtns"
                :key="btn.text"
                :value="btn.value"
                :to="btn.path"
                selected-class="bg-secondary"
                class="text-decoration-none rounded-lg"
              >
                <span class="text-subtitle-1"> {{ btn.text }}</span>
              </v-btn>
            </v-btn-toggle>
          </v-col>
          <v-col
            cols="12"
            sm="4"
            class="pt-0 pt-md-3"
          >
            <v-select
              :id="periodId"
              v-model="selectedFilter"
              hide-details
              :items="sortedMonths"
              label="Période"
            >
              <template #prepend-inner>
                <v-img
                  :src="img('/icons/calendar.svg', { format: 'webp', quality: 70, width: 640 })"
                  alt="Calendar icon"
                  width="24"
                  height="24"
                />
              </template>
            </v-select>
          </v-col>
        </v-row>
      </v-container>
    </SearchHeroSection>
    <v-row class="my-md-4">
      <v-col cols="12">
        <p>Réservez un voyage groupé et rejoignez un petit groupe de 8 voyageurs maximum.</p>
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
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import 'dayjs/locale/fr'
import { useImage } from '#imports'

dayjs.extend(customParseFormat)

const img = useImage()
const route = useRoute()
const loading = ref(false)
const travels = ref([])
const toggledBtn = ref('all')
const periodId = useId()
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
  try {
    loading.value = true
    const res = await fetch('/api/v1/booking/travels-by-date')
    const data = await res.json()
    travels.value = data
    loading.value = false
  }
  catch (error) {
    console.error(error)
    loading.value = false
  }
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
      return iso === franceDealIso && travel.dates.length > 0 && travel.groupeAvailable
    }
    else if (queryType === 'other') {
      return iso !== franceDealIso && travel.dates.length > 0 && travel.groupeAvailable
    }
    else {
      return travel.dates.length > 0 && travel.groupeAvailable
    }
  })
})

const groupByMonth = computed(() => {
  const today = dayjs()
  const unsrotedTravels = {}
  filteredTravels.value.forEach((travel) => {
    travel.dates.forEach((dateInfo) => {
      const departureDate = dayjs(dateInfo.departure_date)
      if (departureDate.isBefore(today)) {
        return
      }
      const monthYear = capitalizeFirstLetter(departureDate.locale('fr').format('MMMM YYYY'))
      if (!unsrotedTravels[monthYear]) {
        unsrotedTravels[monthYear] = []
      }
      const travelWithSingleDate = {
        ...travel,
        dates: [dateInfo],
        departureDate: dateInfo.departure_date,
      }
      unsrotedTravels[monthYear].push(travelWithSingleDate)
    })
  })
  const monthsArray = Object.keys(unsrotedTravels).map((monthYear) => {
    const date = dayjs(`01 ${monthYear.toLowerCase()}`, 'DD MMMM YYYY', 'fr')
    const sortedTravels = unsrotedTravels[monthYear].sort((a, b) => {
      return dayjs(a.departureDate).valueOf() - dayjs(b.departureDate).valueOf()
    })
    return {
      monthYear,
      date,
      travels: sortedTravels,
    }
  })
  monthsArray.sort((a, b) => a.date.valueOf() - b.date.valueOf())
  const sortedTravels = {}
  monthsArray.forEach((item) => {
    sortedTravels[item.monthYear] = item.travels
  })
  return sortedTravels
})

const sortedMonths = computed(() => {
  const months = Object.keys(groupByMonth.value)
  months.unshift('Toutes périodes')
  return months
})

const groupByMonthFiltered = computed(() => {
  if (selectedFilter.value === 'Toutes périodes') {
    return groupByMonth.value
  }
  const monthName = selectedFilter.value
  const dealsForSelectedMonth = groupByMonth.value[monthName] || []

  const singleMonthObject = {
    [monthName]: dealsForSelectedMonth,
  }
  return singleMonthObject
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

<style scoped>
.filter-wrapper{
  max-width: 700px;
  position: relative;
  box-shadow: 5px 5px 100px 0px rgba(43, 76, 82, 0.5);
}
.selected-destination{
  background-color: black;
}
</style>
