<template>
  <v-container
    ref="searchField"
    class="search-field-container px-0 px-md-3 py-0"
  >
    <div
      ref="container"
      class="rounded-md bg-white pa-3 pa-md-4 pb-0  search-field-min-height "
      :class="{ 'search-field-shadow': !showDestinationsCarousel }"
    >
      <v-row
        align="center"
      >
        <v-col
          cols="12"
          md="3"
          class="pb-1 pb-md-3"
        >
          <v-autocomplete
            :id="destinationId"
            v-model="destinationChoice"
            v-model:search="search"
            :items="filteredRegions"
            :custom-filter="customFilter"
            :loading="regionsStatus === 'pending' || destinationsStatus === 'pending' || searchFieldContentStatus === 'pending'"
            hide-details
            :label="searchFieldContent?.destination || 'Destination'"
            :aria-label="searchFieldContent?.destination || 'Rechercher une destination'"
            clearable
            @update:model-value="clearDestination"
          >
            <template #prepend-inner>
              <v-img
                :src="img('/icons/two-pin-marker.svg', { format: 'webp', quality: 70, width: 640, height: 640 })"
                alt="Pin marker"
                width="24"
                height="24"
              />
            </template>
            <template #item="{ item }">
              <v-list
                lines="one"
                select-strategy="classic"
                class="px-4"
              >
                <v-hover>
                  <template #default="{ isHovering, props }">
                    <v-list-item-title
                      v-bind="props"
                      :style="{ cursor: isAggregatedRegion(item) ? 'no-pointer' : 'pointer' }"
                      class="d-flex align-center  py-2 justify-start ga-2 text-uppercase text-subtitle-2 font-weight-bold hover-bg-primary border-b "
                      :class="{
                        'bg-grey-light text-primary': isHovering && !isAggregatedRegion(item),
                        'bg-grey-lighten-4 text-primary': isAggregatedRegion(item),
                      }"
                      @click.stop="!isAggregatedRegion(item) && selectRegion(item.raw)"
                    >
                      <div v-if="item.raw.value === 'top-destination'">
                        <v-img
                          :src="img('/favicon.png', { format: 'webp', quality: 70, width: 640, height: 640 })"
                          width="20"
                          height="20"
                          class="align-self-end"
                        />
                      </div>
                      <v-icon
                        v-else
                        :icon="mdiEarth"
                        class="svg-white"
                        size="24"
                      />

                      {{ item.title }}
                    </v-list-item-title>
                  </template>
                </v-hover>

                <v-list-item
                  v-for="destination, index in filteredDestinationsForRegion(item.raw, search, item)"
                  :key="index"
                  density="compact"
                  class="px-0 mb-0 "
                  :class="{ ' pb-2 border-b': index !== filteredDestinationsForRegion(item.raw, search, item).length - 1 }"
                  nav
                  @click="selectDestination(destination)"
                >
                  <v-list-item-title
                    class="text-subtitle-2 d-flex align-center justify-start ga-2 px-3"
                  >
                    <v-icon :icon="item.raw.value === 'top-destination' ? mdiThumbUpOutline : mdiMapMarker" />
                    {{ destination.titre }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </template>
          </v-autocomplete>
        </v-col>
        <v-col
          cols="12"
          md="3"
          class="pb-1 pb-md-3"
        >
          <v-select
            :id="travelTypeId"
            v-model="travelTypeChoice"
            :loading="searchFieldContentStatus === 'pending'"
            :items="travelTypes"
            hide-details
            :label="searchFieldContent?.travelType || 'Type de voyage'"
            :aria-label="searchFieldContent?.travelType || 'Sélectionner le type de voyage'"
            clearable
          >
            <template #prepend-inner>
              <v-img
                :src="img('/icons/business-team.svg', { format: 'webp', quality: 70, width: 640, height: 640 })"
                alt="Team icon"
                width="24"
                height="24"
              />
            </template>
          </v-select>
        </v-col>
        <v-col
          cols="12"
          md="3"
          class="pb-1 pb-md-3"
        >
          <v-select
            :id="dateId"
            v-model="date"
            multiple
            hide-details
            :items="months"
            :loading="searchFieldContentStatus === 'pending'"
            :label="searchFieldContent?.period || 'Période'"
            :aria-label="searchFieldContent?.period || 'Sélectionner la période de voyage'"
            class="search-field-max-height"
          >
            <template #prepend-inner>
              <v-img
                :src="img('/icons/calendar.svg', { format: 'webp', quality: 70, width: 640, height: 640 })"
                alt="Calendar icon"
                width="24"
                height="24"
              />
            </template>
          </v-select>
        </v-col>
        <v-col
          cols="12"
          md="3"
          class="h-100 pb-4"
        >
          <v-btn
            height="56"
            block
            :loading="destinationsStatus === 'pending' || regionsStatus === 'pending' || searchFieldContentStatus === 'pending'"
            color="secondary"
            class="text-body-1 font-weight-bold"
            @click="searchFn"
          >
            {{ searchFieldContent?.discoverTrips || 'Découvrir les voyages' }}
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { mdiEarth, mdiMapMarker, mdiThumbUpOutline } from '@mdi/js'
import _ from 'lodash'
import { useImage } from '#imports'

const img = useImage()
const router = useRouter()
const route = useRoute()

const { data: searchFieldContent, status: searchFieldContentStatus } = useAsyncData('search-field-content', () =>
  queryCollection('search_field').first(),
)

const isSelectionARegion = useState('isSelectionARegion', () => false)
const { gtag } = useGtag()
const destinationId = useId()
const travelTypeId = useId()
const dateId = useId()
const date = useState('searchDate', () => {
  // Parse the 'from' query parameter to convert comma-separated string back to array
  if (route.query.from) {
    return route.query.from.split(',').map(Number).filter(num => num > 0)
  }
  return []
})
const travelTypeChoice = ref(route.query.travelType || null)
const destinationChoice = ref(route.query.destination || null)
const showDestinationsCarousel = ref(false)
const search = useState('search', () => route.query.destination || null)

const months = computed(() => {
  const locale = 'fr-FR'

  // Generate months using Intl.DateTimeFormat
  const monthNames = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2025, i, 1) // Use any year, month index, day 1
    return new Intl.DateTimeFormat(locale, { month: 'long' }).format(date)
  })

  // Capitalize first letter of each month
  const capitalizedMonths = monthNames.map(month =>
    month.charAt(0).toUpperCase() + month.slice(1),
  )

  return [
    { title: searchFieldContent.value?.allPeriods || 'Toutes périodes', value: 0 },
    ...capitalizedMonths.map((month, index) => ({
      title: month,
      value: index + 1,
    })),
  ]
})

