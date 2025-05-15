<template>
  <v-container
    class="py-0 my-0"
    fluid
  >
    <SearchHeroSection :destination="fetchedDestination">
      <SearchField />
    </SearchHeroSection>
    <v-container>
      <v-row>
        <v-col
          cols="12"
          md="auto"
          class="d-flex align-center"
        >
          <span class="text-primary text-h3 font-weight-bold mr-5">{{ nbVoyages === 1 ? '1 voyage' : `${nbVoyages} voyages` }}</span>
        </v-col>
        <v-col
          cols="12"
          md="auto"
          class="d-flex align-center ga-2"
        >
          <v-chip
            v-if="routeQuery.destination"
            variant="flat"
            :size="lgAndUp ? 'x-large' : 'large'"
            color="secondary-light-2"
            density="comfortable"
          >
            <span class="d-flex align-center text-white text-caption text-sm-subtitle-1 px-3 pb-1">
              {{ routeQuery.destination }}
            </span>
          </v-chip>
          <v-chip
            v-if="routeQuery.travelType"
            variant="flat"
            :size="lgAndUp ? 'x-large' : 'large'"
            color="secondary-light-2"
            density="comfortable"
          >
            <span class="d-flex align-center text-white text-caption text-sm-subtitle-1 px-3 pb-1">
              {{ routeQuery.travelType }}
            </span>
          </v-chip>
          <v-chip
            v-if="routeQuery.dateRange"
            variant="flat"
            :size="lgAndUp ? 'x-large' : 'large'"
            color="secondary-light-2"
            density="comfortable"
          >
            <span class="d-flex align-center text-white text-caption text-sm-subtitle-1 px-3 pb-1">
              {{ parsedDateRange }}
            </span>
          </v-chip>
        </v-col>
        <v-spacer />
        <v-col
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
      <v-row v-if="fetchedDestinationContentStatus === 'success'">
        <ContentRenderer
          v-if="fetchedDestinationContent"
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

const router = useRouter()
const route = useRoute()
const routeQuery = computed(() => route.query)

const { data: fetchedDestination } = useAsyncData('fetchedDestination', () => {
  if (route.query.destination) {
    return queryCollection('destinations').where('stem', '=', `destinations/${route.query.destination}/${route.query.destination}`).select('titre', 'interjection', 'image').first()
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
console.log('fetchedDestinationContent', fetchedDestinationContent.value)
provide('page', fetchedDestinationContent)

const parsedDateRange = computed(() => {
  const [start, end] = routeQuery.value.dateRange.split('-') || []
  return `${dayjs(start).format('MMMM YYYY')} - ${dayjs(end).format('MMMM YYYY')}`
})

const { data: voyages } = useAsyncData(
  `search-${JSON.stringify(route.query)}`,
  async () => {
    let destination = null

    if (route.query.destination) {
      const { titre } = await queryCollection('destinations').where('stem', '=', `destinations/${route.query.destination}/${route.query.destination}`).select('titre').first()
      destination = titre
    }
    const travelType = route.query.travelType || null
    const dateRange = route.query.dateRange || null

    const allVoyages = await queryCollection('voyages').all()
    if (!destination && !travelType && !dateRange) {
      console.log('Aucun filtre — retour vide')
      return allVoyages
    }

    const getFilteredByDestination = (allVoyages, destinationParam) => {
      return allVoyages.filter(v => v.destinations?.includes(destinationParam))
    }

    const getFilteredByType = (allVoyages, travelType) => {
      const groupeType = travelType === 'Voyage en groupe'
      return allVoyages.filter(v => v.pricing?.groupeAvailable === groupeType && v.monthlyAvailability?.length > 0)
    }

    const getFilteredByDate = (allVoyages, dateRange) => {
      const [start, end] = dateRange?.split('-') || []
      const startDate = dayjs(start)
      const endDate = dayjs(end)
      const monthsInRange = []

      let current = startDate.startOf('month')
      while (current.isBefore(endDate) || current.isSame(endDate, 'month')) {
        const month = current.format('MMMM')
        const capitalized = month.charAt(0).toUpperCase() + month.slice(1)
        monthsInRange.push(capitalized)
        current = current.add(1, 'month')
      }

      return allVoyages.filter(v =>
        v.monthlyAvailability?.some(m => monthsInRange.includes(m)),
      )
    }

    // CASE 1: Only destination
    if (destination && !travelType && !dateRange) {
      return getFilteredByDestination(allVoyages, destination)
    }

    // CASE 2: Only travel type
    if (!destination && travelType && !dateRange) {
      return getFilteredByType(allVoyages, travelType)
    }

    // CASE 3: Only date range
    if (!destination && !travelType && dateRange) {
      return getFilteredByDate(allVoyages, dateRange)
    }

    // CASE 4: Destination + travel type
    if (destination && travelType && !dateRange) {
      const filteredByDestination = getFilteredByDestination(allVoyages, destination)
      return getFilteredByType(filteredByDestination, travelType)
    }

    // CASE 5: Destination + date
    if (destination && !travelType && dateRange) {
      const filteredByDestination = getFilteredByDestination(allVoyages, destination)
      return getFilteredByDate(filteredByDestination, dateRange)
    }

    // CASE 6: Travel type + date
    if (!destination && travelType && dateRange) {
      const filteredByType = getFilteredByType(allVoyages, travelType)
      return getFilteredByDate(filteredByType, dateRange)
    }

    // CASE 7: All filters
    if (destination && travelType && dateRange) {
      const filteredByDestination = getFilteredByDestination(allVoyages, destination)
      const filteredByType = getFilteredByType(filteredByDestination, travelType)
      return getFilteredByDate(filteredByType, dateRange)
    }
    return []
  },
  {
    watch: [routeQuery],

  },
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
  router.push({
    path: '/search',
    query: null,
  })
}
</script>
