<template>
  <v-container
    fluid
    class="pt-0 position-relative max-container-width"
  >
    <SearchHeroSection
      :is-next-departures="true"
      :page-content="pageContent"
      :destination="{
        periodFilter: periodLabel,
        isDateFilter: periodLabel !== 'Toutes périodes',
        destination: selectedDestination ? destinationOptions.find(option => option.value === selectedDestination) : null,
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
      class="bg-white rounded-md filter-wrapper pa-2 px-sm-4"
    >
      <div class="filter-bar d-flex flex-wrap justify-center align-center ga-2 w-100">
        <v-btn
          variant="flat"
          color="primary"
          height="50"
          :block="width < 660"
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
          :block="width < 660"
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
          :block="width < 660"
          density="comfortable"
          class="filter-select"
          :menu-props="{ maxHeight: 300 }"
          clearable
          placeholder="Destination"
          :prepend-inner-icon="mdiMapMarker"
        />
        <v-date-input
          v-model="selectedDatesRaw"
          multiple="range"
          type="text"
          color="primary"
          hide-details
          variant="outlined"
          density="comfortable"
          class="filter-select"
          :min-width="width < 660 ? '270' : width < 950 ? '100%' : '300'"
          placeholder="Période"
          :prepend-inner-icon="mdiCalendarMonth"
          :append-icon="null"
          :prepend-icon="null"
          :min="minDate"
          :text-field-props="{ type: 'text' }"
          clearable
          @click:clear="clearPeriod"
        />
      </div>
    </v-row>

    <VoyageCardsList
      v-if="!loading && travels.length > 0"
      :filtered-deals="groupedDatesByMonth"
      :deals-lastminute="dealsLastMinuteFiltered"
      :selected-period="periodLabel"
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
import 'dayjs/locale/fr'
import { mdiMapMarker, mdiCalendarMonth } from '@mdi/js'
import { useDisplay } from 'vuetify'
import { getDateStatus } from '~/utils/getDateStatus'

const { width } = useDisplay()
const { trackSearchBar, trackViewItemList } = useGtmTracking()
const { formatVoyagesForGtm } = useGtmVoyageFormatter()

dayjs.locale('fr')
const route = useRoute()
const loading = ref(false)
const travels = ref([])
const toggledBtn = ref('all')
const selectedDatesRaw = ref([])
const selectedDates = computed(() => normalizeDates(selectedDatesRaw.value))
const selectedDestination = ref(route.query?.destination || null)
const confirmedOnly = ref(route.query?.confirmed === 'true')
const minDate = dayjs().format('YYYY-MM-DD')

const toYmd = (v) => {
  if (!v) return null
  if (typeof v?.format === 'function') {
    const s = v.format('YYYY-MM-DD')
    return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null
  }
  if (v instanceof Date) {
    const s = dayjs(v).format('YYYY-MM-DD')
    return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null
  }
  if (typeof v === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v
    const parsed = dayjs(v)
    if (!parsed.isValid()) return null
    const s = parsed.format('YYYY-MM-DD')
    return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null
  }
  const parsed = dayjs(v)
  if (!parsed.isValid()) return null
  const s = parsed.format('YYYY-MM-DD')
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null
}

const normalizeDates = (dates = []) => {
  // Always normalize to ISO date strings to keep comparisons stable
  const normalized = Array.from(
    new Set(
      dates
        .filter(Boolean)
        .map(d => toYmd(d))
        .filter(Boolean),
    ),
  ).sort()

  return [normalized[0], normalized[normalized.length - 1]]
}

const arraysAreEqual = (a = [], b = []) => a.length === b.length && a.every((val, index) => val === b[index])

const setDatesFromQuery = () => {
  const getDaysBetween = (start, end) => {
    const range = []
    let current = start
    while (!current.isAfter(end)) {
      // Keep dayjs objects for VDateInput (it expects values with .toDate()).
      // Also keep them away from midnight to avoid any UTC-to-date truncation bugs.
      range.push(current.hour(12).minute(0).second(0).millisecond(0))
      current = current.add(1, 'days')
    }
    return range
  }
  const queryDates = normalizeDates([
    route.query?.periodFrom,
    route.query?.periodTo,
  ].filter(Boolean))

  const daysBetween = getDaysBetween(dayjs(queryDates[0]), dayjs(queryDates[1]))
  if (!arraysAreEqual(queryDates, selectedDates.value)) {
    selectedDatesRaw.value = daysBetween
  }
}

