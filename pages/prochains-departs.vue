<template>
  <v-container
    fluid
    class="pt-0 position-relative max-container-width"
  >
    <div class="mb-6">
      <SearchHeroSection
        :is-next-departures="true"
        :destination="{
          periodFilter: selectedPeriod,
          image: {
            src: '/images/homeHero.jpeg',
            alt: 'Découvrez nos voyages de groupe',
          },
        }"
        :no-margin-bottom="true"
      />
      <v-container class="bg-white rounded-md filter-wrapper">
        <v-row
          align="center"
          justify="center"
        >
          <v-col
            cols="12"
            sm="7"
          >
            <v-btn-toggle
              v-model="toggledBtn"
              mandatory
              class="d-flex justify-center ga-sm-3 btn-height"
            >
              <v-btn
                v-for="btn of toggleBtns"
                :key="btn.text"
                :value="btn.value"
                height="100%"
                selected-class="bg-primary"
                class="text-decoration-none rounded-lg"
              >
                <span class="text-caption text-sm-subtitle-1"> {{ btn.text }}</span>
              </v-btn>
            </v-btn-toggle>
          </v-col>
          <v-col
            cols="12"
            sm="4"
            class="pl-md-0 "
          >
            <v-select
              :id="periodId"
              v-model="selectedPeriod"
              hide-details
              :items="sortedMonths"
              label="Période"
              clearable
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
    </div>

    <VoyageCardsList
      :filtered-deals="groupByMonthFiltered"
      :deals-lastminute="dealsLastMinuteFiltered"
      :selected-period="selectedPeriod"
      :toggled-btn="toggledBtn"
    />
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
const selectedPeriod = ref(route.query?.periode || null)
const toggleBtns = ref([
  {
    value: 'all',
    text: 'Tous',
  },
  {
    value: 'france',
    text: 'En France',
  },
  {
    value: 'other',
    text: 'À l\'étranger',
  },
])

const fetchTravels = async () => {
  try {
    loading.value = true
    const res = await fetch('/api/v1/booking/travels-by-date')
    const data = await res.json()
    console.log('check', data)
    travels.value = data
    loading.value = false
  }
  catch (error) {
    console.error(error)
    loading.value = false
  }
}

onMounted(() => {
  nextTick(() => {
    toggledBtn.value = route.query?.type || 'all'
  })
  fetchTravels()
})

watch(selectedPeriod, (newPeriod) => {
  const query = { ...route.query }

  delete query.periode

  if (newPeriod !== null && newPeriod !== 'Toutes périodes') {
    query.periode = newPeriod
  }

  navigateTo({
    path: route.path,
    query: Object.keys(query).length > 0 ? query : undefined,
  })
})

watch(toggledBtn, (newType) => {
  const query = { ...route.query }

  if (newType === 'all') {
    delete query.type
  }
  else {
    query.type = newType
  }

  const currentPeriode = query.periode
  delete query.periode

  if (currentPeriode && selectedPeriod.value !== null && selectedPeriod.value !== 'Toutes périodes') {
    query.periode = currentPeriode
  }

  navigateTo({
    path: route.path,
    query: Object.keys(query).length > 0 ? query : undefined,
  })
})

watch(() => route.query.periode, (newPeriode) => {
  selectedPeriod.value = newPeriode === 'Toutes périodes' ? null : (newPeriode || null)
})

watch(() => route.query.type, (newType) => {
  toggledBtn.value = newType || 'all'
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
  if (selectedPeriod.value === null || selectedPeriod.value === 'Toutes périodes') {
    return groupByMonth.value
  }
  const monthName = selectedPeriod.value
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
  position: relative;
  width: 700px;
  height: fit-content;
  box-shadow: 5px 5px 100px 0px rgba(43, 76, 82, 0.5);
  margin: -45px auto 0 auto;
  z-index: 1000!important;
}
.absolute {
  position: absolute;
  left:0;
  right: 0;
  top: 300px;
}
.btn-height{
  height: 56px;
}

@media (max-width: 960px) {
  .filter-wrapper{
    max-width: calc(100% - 16px);
    margin: -100px auto 0 auto;
    width: auto;
  }
  .btn-height{
    height: 48px;
  }
}
@media (max-width: 600px) {
  .filter-wrapper{
    margin: -110px auto 0 auto;
  }
}
</style>
