<template>
  <v-container
    class="py-0 my-0"
    fluid
  >
    <SearchHeroSection :destination="fetchedDestination">
      <SearchContainer />
    </SearchHeroSection>
    <v-container>
      <v-row>
        <v-col
          cols="12"
          md="auto"
          class="d-flex align-center"
        >
          <span class="text-primary text-h3 font-weight-bold mr-5">{{ nbVoyages === 1 ? '1 voyage' : `${nbVoyages}
            voyages` }}</span>
        </v-col>
        <v-col
          cols="12"
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
            v-if="routeQuery.from && routeQuery.to"
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
          cols="12"
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
      <v-row>
        <v-col
          v-if="voyagesWithCta?.length > 0"
          cols="12"
        >
          <v-row>
            <v-col
              v-for="voyage in voyagesWithCta"
              :key="voyage.id"
              cols="12"
              sm="6"
              lg="4"
              xl="3"
            >
              <CtaColCard v-if="voyage.isCta" />
              <!-- TODO : refactor voyage card -->
              <SearchVoyageCard
                v-else
                :voyage="voyage"
              />
            </v-col>
          </v-row>
        </v-col>
        <v-col
          v-else
          cols="12"
        >
          <p class="text-body-1">
            Modifiez vos critères de recherche
          </p>
        </v-col>
      </v-row>
    </v-container>
    <v-container>
      <v-row>
        <ContentRenderer
          v-if="fetchedDestinationContentStatus === 'success' && fetchedDestinationContent"
          :value="fetchedDestinationContent"
        />
      </v-row>
    </v-container>
  </v-container>
</template>

<script setup>
import dayjs from 'dayjs'
import { useDisplay } from 'vuetify'

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

const { data: fetchedDestinationContent, status: fetchedDestinationContentStatus } = useAsyncData('fetchedDestinationContent', () => {
  if (route.query.destination) {
    return queryCollection('destinationsContent').where('stem', 'LIKE', `destinations/${route.query.destination}/%`).where('published', '=', true).first()
  }
  return null
}, {
  watch: [routeQuery],

})
provide('page', fetchedDestinationContent)

const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const parsedDates = computed(() => {
  const start = dayjs(routeQuery.value.from).format('MMMM YYYY')
  const end = dayjs(routeQuery.value.to).format('MMMM YYYY')
  if (start === end) {
    return capitalizeFirstLetter(start)
  }
  return `${capitalizeFirstLetter(start)} - ${capitalizeFirstLetter(end)}`
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

function filterByDate(voyages, fromDate, toDate) {
  if (!fromDate || !toDate) return voyages
  const startDate = dayjs(fromDate)
  const endDate = dayjs(toDate)
  const monthsInRange = []
  let current = startDate.startOf('month')
  while (current.isBefore(endDate) || current.isSame(endDate, 'month')) {
    monthsInRange.push(capitalizeFirstLetter(current.format('MMMM')))
    current = current.add(1, 'month')
  }
  return voyages.filter(v =>
    v.monthlyAvailability?.some(m => monthsInRange.includes(m.month)),
  )
}

const { data: voyages } = useAsyncData(
  `search-${JSON.stringify(route.query)}`,
  async () => {
    let destination = null
    if (route.query.destination) {
      const { titre } = await queryCollection('destinations')
        .where('stem', '=', `destinations/${route.query.destination}/${route.query.destination}`)
        .where('published', '=', true)
        .select('titre')
        .first()
      destination = titre
    }

    const travelType = route.query.travelType || null
    const fromDate = route.query.from || null
    const toDate = route.query.to || null

    let voyages = await queryCollection('voyages').where('published', '=', true).all()

    voyages = filterByDestination(voyages, destination)
    voyages = filterByType(voyages, travelType)
    voyages = filterByDate(voyages, fromDate, toDate)

    return voyages
  },
  { watch: [routeQuery] },
)

const nbVoyages = computed(() => {
  return voyages.value?.length
})

const voyagesWithCta = computed(() => {
  const original = voyages.value || []
  const result = [...original]
  const cta = { id: 'cta', isCta: true }

  if (original.length >= 2) {
    result.splice(2, 0, cta)
  }
  else {
    result.push(cta)
  }

  return result
})

function reinitiliazeFilter() {
  searchDestination.value = null
  searchTravelType.value = null
  searchDate.value = []
  router.push({
    path: '/search',
    query: null,
  })
}
</script>
