<template>
  <v-container
    class="py-0 my-0 px-2 px-md-4"
    fluid
  >
    <SearchHeroSection :destination="fetchedDestination">
      <SearchField />
    </SearchHeroSection>
    <v-row class=" pb-0 pt-4 mt-md-12">
      <v-col
        cols="12"
        class="px-4 px-md-12 d-flex ga-2 align-center flex-wrap"
      >
        <span class="text-primary text-h3 font-weight-bold mr-2 mr-md-5">{{ nbVoyages <= 1 ? `${nbVoyages} ${searchContent?.oneTrip || 'voyage'}` : `${nbVoyages}
            ${searchContent?.multipleTrips || 'voyages'}` }}
        </span>

        <div class="d-flex align-center flex-wrap ga-2">
          <!-- Add closable props & logic -->
          <v-chip
            v-if="routeQuery.destination"
            variant="flat"
            :size="lgAndUp ? 'x-large' : 'large'"
            color="secondary-light-2"
            density="comfortable"
          >
            <span class="d-flex align-center text-white text-caption text-sm-subtitle-1 px-sm-3 pb-1">
              {{ capitalizeFirstLetter(routeQuery.destination) }}
            </span>
          </v-chip>
          <!-- Add closable props & logic -->

          <v-chip
            v-if="routeQuery.travelType"
            variant="flat"
            :size="lgAndUp ? 'x-large' : 'large'"
            color="secondary-light-2"
            density="comfortable"
            @click:close="chip = false"
          >
            <span class="d-flex align-center text-white text-caption text-sm-subtitle-1 px-3 pb-1">
              {{ routeQuery.travelType }}
            </span>
          </v-chip>
          <!-- Add closable props & logic -->

          <v-chip
            v-if="routeQuery.from"
            variant="flat"
            :size="lgAndUp ? 'x-large' : 'large'"
            color="secondary-light-2"
            density="comfortable"
          >
            <span class="d-flex align-center text-white text-caption text-sm-subtitle-1 px-3 pb-1">
              {{ parsedDates }}
            </span>
          </v-chip>
        </div>
        <v-spacer />
        <div class="d-flex justify-end ml-auto">
          <v-btn
            color="primary"
            variant="outlined"
            size="large"
            class="text-subtitle-2 text-sm-body-1 reset-btn-size"

            @click="reinitiliazeFilter"
          >
            {{ searchContent?.resetButton || 'Réinitialiser' }}
          </v-btn>
        </div>
      </v-col>
    </v-row>
    <v-container
      class=" py-0 px-0 px-md-8 mt-3"
      fluid
    >
      <DisplayVoyagesRow
        :voyages="voyages"
        :is-search="true"
      />
    </v-container>
  </v-container>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import _ from 'lodash'
import SearchField from '~/components/content/SearchField.vue'

const { lgAndUp } = useDisplay()
useSeoMeta({
  htmlAttrs: {
    lang: 'fr',
  },
  robots: 'noindex, follow',
  canonical: 'https://www.odysway.com/search',
})
const router = useRouter()
const route = useRoute()
const routeQuery = computed(() => route.query)

const sanity = useSanity()

const searchContentQuery = groq`*[_type == "search"][0]{
  oneTrip,
  multipleTrips,
  resetButton
}`

const { data: searchContent } = await useAsyncData('search-content', () =>
  sanity.fetch(searchContentQuery)
)

const { data: fetchedDestination } = useAsyncData('fetchedDestination', () => {
  if (route.query.destination) {
    const query = groq`*[_type == "destination" && slug.current == $slug][0]{
      title,
      interjection,
      image
    }`
    return sanity.fetch(query, { slug: route.query.destination })
  }
  return null
}, {
  watch: [routeQuery],
  immediate: true,
})