const { data: destinations, destinationsStatus } = useAsyncData('destinations-in-search', () => {
  return queryCollection('destinations').select('titre', 'slug', 'metaDescription', 'published', 'regions', 'image', 'stem', 'isTopDestination').where('published', '=', true).all()
})
const { data: regions, status: regionsStatus } = useAsyncData('regions', () => {
  return queryCollection('regions').select('nom', 'slug', 'meta_description').all()
})

const mappedDestinationsToRegions = computed(() => {
  if (!regions.value || !destinations.value) return []
  // Create Top destination pseudo-region
  const topDestinations = destinations.value.filter(d => d.isTopDestination)
  const topRegion = {
    title: searchFieldContent.value?.topDestinations || 'Top destinations',
    value: 'top-destination',
    image: null,
    destinations: topDestinations,
  }

  topRegion.destinations.push({
    titre: 'France',
    slug: 'france',
    metaDescription: 'France',
    published: true,
    regions: ['Europe'],
    image: null,
    isTopDestination: true,
  })

  // Normal region mapping
  const regionGroups = regions.value.map((region) => {
    return {
      title: region.nom,
      value: region.slug,
      image: region.image,
      destinations: destinations.value.filter(d => d.regions.some(r => r.nom === region.nom)),
    }
  })
  // filter out the france destination in the Europe region
  regionGroups.forEach((region) => {
    if (region.title === 'Europe') {
      region.destinations = region.destinations.filter(d => !d.regions.some(r => r.nom === 'France'))
    }
  })
  // Prepend Top destination region if there are any
  return topDestinations.length > 0 ? [topRegion, ...regionGroups] : regionGroups
})

