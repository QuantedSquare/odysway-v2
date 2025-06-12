<template>
  <v-container
    fluid
  >
    <SearchHeroSection :destination="fetchedDestination">
      <SearchField />
    </SearchHeroSection>
    <v-row class="py-6 py-md-10">
      <v-col
        cols=""
        md="auto"
        class="d-flex align-center"
      >
        <span class="text-primary text-h3 font-weight-bold mr-5">{{ nbVoyages === 1 ? '1 voyage' : `${nbVoyages}
            voyages` }}</span>
      </v-col>
      <v-col
        cols=""
        md="auto"
        class="d-flex align-center ga-2"
      >
        <!-- Add closable props & logic -->
        <v-chip
          v-if="routeQuery.destination"
          variant="flat"
          :size="lgAndUp ? 'x-large' : 'large'"
          color="secondary-light-2"
          density="comfortable"
        >
          <span class="d-flex align-center text-white text-caption text-sm-subtitle-1 px-3 pb-1">
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
      </v-col>
      <v-spacer />
      <v-col
        v-if="route.fullPath !== '/search'"
        cols=""
        md="auto"
        class="d-flex justify-end"
      >
        <v-btn
          color="primary"
          variant="outlined"
          size="large"
          class="text-subtitle-2"
          @click="reinitiliazeFilter"
        >
          Réinitialiser
        </v-btn>
      </v-col>
    </v-row>
    <DisplayVoyagesRow
      :voyages="voyages"
      :is-search="true"
    />
    <!-- <v-container>
      <v-row>
        <ContentRenderer
          v-if="fetchedDestinationContentStatus === 'success' && fetchedDestinationContent"
          :value="fetchedDestinationContent"
        />
      </v-row>
    </v-container> -->
    <ColorContainer color="grey-light-2">
      <InfoContainer>
        <template #top>
          <AvatarsRowStack />
        </template>
        <template #title>
          Vous hésitez encore ?
        </template>
        <template #description>
          Prenez un RDV avec un spécialiste qui vous conseillera selon vos envies.
        </template>
        <template #bottom>
          <CtaButton
            color="secondary"
            link="/calendly"
          >
            <template #text>
              Prendre RDV
            </template>
          </CtaButton>
        </template>
      </InfoContainer>
    </ColorContainer>
  </v-container>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import _ from 'lodash'
import SearchField from '~/components/content/SearchField.vue'

const { lgAndUp } = useDisplay()
useSeoMeta({
  robots: 'noindex, follow',
  canonical: 'https://www.odysway.com/search',
})
const router = useRouter()
const route = useRoute()
const routeQuery = computed(() => route.query)

const { data: fetchedDestination } = useAsyncData('fetchedDestination', () => {
  if (route.query.destination) {
    return queryCollection('destinations').where('stem', '=', `destinations/${route.query.destination}/${route.query.destination}`).where('published', '=', true).select('titre', 'interjection', 'image').first()
  }
  return null
}, {
  watch: [routeQuery],
})

// const { data: fetchedDestinationContent, status: fetchedDestinationContentStatus } = useAsyncData('fetchedDestinationContent', () => {
//   if (route.query.destination) {
//     return queryCollection('destinationsContent').where('stem', 'LIKE', `destinations/${route.query.destination}/%`).where('published', '=', true).first()
//   }
//   return null
// }, {
//   watch: [routeQuery],

// })
// provide('page', fetchedDestinationContent)

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
  return voyages.filter(v => v.destinations?.some(d => d.name.includes(destination)))
}

function filterByType(voyages, travelType) {
  if (!travelType) return voyages
  const groupeType = travelType === 'Voyage en groupe'
  return voyages.filter(v => v.groupeAvailable === groupeType && v.monthlyAvailability?.length > 0)
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

const { data: regions } = await useAsyncData('regions', () => {
  return queryCollection('regions').all()
})
const { data: destinations } = await useAsyncData('destinations', () => {
  return queryCollection('destinations').where('published', '=', true).all()
})

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
        if (found) destination = found.titre
      }
    }

    const travelType = route.query.travelType || null
    const fromList = route.query.from || null

    let voyages = await queryCollection('voyages').where('published', '=', true).all()

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
      const destinationNames = destinationList.map(d => d.titre)
      voyages = voyages.filter(v =>
        v.destinations?.some(d => destinationNames.includes(d.name)),
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