const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const monthNumberToFrench = [
  '', // 0 index unused
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

const parsedDates = computed(() => {
  if (!routeQuery.value.from) return ''
  const monthNumbers = routeQuery.value.from.split(',').map(Number).filter(n => n > 0 && n <= 12)
  if (monthNumbers.length === 0) return ''
  const monthNames = monthNumbers.map(n => monthNumberToFrench[n])
  return monthNames.join(' - ')
})

function filterByDestination(voyages, destination) {
  if (!destination) return voyages
  return voyages.filter(v => v.destinations?.some(d => d.title.includes(destination)))
}

const travelTypesQuery = groq`*[_type == "search"][0]{
  travelTypes
}`

const { data: travelTypes } = await useAsyncData('travelTypes', () =>
  sanity.fetch(travelTypesQuery)
)

const TRAVEL_TYPES = {
  GROUP: travelTypes.value?.travelTypes?.group,
  INDIVIDUAL: travelTypes.value?.travelTypes?.individual,
}

function filterByType(voyages, travelType) {
  // Early return for falsy values
  if (!travelType) return voyages

  const typeFilters = {
    [TRAVEL_TYPES.GROUP]: voyage => voyage.groupeAvailable === true,
    [TRAVEL_TYPES.INDIVIDUAL]: voyage => voyage.privatisationAvailable === true,
  }

  const filterFn = typeFilters[travelType]
  return filterFn ? voyages.filter(filterFn) : voyages
}

function filterByDate(voyages, fromList) {
  if (!fromList) return voyages
  const monthNumbers = fromList.split(',').map(Number).filter(n => n > 0 && n <= 12)
  if (monthNumbers.length === 0) return voyages

  // Map month numbers to keys used in the object
  const monthKeys = [
    '', // 0 index unused
    'janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre',
  ]
  const selectedKeys = monthNumbers.map(n => monthKeys[n])

  return voyages.filter((v) => {
    const avail = v.monthlyAvailability
    if (!avail || typeof avail !== 'object') return false
    if (avail.toutePeriodes) return true
    return selectedKeys.some(key => avail[key])
  })
}

const regionsQuery = groq`*[_type == "region"]{
  _id,
  nom,
  "slug": slug.current
}`

const { data: regions } = await useAsyncData('regions', () =>
  sanity.fetch(regionsQuery)
)

const destinationsQuery = groq`*[_type == "destination"]{
  _id,
  title,
  "slug": slug.current,
  isTopDestination,
  regions[]-> {
    nom
  }
}`

const { data: destinations } = await useAsyncData('destinations', () =>
  sanity.fetch(destinationsQuery)
)

const { data: voyages } = await useAsyncData(
  `search-${JSON.stringify(route.query)}`,
  async () => {
    let destination = null
    let regionSlug = null
    let isRegionSearch = false
    let isTopDestinations = false

    if (route.query.destination) {
      // Check if the destination param matches a region slug
      const region = regions.value.find(r => r.slug === route.query.destination)
      if (region) {
        isRegionSearch = true
        regionSlug = region.slug
      }
      else if (route.query.destination === 'top-destination') {
        isRegionSearch = true
        isTopDestinations = true
      }
      else {
        // Otherwise, treat as destination slug
        const found = destinations.value.find(d => d.slug === route.query.destination)
        if (found) destination = found.title
      }
    }

    const travelType = route.query.travelType || null
    const fromList = route.query.from || null

    const voyagesQuery = groq`*[_type == "voyage"]{
      _id,
      title,
      "slug": slug.current,
      image,
      groupeAvailable,
      privatisationAvailable,
      monthlyAvailability,
      destinations[]-> {
        _id,
        title
      }
    }`

    let voyages = await sanity.fetch(voyagesQuery)

    if (isRegionSearch) {
      let destinationList = []
      if (isTopDestinations) {
        destinationList = destinations.value.filter(d => d.isTopDestination)
      }
      else {
        const region = regions.value.find(r => r.slug === regionSlug)
        if (region) {
          destinationList = destinations.value.filter(dest =>
            dest.regions && dest.regions.some(r => r.nom === region.nom),
          )
        }
      }
      const destinationNames = destinationList.map(d => d.title)
      voyages = voyages.filter(v =>
        v.destinations?.some(d => destinationNames.includes(d.title)),
      )
    }
    else {
      voyages = filterByDestination(voyages, destination)
    }

    voyages = filterByType(voyages, travelType)
    voyages = filterByDate(voyages, fromList)

    return _.uniqBy(voyages, 'slug')
  },
  { watch: [routeQuery, regions, destinations] },
)

const nbVoyages = computed(() => {
  return voyages.value?.length || 0
})
function reinitiliazeFilter() {
  router.push({
    path: '/search',
    query: null,
  })
}
</script>

<style scoped>
.reset-btn-size {
  height: 62px!important;
  width: 172px!important;
}
@media (max-width: 900px) {
  .reset-btn-size {
    height: 48px!important;
    width: 120px!important;
  }
}
@media (max-width: 600px) {
  .reset-btn-size {
    height: 38px!important;
    width: 110px!important;
  }
}
</style>
