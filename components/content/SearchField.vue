<template>
  <div>
    <v-container
      ref="searchField"
      class="search-field-container px-0 px-md-3 py-0 z-index-2003"
    >
      <div
        ref="container"
        class="rounded-md bg-white pa-4 pb-0  search-field-min-height "
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
              :loading="regionsStatus === 'pending'"
              hide-details
              label="Destination"
              clearable
              @update:model-value="clearDestination"
            >
              <template #prepend-inner>
                <v-img
                  :src="img('/icons/two-pin-marker.svg', { format: 'webp', quality: 70, width: 640 })"
                  alt="Pin marker"
                  width="24"
                  height="24"
                />
              </template>
              <template #item="{ props, item }">
                <v-list
                  lines="one"
                  select-strategy="classic"
                >
                  <v-list-item-title class="d-flex align-center  mb-2 py-2 justify-center ga-2 text-uppercase text-subtitle-2 font-weight-bold">
                    <div v-if="item.raw.value === 'top-destination'">
                      <v-img

                        :src="img('/favicon.png', { format: 'webp', quality: 70, width: 640 })"
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

                  <v-list-item
                    v-for="destination, index in filteredDestinationsForRegion(item.raw, search, item)"
                    :key="index"
                    density="compact"
                    class="px-0 mb-0 border-b"
                    :class="{ ' pb-2': index !== filteredDestinationsForRegion(item.raw, search, item).length - 1 }"
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
              :items="travelTypes"
              hide-details
              label="Type de voyage"
              clearable
            >
              <template #prepend-inner>
                <v-img
                  :src="img('/icons/business-team.svg', { format: 'webp', quality: 70, width: 640 })"
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
              label="Période"
              class="search-field-max-height"
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
          <v-col
            cols="12"
            md="3"
            class="h-100 pb-4"
          >
            <v-btn
              height="56"
              block
              :loading="status === 'pending'"
              color="secondary"
              class="text-none text-body-1 font-weight-bold"
              @click="searchFn"
            >
              Découvrir les voyages
            </v-btn>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </div>
</template>

<script setup>
import dayjs from 'dayjs'
import { ref, computed } from 'vue'
import { mdiEarth, mdiMapMarker, mdiThumbUpOutline } from '@mdi/js'
import _ from 'lodash'
import { useImage } from '#imports'

const img = useImage()
const router = useRouter()
const route = useRoute()
// const dateMenu = ref(false)
const { gtag } = useGtag()
const destinationId = useId()
const travelTypeId = useId()
const dateId = useId()
const date = useState('searchDate', () => [])
const travelTypeChoice = useState('searchTravelType', () => null)
const destinationChoice = ref(route.query.destination || null)
const showDestinationsCarousel = ref(false)
const search = useState('search', () => route.query.destination || null)
const months = [
  { title: 'Toutes périodes', value: 0 },
  { title: 'Janvier', value: 1 },
  { title: 'Février', value: 2 },
  { title: 'Mars', value: 3 },
  { title: 'Avril', value: 4 },
  { title: 'Mai', value: 5 },
  { title: 'Juin', value: 6 },
  { title: 'Juillet', value: 7 },
  { title: 'Août', value: 8 },
  { title: 'Septembre', value: 9 },
  { title: 'Octobre', value: 10 },
  { title: 'Novembre', value: 11 },
  { title: 'Décembre', value: 12 },
]
const { data: destinations, status } = useAsyncData('destinations', () => {
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
    title: 'Top destinations',
    value: 'top-destination',
    image: null,
    destinations: topDestinations,
  }
  // Normal region mapping
  const regionGroups = regions.value.map((region) => {
    return {
      title: region.nom,
      value: region.slug,
      image: region.image,
      destinations: destinations.value.filter(d => d.regions.some(r => r.nom === region.nom)),
    }
  })
  // Prepend Top destination region if there are any
  return topDestinations.length > 0 ? [topRegion, ...regionGroups] : regionGroups
})

const travelTypes = [
  'Voyage individuel', 'Voyage en groupe',
]

// const formattedDate = computed(() => {
//   return date.value ? dayjs(date.value[0]).format('DD/MM') + ' - ' + dayjs(date.value[date.value.length - 1]).format('DD/MM') : ''
// })

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

function filteredDestinationsForRegion(region, query, item) {
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
    const regionLabel = dest.regions.length > 1 ? dest.regions.join(' & ') : dest.regions[0]
    if (!regionGroups[regionLabel]) regionGroups[regionLabel] = []
    regionGroups[regionLabel].push(dest)
  })
  // Return as array of { title, destinations }
  return Object.entries(regionGroups).map(([title, destinations]) => ({ title, destinations }))
})

function searchFn() {
  const query = {}

  if (destinationChoice.value) {
    const value = destinations.value.find(d => d.titre === destinationChoice.value).slug
    console.log('value', value)
    query.destination = value
  }
  if (travelTypeChoice.value) {
    query.travelType = travelTypeChoice.value
  }
  if (date.value.length > 0 && date.value[0] !== 0) {
    query.from = date.value.join(',')
  }

  gtag('event', 'search', { eventAction: 'Click', destination: `${destinationChoice.value}`, travelType: `${travelTypeChoice.value}`, from: `${date.value[0]}`, to: `${date.value[1]}` })
  console.log('route.path', route.path)
  router.push({
    path: '/search',
    query,
  })
}

function selectDestination(item) {
  destinationChoice.value = item.titre
  search.value = item.slug
  console.log('item', item.slug)
  setTimeout(() => {
    const input = document.querySelector(`#${destinationId}`)
    if (input) input.blur()
  }, 0)
}

function clearDestination() {
  destinationChoice.value = null
  search.value = ''
}
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
</style>
