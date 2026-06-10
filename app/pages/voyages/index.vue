<template>
  <div class="voyages-search">
    <v-container class="max-container-width py-6 py-md-8">
      <p class="crumb">
        <NuxtLink to="/">
          Accueil
        </NuxtLink> › Voyages
      </p>
      <h1 class="h1 text-primary">
        {{ pageTitle }}
      </h1>
      <p class="lead">
        {{ leadText }}
      </p>

      <ClientOnly>
        <VoyageSelectorBar
          :destinations="destinationsWithCount"
          :regions="regions || []"
          :categories="categoriesWithCount"
          :travel-types="travelTypesNormalized"
          :all-voyages="allVoyages || []"
        />
        <template #fallback>
          <div class="selector-skeleton" />
        </template>
      </ClientOnly>

      <!-- Results bar -->
      <div class="resbar">
        <span class="n">
          {{ nbVoyages }} {{ nbVoyages <= 1 ? (searchContent?.oneTrip || 'voyage') : (searchContent?.multipleTrips || 'voyages') }}
        </span>
        <span
          v-for="chip in activeChips"
          :key="chip.type + chip.value"
          class="tag"
        >
          {{ chip.label }}
          <v-icon
            :icon="mdiClose"
            size="13"
            @click="removeChip(chip)"
          />
        </span>
        <v-spacer />
        <v-checkbox
          v-model="confirmedOnly"
          hide-details
          color="primary"
          density="compact"
          class="garanti-check"
        >
          <template #label>
            <span class="text-subtitle-2">Départs garantis</span>
          </template>
        </v-checkbox>
        <v-btn
          color="primary"
          variant="outlined"
          size="small"
          class="reset-btn"
          @click="reinitiliazeFilter"
        >
          {{ searchContent?.resetButton || 'Réinitialiser' }}
        </v-btn>
      </div>
    </v-container>

    <v-container
      class="py-0 px-0 px-md-8 mt-2 max-container-width"
      fluid
    >
      <DisplayVoyagesRow
        :voyages="filteredVoyages"
        :is-search="true"
        :prefer-confirmed-date="confirmedOnly"
        :item-list-name="searchListName"
      />
    </v-container>
  </div>
</template>

<script setup>
import { mdiClose } from '@mdi/js'
import _ from 'lodash'
import { useVoyageFilters } from '~/composables/useVoyageFilters'

const { trackSearchBar, trackViewItemList } = useGtmTracking()
const { formatVoyagesForGtm } = useGtmVoyageFormatter()
const { applyFilters } = useVoyageFilters()

useSeoMeta({
  htmlAttrs: { lang: 'fr' },
  robots: 'noindex, follow',
  canonical: 'https://www.odysway.com/voyages',
})

const router = useRouter()
const route = useRoute()
const confirmedOnly = ref(route.query.confirmed === 'true')

const leadText = 'Choisissez une destination, un type de voyage et une période : la liste se met à jour en direct. Tous nos séjours se vivent en petit groupe ou en privatisé, au plus près des habitants.'