const travelTypes = computed(() => [
  searchFieldContent.value?.travelTypes?.individual || 'Voyage individuel',
  searchFieldContent.value?.travelTypes?.group || 'Voyage en groupe',
])

// Normalization function for accent/hyphen insensitivity
function normalize(str) {
  return str
    ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/-/g, '').toLowerCase()
    : ''
}

function customFilter(itemTitle, queryText, item) {
  if (!queryText) return true
  const searchText = normalize(queryText)
  // Check if region matches
  const regionMatch = itemTitle && normalize(itemTitle).includes(searchText)
  if (regionMatch) return true
  // Check if any destination matches
  if (item.raw.destinations && Array.isArray(item.raw.destinations)) {
    return item.raw.destinations.some(dest =>
      normalize(dest.titre).includes(searchText),
    )
  }
  return false
}

// Aggregate destinations by unique slug/titre, collecting all regions they belong to
function aggregateDestinations(mappedRegions, query) {
  const searchText = normalize(query)
  const destinationMap = {}
  mappedRegions.forEach((region) => {
    region.destinations.forEach((dest) => {
      const key = dest.slug || dest.titre
      if (!destinationMap[key]) {
        // Only add if matches search
        if (!query || normalize(dest.titre).includes(searchText)) {
          destinationMap[key] = {
            ...dest,
            regions: [region.title],
          }
        }
      }
      else {
        // Add region to existing
        if (!destinationMap[key].regions.includes(region.title)) {
          destinationMap[key].regions.push(region.title)
        }
      }
    })
  })
  // Return as array
  return Object.values(destinationMap)
}

function filteredDestinationsForRegion(region, query, _item) {
  // Only show destinations that match the query, deduplicated and aggregated
  const searchText = normalize(query)
  if (!query || normalize(region.title).includes(searchText)) {
    // Show all destinations for region if region matches
    return region.destinations
  }
  // Aggregate all destinations across regions
  const allAggregated = aggregateDestinations([region], query)
  return allAggregated.filter(dest =>
    normalize(dest.titre).includes(searchText),
  )
}

// For the autocomplete dropdown, aggregate all destinations and group by their regions
const filteredRegions = computed(() => {
  if (!search.value) return mappedDestinationsToRegions.value
  const searchText = normalize(search.value)
  // Find regions whose name matches the search
  const matchingRegions = mappedDestinationsToRegions.value.filter(region =>
    normalize(region.title).includes(searchText),
  )
  // Collect all destinations from matching regions
  let regionDestinations = []
  matchingRegions.forEach((region) => {
    regionDestinations = regionDestinations.concat(region.destinations)
  })
  // Aggregate all destinations matching by name (across all regions)
  const nameAggregated = aggregateDestinations(mappedDestinationsToRegions.value, search.value)
  // Combine both sets, deduplicate by slug or titre
  const allDestinations = [...regionDestinations, ...nameAggregated]
  const uniqDestinations = _.uniqBy(allDestinations, dest => dest.slug || dest.titre)
  // Aggregate region labels for each destination
  const destinationMap = {}
  uniqDestinations.forEach((dest) => {
    const key = dest.slug || dest.titre
    if (!destinationMap[key]) {
      destinationMap[key] = {
        ...dest,
        regions: dest.regions ? [...dest.regions] : [],
      }
    }
    // Add all regions this destination belongs to
    mappedDestinationsToRegions.value.forEach((region) => {
      if (region.destinations.some(d => (d.slug || d.titre) === key)) {
        if (!destinationMap[key].regions.includes(region.title)) {
          destinationMap[key].regions.push(region.title)
        }
      }
    })
  })
  // Group by region label
  const regionGroups = {}
  Object.values(destinationMap).forEach((dest) => {
    const processedRegions = _.uniq(dest.regions.map(r => typeof r === 'string' ? r : r.nom))

    const regionLabel = processedRegions.length > 1 ? processedRegions.join(' & ') : processedRegions[0]
    if (!regionGroups[regionLabel]) regionGroups[regionLabel] = []
    regionGroups[regionLabel].push(dest)
  })
  // Return as array of { title, destinations, value } - preserve the value property
  return Object.entries(regionGroups).map(([title, destinations]) => {
    // Find the original region object to get the value property
    const originalRegion = mappedDestinationsToRegions.value.find(region => region.title === title)
    return {
      title,
      destinations,
      value: originalRegion ? originalRegion.value : null,
    }
  })
})

