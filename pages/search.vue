<template>
  <v-container
    class="py-0 my-0"
    fluid
  >
    <SearchHeroSection>
      <SearchField />
    </SearchHeroSection>
    <v-container>
      <v-row>
        <v-col
          cols="12"
          class="d-flex ga-2 align-center"
        >
          <span class="text-h3 font-weight-bold">{{ nbVoyages === 1 ? '1 voyage' : `${nbVoyages} voyages` }}</span>
          <v-chip
            v-if="routeQuery.destination"
            variant="flat"
            :size="lgAndUp ? 'x-large' : 'large'"
            color="secondary-light-2"
            density="comfortable"
          >
            <span class="d-flex align-center text-white text-caption text-sm-subtitle-1  px-3">
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
            <span class="d-flex align-center text-white text-caption text-sm-subtitle-1  px-3">
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
            <span class="d-flex align-center text-white text-caption text-sm-subtitle-1  px-3">
              {{ routeQuery.dateRange }}
            </span>
          </v-chip>
        </v-col>
        <v-col
          v-if="voyages?.length > 0"
          cols="12"
        >
          <v-row>
            <v-col
              v-for="voyage in voyages"
              :key="voyage.id"
              cols="12"
              sm="6"
              lg="4"
            >
              <SearchVoyageCard :voyage="voyage" />
            </v-col>
          </v-row>
        </v-col>
        <v-col v-else>
          Modifiez vos critères de recherche
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script setup>
import dayjs from 'dayjs'
import { useDisplay } from 'vuetify'

const { lgAndUp } = useDisplay()
const route = useRoute()
const routeQuery = computed(() => route.query)

const { data: voyages } = useAsyncData(
  `search-${JSON.stringify(route.query)}`,
  async () => {
    const destination = route.query.destination || null
    const travelType = route.query.travelType || null
    const dateRange = route.query.dateRange || null

    if (!destination && !travelType && !dateRange) {
      console.log('Aucun filtre — retour vide')
      return []
    }

    const allVoyages = await queryCollection('voyages').all()

    const getFilteredByDestination = (allVoyages, destination) => {
      return allVoyages.filter(v => v.destinations?.includes(destination))
    }

    const getFilteredByType = (allVoyages, travelType) => {
      const groupeType = travelType === 'Voyage en groupe'
      return allVoyages.filter(v => v.pricing?.groupeAvailable === groupeType && v.monthlyAvailability?.length > 0)
    }

    const getFilteredByDate = (allVoyages, dateRange) => {
      const [start, end] = dateRange?.split('-') || []
      const capStartMonth = dayjs(start).format('MMMM').charAt(0).toUpperCase() + dayjs(start).format('MMMM').slice(1)
      const capEndMonth = dayjs(end).format('MMMM').charAt(0).toUpperCase() + dayjs(end).format('MMMM').slice(1)
      return allVoyages.filter(v => v.monthlyAvailability?.includes(capStartMonth) || v.monthlyAvailability?.includes(capEndMonth))
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
</script>