const monthNumberToFrench = [
  '', // 0 index unused
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

// ---------- Sanity data ----------
const searchContentQuery = groq`*[_type == "search"][0]{
  oneTrip,
  multipleTrips,
  resetButton,
  image,
  searchHero,
  travelTypes
}`
const { data: searchContent } = await useSanityQuery(searchContentQuery)

const regionsQuery = groq`*[_type == "region"]{
  _id,
  nom,
  "slug": slug.current
}`
const { data: regions } = await useSanityQuery(regionsQuery)

const destinationsQuery = groq`*[_type == "destination"]{
  _id,
  title,
  "slug": slug.current,
  isTopDestination,
  image,
  regions[]-> {
    nom
  }
}`
const { data: destinations } = await useSanityQuery(destinationsQuery)

const categoriesQuery = groq`*[_type == "category"]{
  _id,
  title,
  "slug": slug.current
}`
const { data: categories } = await useSanityQuery(categoriesQuery)

const { data: travelsByDate } = await useAsyncData('travels-by-date', () =>
  $fetch('/api/v1/booking/travels-by-date'),
)

const voyagesQuery = groq`*[
  _type == "voyage" && (
    !('custom' in availabilityTypes)
  )
]|order(orderRank){
  ...,
  _id,
  title,
  "slug": slug.current,
  image,
  imageCard,
  rating,
  comments,
  duration,
  pricing,
  availabilityTypes,
  monthlyAvailability,
  destinations[]-> {
    _id,
    title
  },
  experienceType->{
    _id,
    title
  },
  categories[]->{
    _id,
    title,
    "slug": slug.current
  }
}`
const { data: allVoyages } = await useSanityQuery(voyagesQuery)

// ---------- Normalized travel types ----------
const travelTypesNormalized = computed(() => ({
  group: searchContent.value?.travelTypes?.group,
  individual: searchContent.value?.travelTypes?.individual,
}))

// ---------- Counts for the selector ----------
const destinationsWithCount = computed(() => {
  const counts = {}
  ;(allVoyages.value || []).forEach((v) => {
    const seen = new Set()
    v.destinations?.forEach((d) => {
      if (!seen.has(d.title)) {
        seen.add(d.title)
        counts[d.title] = (counts[d.title] || 0) + 1
      }
    })
  })
  return (destinations.value || [])
    .map(d => ({ ...d, count: counts[d.title] || 0 }))
    .filter(d => d.count > 0)
})

const categoriesWithCount = computed(() => {
  const counts = {}
  ;(allVoyages.value || []).forEach((v) => {
    v.categories?.forEach((c) => {
      if (c.slug) counts[c.slug] = (counts[c.slug] || 0) + 1
    })
  })
  return (categories.value || [])
    .map(c => ({ ...c, count: counts[c.slug] || 0 }))
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count)
})

// ---------- Selections derived from route.query ----------
const selDest = computed(() => (route.query.destination ? String(route.query.destination).split(',').filter(Boolean) : []))
const selActivities = computed(() => (route.query.activities ? String(route.query.activities).split(',').filter(Boolean) : []))
const selMonths = computed(() => (route.query.from ? String(route.query.from).split(',').map(Number).filter(n => n > 0 && n <= 12) : []))

const pageTitle = computed(() => searchContent.value?.searchHero?.defaultTitle || 'Nos voyages en immersion')

const parsedDates = computed(() => {
  if (!route.query.from) return ''
  const names = selMonths.value.map(n => monthNumberToFrench[n])
  return names.join(' - ')
})

// ---------- Filtering (shared with the selector via useVoyageFilters) ----------
const filterCtx = computed(() => ({
  destinations: destinations.value || [],
  regions: regions.value || [],
  travelTypes: travelTypesNormalized.value,
  travelsByDate: travelsByDate.value || [],
}))

const filteredVoyages = computed(() => {
  const list = applyFilters(allVoyages.value || [], {
    destinations: selDest.value,
    travelType: route.query.travelType || '',
    from: route.query.from || '',
    activities: selActivities.value,
    confirmed: confirmedOnly.value,
  }, filterCtx.value)
  return _.uniqBy(list, 'slug')
})

const nbVoyages = computed(() => filteredVoyages.value?.length || 0)

// ---------- Labels ----------
function destLabel(slug) {
  if (slug === 'top-destination') return 'Top destinations'
  const r = (regions.value || []).find(x => x.slug === slug)
  if (r) return r.nom
  const d = (destinations.value || []).find(x => x.slug === slug)
  return d ? d.title : slug
}
function categoryLabel(slug) {
  const c = (categories.value || []).find(x => x.slug === slug)
  return c ? c.title.trim() : slug
}
function monthsLabel() {
  const n = selMonths.value.length
  if (n === 12) return "Toute l'année"
  if (n > 3) return `${n} mois`
  return [...selMonths.value].sort((a, b) => a - b).map(m => monthNumberToFrench[m]).join(' - ')
}

// ---------- Removable result chips ----------
const activeChips = computed(() => {
  const chips = []
  selDest.value.forEach(slug => chips.push({ type: 'dest', value: slug, label: destLabel(slug) }))
  if (route.query.travelType) chips.push({ type: 'type', value: route.query.travelType, label: route.query.travelType })
  selActivities.value.forEach(slug => chips.push({ type: 'activity', value: slug, label: categoryLabel(slug) }))
  if (selMonths.value.length) chips.push({ type: 'months', value: 'months', label: monthsLabel() })
  return chips
})

