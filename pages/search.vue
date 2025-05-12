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
            <span class="d-flex align-center text-white text-caption text-sm-subtitle-1 px-3">
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
            <span class="d-flex align-center text-white text-caption text-sm-subtitle-1 px-3">
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
            <span class="d-flex align-center text-white text-caption text-sm-subtitle-1 px-3">
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
  </v-container>
</template>

<script setup>
import dayjs from 'dayjs'
import { useDisplay } from 'vuetify'

const { lgAndUp } = useDisplay()

const router = useRouter()
const route = useRoute()
const routeQuery = computed(() => route.query)

const fetchedDestination = ref(null)

const parsedDateRange = computed(() => {
  const [start, end] = routeQuery.value.dateRange.split('-') || []
  return `${dayjs(start).format('MMMM YYYY')} - ${dayjs(end).format('MMMM YYYY')}`
})

const { data: voyages } = useAsyncData(
  `search-${JSON.stringify(route.query)}`,
  async () => {
    const destination = route.query.destination || null
    const travelType = route.query.travelType || null
    const dateRange = route.query.dateRange || null

    if (!destination && !travelType && !dateRange) {
      console.log('Aucun filtre — retour vide')
      fetchedDestination.value = null
      return []
    }

    const allVoyages = await queryCollection('voyages').all()
    fetchedDestination.value = await queryCollection('destinations').where('titre', '==', route.query.destination).select('titre', 'interjection').first()
    // console.log('destination found', destinations)

    const getFilteredByDestination = (allVoyages, destination) => {
      return allVoyages.filter(v => v.destinations?.includes(destination))
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
    fetchedDestination.value = null
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
    query: {
      destination: null,
      travelType: null,
      dateRange: null,
    },
  })
}
</script>
