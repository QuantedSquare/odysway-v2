<template>
  <v-container
    fluid
    class="pt-0 position-relative max-container-width"
  >
    <SearchHeroSection
      :is-next-departures="true"
      :page-content="pageContent"
      :destination="{
        periodFilter: selectedPeriod,
        image: {
          src: getImageUrl(pageContent?.image?.asset?._ref) || '/images/homeHero.jpeg',
          alt: pageContent.value?.image?.alt || 'Image principale Hero d\'Odysway',
        },
      }"
      :no-margin-bottom="true"
    />

    <v-row
      align="center"
      justify="center"
      class="bg-white rounded-md filter-wrapper pa-2 px-4"
    >
      <div class="filter-bar d-flex flex-wrap justify-center align-center ga-2 w-100">
        <v-btn
          variant="flat"
          color="primary"
          height="50"
          class="filter-btn"
          :class="{ 'filter-btn--active': toggledBtn === 'all' }"
          @click="setToggle('all')"
        >
          <div class="d-flex align-center font-weight-bold">
            Tous les voyages
          </div>
        </v-btn>
        <v-btn
          variant="text"
          color="primary"
          height="50"
          class="filter-btn"
        >
          <v-checkbox
            v-model="confirmedOnly"
            hide-details
            density="compact"
            color="primary"
            class="my-n1"
          >
            <template #label>
              <div class="d-flex align-center font-weight-bold">
                Départs garantis
              </div>
            </template>
          </v-checkbox>
        </v-btn>
        <v-select
          v-model="selectedDestination"
          :items="destinationOptions"
          hide-details
          item-title="title"
          item-value="value"
          variant="outlined"
          density="comfortable"
          class="filter-select"

          :menu-props="{ maxHeight: 300 }"
          clearable
          placeholder="Destination"
          :prepend-inner-icon="mdiMapMarker"
        />
        <v-select
          :id="periodId"
          v-model="selectedPeriod"
          hide-details
          :items="sortedMonths"
          variant="outlined"
          density="comfortable"
          class="filter-select"
          min-width="240"
          clearable
          placeholder="Période 2026"
          :prepend-inner-icon="mdiCalendarMonth"
        />
      </div>
    </v-row>

    <VoyageCardsList
      v-if="!loading && travels.length > 0"
      :filtered-deals="groupByMonthFiltered"
      :deals-lastminute="dealsLastMinuteFiltered"
      :selected-period="selectedPeriod"
      :toggled-btn="toggledBtn"
    />
    <v-skeleton-loader
      v-else-if="loading"
      type="article"
    />
  </v-container>
</template>

<script setup>
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import 'dayjs/locale/fr'
import { mdiMapMarker, mdiCalendarMonth } from '@mdi/js'
import { getDateStatus } from '~/utils/getDateStatus'

dayjs.extend(customParseFormat)
const route = useRoute()
const loading = ref(false)
const travels = ref([])
const toggledBtn = ref('all')
const periodId = useId()
const selectedPeriod = ref(route.query?.periode || 'Toutes périodes')
const selectedDestination = ref(route.query?.destination || null)
const confirmedOnly = ref(route.query?.confirmed === 'true')

const fetchTravels = async () => {
  try {
    loading.value = true
    const res = await fetch('/api/v1/booking/travels-by-date')
    const data = await res.json()

    travels.value = data.map((travel) => {
      const futureDates = travel.dates
        .filter(dateInfo => dayjs(dateInfo.departure_date).isAfter(dayjs()))
        .sort((a, b) => dayjs(a.departure_date).valueOf() - dayjs(b.departure_date).valueOf())
      return {
        ...travel,
        departureDate: futureDates[0]?.departure_date || travel.departureDate,
      }
    })
    loading.value = false
  }
  catch (error) {
    console.error(error)
    loading.value = false
  }
}