const fetchTravels = async () => {
  try {
    loading.value = true
    const res = await fetch('/api/v1/booking/travels-by-date')
    const data = await res.json()

    travels.value = data.map((travel) => {
      const futureDates = travel.dates
        .filter(dateInfo => dayjs(dateInfo.departure_date).isAfter(dayjs().add(travel.closingDays, 'day')))
        .sort((a, b) => dayjs(a.departure_date).valueOf() - dayjs(b.departure_date).valueOf())
      return {
        ...travel,
        dates: futureDates,
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
  setDatesFromQuery()
  fetchTravels()
})

watch(() => [route.query.periodFrom, route.query.periodTo], () => {
  setDatesFromQuery()
})

const updatePeriodQuery = (dates) => {
  const normalized = normalizeDates(dates)
  const currentQueryDates = normalizeDates([
    route.query?.periodFrom,
    route.query?.periodTo,
  ].filter(Boolean))

  if (arraysAreEqual(normalized, currentQueryDates)) return

  const query = { ...route.query }
  delete query.periodFrom
  delete query.periodTo
  if (normalized[0]) query.periodFrom = normalized[0]
  if (normalized[1]) query.periodTo = normalized[normalized.length - 1]

  navigateTo({
    path: route.path,
    query: Object.keys(query).length > 0 ? query : undefined,
  })
}

watch(selectedDatesRaw, (dates) => {
  const arr = Array.isArray(dates) ? dates.filter(Boolean) : []
  const haveDayjs = arr.length > 0 && arr.every(d => d && typeof d.toDate === 'function')

  const asDayjs = haveDayjs ? arr : arr.map(d => dayjs(d))
  // Stabilize values away from midnight so internal Date/ISO conversions can't flip the calendar day in some timezones.
  const stabilized = asDayjs.map((d) => {
    const dt = d?.toDate?.()
    if (dt instanceof Date && dt.getHours() === 0 && dt.getMinutes() === 0 && dt.getSeconds() === 0 && dt.getMilliseconds() === 0) {
      return d.hour(12).minute(0).second(0).millisecond(0)
    }
    return d
  })

  const needsModelWrite = !haveDayjs || stabilized.some((d, idx) => d !== asDayjs[idx])
  const normalized = normalizeDates(stabilized)

  if (needsModelWrite) {
    selectedDatesRaw.value = stabilized
    return
  }

  updatePeriodQuery(normalized)
})

function setToggle(value) {
  toggledBtn.value = value
  if (value === 'all') {
    selectedDestination.value = null
  }
}

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

const periodRange = computed(() => {
  const normalized = selectedDates.value
  const startDate = normalized[0] ? dayjs(normalized[0]).startOf('day') : null
  const endDate = normalized[normalized.length - 1]
    ? dayjs(normalized[normalized.length - 1]).endOf('day')
    : startDate
      ? dayjs(normalized[normalized.length - 1]).endOf('day')
      : null
  return { start: startDate, end: endDate }
})

const periodLabel = computed(() => {
  const normalized = selectedDates.value
  if (!normalized.length || normalized[0] === undefined) return 'Toutes périodes'
  const formatDate = date => capitalizeFirstLetter(dayjs(date).locale('fr').format('DD MMM YYYY'))
  if (normalized.length === 1) return formatDate(normalized[0])
  return `${formatDate(normalized[0])} - ${formatDate(normalized[normalized.length - 1])}`
})

const clearPeriod = () => {
  selectedDatesRaw.value = []
  updatePeriodQuery([])
}

const destinationOptions = computed(() => {
  const list = new Map()

  travels.value.forEach((travel) => {
    if (Array.isArray(travel.destinations)) {
      travel.destinations.forEach((dest) => {
        const key = dest?.slug || dest?.title
        if (!key || !dest?.title) return

        list.set(key, { title: dest.title, interjection: dest.interjection })
      })
    }
  })
  return Array.from(list.entries())
    .map(([value, { title, interjection }]) => ({ title, value, interjection }))
    .sort((a, b) => a.title.localeCompare(b.title))
})

const travelDateEntries = computed(() => {
  const today = dayjs()
  return travels.value.flatMap((travel) => {
    const hasDates = travel.dates?.length > 0 && travel.availabilityTypes?.includes('groupe')
    if (!hasDates) return []
    const futureDates = travel.dates
      .filter(dateInfo =>
        dayjs(dateInfo.departure_date).isSame(today, 'day') || dayjs(dateInfo.departure_date).isAfter(today),
      )
      .sort((a, b) => dayjs(a.departure_date).valueOf() - dayjs(b.departure_date).valueOf())
    if (!futureDates.length) return []
    return futureDates.map(dateInfo => ({
      ...travel,
      departureDate: dateInfo.departure_date,
      selectedDate: dateInfo,
      dates: futureDates,
    }))
  })
})

const isGuaranteedDeparture = (date) => {
  const status = getDateStatus(date)
  return status?.status === 'confirmed' || status?.status === 'full'
}

const filteredDateEntries = computed(() => {
  return travelDateEntries.value
    .filter((entry) => {
      const destinations = Array.isArray(entry.destinations) ? entry.destinations : []
      const slugList = Array.isArray(entry.destinations) ? entry.destinations.map(dest => dest?.slug) : entry.destinations ? [entry.destinations?.slug] : []

      const matchesDestination = (() => {
        if (!selectedDestination.value) return true
        const matchDest = destinations.some(dest =>
          dest?.title === selectedDestination.value || dest?.slug === selectedDestination.value)
        const matchIso = slugList.includes(selectedDestination.value)
        return matchDest || matchIso
      })()

      if (!matchesDestination) return false

      if (confirmedOnly.value && entry.selectedDate) {
        return isGuaranteedDeparture(entry.selectedDate)
      }

      return true
    })
    .filter((entry) => {
      const { start, end } = periodRange.value
      if (!start && !end) return true
      const departureDay = dayjs(entry.departureDate)
      if (start && end) return departureDay.isBetween(start, end, 'day', '[]')
      return departureDay.isSame(start || end, 'month')
    })
    .sort((a, b) => dayjs(a.departureDate).valueOf() - dayjs(b.departureDate).valueOf())
})

const groupedDatesByMonth = computed(() => {
  const ordered = new Map()
  filteredDateEntries.value.forEach((entry) => {
    const monthLabel = capitalizeFirstLetter(dayjs(entry.departureDate).locale('fr').format('MMMM YYYY'))
    if (!ordered.has(monthLabel)) {
      ordered.set(monthLabel, [])
    }
    ordered.get(monthLabel).push(entry)
  })
  return Object.fromEntries(ordered)
})

const dealsLastMinuteFiltered = computed(() =>
  filteredDateEntries.value.filter(entry => entry.selectedDate?.last_minute),
)

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

// GTM: Track search_bar when filters are applied
watch([selectedDestination, confirmedOnly, selectedDates], () => {
  if (selectedDestination.value || confirmedOnly.value || selectedDates.value?.length > 0) {
    const searchFilters = {
      destination: selectedDestination.value || null,
      period: selectedDates.value?.length > 0 ? periodLabel.value : null,
      confirmed_only: confirmedOnly.value,
    }
    trackSearchBar(searchFilters)
  }
}, { deep: true })

// GTM: Track view_item_list when results are displayed
watch(filteredDateEntries, (entries) => {
  if (entries && entries.length > 0) {
    // Convert travel entries to voyages format
    const voyages = entries.map(entry => ({
      _id: entry._id,
      title: entry.title,
      slug: entry.slug,
      pricing: { startingPrice: entry.startingPrice },
    }))
    const formattedVoyages = formatVoyagesForGtm(voyages)
    trackViewItemList(formattedVoyages, 'Prochains Départs')
  }
}, { immediate: true })

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
    max-width: calc(100%);
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
    width: 100%;
    min-width: 100%;
  }
}
</style>