const selectedRegionSlug = useState('selectedRegionSlug', () => null)

function searchFn() {
  const query = {}

  if (destinationChoice.value) {
    if (isSelectionARegion.value) {
      // Use the stored region slug
      query.destination = selectedRegionSlug.value
    }
    else if (destinationChoice.value === 'France') {
      query.destination = 'france'
    }
    else {
      const found = destinations.value.find(d => d.titre === destinationChoice.value)
      if (found) {
        query.destination = found.slug
      }
    }
  }
  if (travelTypeChoice.value) {
    query.travelType = travelTypeChoice.value
  }
  if (date.value.length > 0 && !date.value.includes(0)) {
    query.from = date.value.join(',')
  }

  gtag('event', 'search', { eventAction: 'Click', destination: `${destinationChoice.value}`, travelType: `${travelTypeChoice.value}`, from: `${date.value[0]}`, to: `${date.value[1]}` })
  router.push({
    path: '/search',
    query,
  })
}

function selectDestination(item) {
  isSelectionARegion.value = false
  destinationChoice.value = item.titre
  search.value = item.slug
  setTimeout(() => {
    const input = document.querySelector(`#${destinationId}`)
    if (input) input.blur()
  }, 0)
}
function selectRegion(region) {
  isSelectionARegion.value = true
  destinationChoice.value = region.title
  selectedRegionSlug.value = region.value
  search.value = region.title
  setTimeout(() => {
    const input = document.querySelector(`#${destinationId}`)
    if (input) input.blur()
  }, 0)
}
function clearDestination() {
  destinationChoice.value = null
  search.value = ''
  isSelectionARegion.value = false
  selectedRegionSlug.value = null
}

function isAggregatedRegion(item) {
  // Check if this is an aggregated region (contains ' & ' in the title)
  return item.title && item.title.includes(' & ')
}

// Watch for when data is available and handle route parameters
watch([regions, destinations], ([regionsData, destinationsData]) => {
  if (regionsData && destinationsData) {
    // Handle destination parameter
    if (route.query.destination) {
      const region = regionsData.find(r => r.slug === route.query.destination)
      if (region) {
        selectRegion(region)
      }
      else {
        const destination = destinationsData.find(d => d.slug === route.query.destination)
        if (destination) {
          selectDestination(destination)
        }
      }
    }

    // Handle travelType parameter
    if (route.query.travelType) {
      travelTypeChoice.value = route.query.travelType
    }

    // Handle date parameter (from)
    if (route.query.from) {
      date.value = route.query.from.split(',').map(Number).filter(num => num > 0)
    }
  }
}, { immediate: true })
</script>

<style scoped>
:deep(.v-icon__svg) {
  color: rgb(var(--v-theme-primary)) !important;
}
:deep(.v-field__input) {
  color: rgb(var(--v-theme-primary)) !important;
}
.search-field-container {
  max-width: 1070px;
  position: relative;
}

.search-field-shadow {
  box-shadow: 5px 5px 100px 0px rgba(43, 76, 82, 0.5);
}
.search-field-min-height {
  min-height: 88px!important;
  box-sizing: border-box;
}
.no-pointer {
  cursor:default!important;
}
</style>