function removeChip(chip) {
  const q = { ...route.query }
  if (chip.type === 'dest') {
    const arr = selDest.value.filter(s => s !== chip.value)
    if (arr.length) q.destination = arr.join(',')
    else delete q.destination
  }
  else if (chip.type === 'type') {
    delete q.travelType
  }
  else if (chip.type === 'activity') {
    const arr = selActivities.value.filter(s => s !== chip.value)
    if (arr.length) q.activities = arr.join(',')
    else delete q.activities
  }
  else if (chip.type === 'months') {
    delete q.from
  }
  router.push({ path: route.path, query: Object.keys(q).length ? q : undefined })
}

// ---------- GTM: search_bar on any filter change ----------
function fireSearchBarTracking() {
  const destinationTitle = selDest.value.length ? selDest.value.map(destLabel).join(', ') : null
  const periodeFormatted = selMonths.value.length
    ? selMonths.value.map(n => monthNumberToFrench[n]).join(', ')
    : null
  trackSearchBar({
    destination: destinationTitle,
    typeVoyage: route.query.travelType || null,
    periode: periodeFormatted,
    voyageGaranti: confirmedOnly.value,
  })
}

watch(
  () => [route.query.destination, route.query.travelType, route.query.from, route.query.activities, confirmedOnly.value].join('|'),
  () => fireSearchBarTracking(),
)

// ---------- GTM: dynamic list name ----------
const searchListName = computed(() => {
  let name = 'Search Results'
  if (selDest.value.length) name += ` - ${selDest.value.map(destLabel).join(', ')}`
  if (route.query.travelType) name += ` - ${route.query.travelType}`
  if (route.query.from) name += ` - ${parsedDates.value}`
  if (selActivities.value.length) name += ` - ${selActivities.value.map(categoryLabel).join(', ')}`
  if (confirmedOnly.value) name += ' - Départs garantis'
  return name
})

// ---------- GTM: view_item_list when results change ----------
const lastTrackedVoyageIds = ref(null)
watch(filteredVoyages, (newVoyages) => {
  if (newVoyages && newVoyages.length > 0) {
    const newVoyageIds = newVoyages.map(v => v._id).sort().join(',')
    if (newVoyageIds !== lastTrackedVoyageIds.value) {
      lastTrackedVoyageIds.value = newVoyageIds
      const formattedVoyages = formatVoyagesForGtm(newVoyages)
      if (formattedVoyages && formattedVoyages.length > 0) {
        trackViewItemList({
          currency: 'EUR',
          items: formattedVoyages,
          itemListName: searchListName.value,
        })
      }
    }
  }
}, { immediate: true })

function reinitiliazeFilter() {
  trackSearchBar({ destination: null, typeVoyage: null, periode: null, voyageGaranti: false })
  router.push({ path: '/voyages', query: null })
}

// ---------- confirmedOnly <-> route.query.confirmed sync ----------
watch(confirmedOnly, (newValue) => {
  const query = { ...route.query }
  if (newValue) query.confirmed = 'true'
  else delete query.confirmed
  router.push({
    path: route.path,
    query: Object.keys(query).length > 0 ? query : undefined,
  })
})

watch(() => route.query.confirmed, (value) => {
  confirmedOnly.value = value === 'true'
})
</script>

<style scoped>
.wrap {
  max-width: 1180px!important;
}
.crumb {
  font-size: 13px;
  color: #9aa0a1;
  margin: 0 0 16px;
}
.crumb a {
  text-decoration: none;
  color: #9aa0a1;
}
.h1 {
  font-size: 30px;
  font-weight: 700;
  margin: 0 0 10px;
  color: #222223;
  letter-spacing: -.01em;
}
.lead {
  font-size: 16px;
  line-height: 1.7;
  color: #5d6566;
  margin: 0 0 26px;
  max-width: 760px;
}

.selector-skeleton {
  height: 76px;
  border: 1px solid rgba(43, 76, 82, .24);
  border-radius: 14px;
  background: #fff;
}

.resbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 22px 0 4px;
  flex-wrap: wrap;
}
.resbar .n {
  font-size: 18px;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
  margin-right: 6px;
}
.tag {
  font-size: 12px;
  padding: 4px 8px 4px 11px;
  border-radius: 20px;
  background: #E7EEED;
  color: #2B4C52;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
}
.tag .v-icon {
  cursor: pointer;
}
.garanti-check {
  flex: 0 0 auto;
}
.reset-btn {
  flex: 0 0 auto;
}

@media (max-width: 600px) {
  .h1 {
    font-size: 25px;
  }
}
</style>
