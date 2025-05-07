<template>
  <div>
    <SearchField />
    <div
      v-for="query of route.query"
      :key="query"
    >
      {{ query }}
    </div>
    <v-list v-if="voyages?.length > 0">
      <p> {{ voyages.length == 1 ?'1 voyage' : `${voyages.length} voyages` }} </p>
      <v-list-item
        v-for="voyage in voyages"
        :key="voyage.id"
      >
        <v-list-item-title>{{ voyage.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
    <div v-else>
      Zéro voyages trouvés selon vos critères
    </div>
  </div>
</template>

<script setup>
import dayjs from 'dayjs'

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

    let query = queryCollection('voyagesv2')

    const getFilteredByDate = async (query, dateRange) => {
      const [start, end] = dateRange?.split('-') || []
      const capStartMonth = dayjs(start).format('MMMM').charAt(0).toUpperCase() + dayjs(start).format('MMMM').slice(1)
      const capEndMonth = dayjs(end).format('MMMM').charAt(0).toUpperCase() + dayjs(end).format('MMMM').slice(1)
      const voyages = await query.all()
      return voyages.filter(v => v.availableMonths?.includes(capStartMonth) || v.availableMonths?.includes(capEndMonth))
    }

    // CASE 1: Only destination
    if (destination && !travelType && !dateRange) {
      console.log(destination)
      query = query.where('destination', '=', destination)
      return await query.all()
    }

    // CASE 2: Only travel type
    if (!destination && travelType && !dateRange) {
      query = query.where('type', '=', travelType)
      return await query.all()
    }

    // CASE 3: Only date range
    if (!destination && !travelType && dateRange) {
      return await getFilteredByDate(query, dateRange)
    }

    // CASE 4: Destination + travel type
    if (destination && travelType && !dateRange) {
      query = query
        .where('destination', '=', destination)
        .andWhere(q => q.where('type', '=', travelType))
      return await query.all()
    }

    // CASE 5: Destination + date
    if (destination && !travelType && dateRange) {
      query = query.where('destination', '=', destination)
      return await getFilteredByDate(query, dateRange)
    }

    // CASE 6: Travel type + date
    if (!destination && travelType && dateRange) {
      query = query.where('type', '=', travelType)
      return await getFilteredByDate(query, dateRange)
    }

    // CASE 7: All filters
    if (destination && travelType && dateRange) {
      query = query
        .where('destination', '=', destination)
        .andWhere(q => q.where('type', '=', travelType))
      return await getFilteredByDate(query, dateRange)
    }

    return []
  },
  {
    watch: [routeQuery],
  },
)
</script>