onMounted(() => {
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

function setToggle(value) {
  toggledBtn.value = value
  if (value === 'all') {
    selectedDestination.value = null
  }
}

watch(() => route.query.periode, (newPeriode) => {
  selectedPeriod.value = newPeriode === 'Toutes périodes' ? null : (newPeriode || null)
})

watch(selectedDestination, (newDestination) => {
  const query = { ...route.query }
  if (!newDestination) {
    delete query.destination
  }
  else {
    query.destination = newDestination
  }
  navigateTo({
    path: route.path,
    query: Object.keys(query).length > 0 ? query : undefined,
  })
})

watch(() => route.query.destination, (newDestination) => {
  selectedDestination.value = newDestination || null
})

watch(confirmedOnly, (newValue) => {
  const query = { ...route.query }
  if (newValue) {
    query.confirmed = 'true'
  }
  else {
    delete query.confirmed
  }
  navigateTo({
    path: route.path,
    query: Object.keys(query).length > 0 ? query : undefined,
  })
})

watch(() => route.query.confirmed, (value) => {
  confirmedOnly.value = value === 'true'
})

const filteredTravels = computed(() => {
  return travels.value.filter((travel) => {
    const hasDates = travel.dates.length > 0 && travel.availabilityTypes?.includes('groupe')
    if (!hasDates) return false

    const destinations = Array.isArray(travel.destinations) ? travel.destinations : []
    const slugList = Array.isArray(travel.destinations) ? travel.destinations.map(dest => dest?.slug) : travel.destinations ? [travel.destinations?.slug] : []

    const matchesDestination = (() => {
      if (!selectedDestination.value) return true
      const matchDest = destinations.some(dest =>
        dest?.title === selectedDestination.value || dest?.slug === selectedDestination.value)
      const matchIso = slugList.includes(selectedDestination.value)
      return matchDest || matchIso
    })()

    if (confirmedOnly.value) {
      const displayedDate = travel.dates.find(date =>
        dayjs(date.departure_date).isSame(travel.departureDate),
      )
      if (!displayedDate) return false
      const status = getDateStatus(displayedDate)
      const isGuaranteed = status?.status === 'confirmed' || status?.status === 'full'
      return matchesDestination && isGuaranteed
    }

    return matchesDestination
  })
})

const groupByMonth = computed(() => {
  const today = dayjs()
  const unsrotedTravels = {}

  filteredTravels.value.forEach((travel) => {
    // Find the earliest future date for this travel
    const futureDates = travel.dates.filter(dateInfo =>
      dayjs(dateInfo.departure_date).isAfter(today),
    )

    if (futureDates.length === 0) return

    // Sort dates and get the earliest one
    const earliestDate = futureDates.sort((a, b) =>
      dayjs(a.departure_date).valueOf() - dayjs(b.departure_date).valueOf(),
    )[0]

    const departureDate = dayjs(earliestDate.departure_date)
    const monthYear = capitalizeFirstLetter(departureDate.locale('fr').format('MMMM YYYY'))

    if (!unsrotedTravels[monthYear]) {
      unsrotedTravels[monthYear] = []
    }

    // Add the travel once with all its dates
    unsrotedTravels[monthYear].push({
      ...travel,
      departureDate: earliestDate.departure_date,
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

const destinationOptions = computed(() => {
  const list = new Map()
  travels.value.forEach((travel) => {
    if (Array.isArray(travel.destinations)) {
      travel.destinations.forEach((dest) => {
        const key = dest?.slug || dest?.title
        if (!key || !dest?.title) return
        list.set(key, dest.title)
      })
    }
  })
  return Array.from(list.entries())
    .map(([value, title]) => ({ title, value }))
    .sort((a, b) => a.title.localeCompare(b.title))
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
const pageContentQuery = groq`*[_type == "page_prochains_departs"][0]{
  ...
}`
const sanity = useSanity()
const { data: pageContent } = await useAsyncData('page-prochains-departs', () =>
  sanity.fetch(pageContentQuery),
)

// Static seo data with plain text from this file / No data on Sanity
useSeo({
  seoData: pageContent.value?.seo,
  content: pageContent.value,
  pageType: 'website',
  slug: 'prochains-departs',
})
</script>

<style>
.filter-wrapper{
  position: relative;
  width: fit-content;
  height: fit-content;
  box-shadow: 5px 5px 100px 0px rgba(43, 76, 82, 0.5);
  margin: -45px auto 0 auto;
  z-index: 1000!important;
}
.filter-bar{
  min-height: 56px;
}
.filter-btn{
  height: 40px;
  text-transform: none;
font-size:16px;
  border: 1px solid #d7e3ea;
  background-color: #f6fbff;
}
.filter-btn--active{
  background-color: #1b7c83;
  color: white!important;
  border-color: #1b7c83;
}
.filter-select{
  max-width: 230px;
  min-width: 180px;
}
.filter-select:deep(.v-field__input){

  color: rgb(var(--v-theme-primary))!important;
  opacity: 1!important;
}
.filter-select:deep(.v-field__placeholder){

  color: rgb(var(--v-theme-primary))!important;
  opacity: 1!important;
}

.filter-select:deep(.v-select__selection){
  color: rgb(var(--v-theme-primary))!important;
  opacity: 1!important;
}
.filter-select input::placeholder {

  color: rgb(var(--v-theme-primary))!important;
  opacity: 1;
}
.bg-grey-light{
  background-color: rgb(var(--v-theme-grey-light))!important;
  color: rgb(var(--v-theme-primary))!important;
}
.filter-select .v-label {

  color: rgb(var(--v-theme-primary))!important;
  opacity: 1!important;
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
  }
  .btn-height{
    height: 48px;
  }
  .filter-select{
    min-width: 150px;
  }
}
@media (max-width: 600px) {
  .filter-wrapper{
    margin: -110px auto 0 auto;
  }
  .filter-bar{
    flex-direction: column;
    align-items: stretch;
  }
  .filter-select{
    max-width: 100%;
  }
}
</style>
