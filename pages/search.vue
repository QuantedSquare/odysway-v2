<template>
  <div>
    <SearchField />
    <v-list>
      <v-list-item
        v-for="deal in deals"
        :key="deal.id"
      >
        <v-list-item-title>{{ deal.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </div>
</template>

<script setup>
const route = useRoute()

const { data: deals } = useAsyncData('search', async () => {
  const destination = route.query.destination?.toUpperCase() || 'FR'
  let query = queryCollection('deals').where('iso', '=', destination).all()
  if (route.query.departure) {
    query = query.where('departure', '=', route.query.departure)
  }
  if (route.query.return) {
    query = query.where('return', '=', route.query.return)
  }
  if (route.query.departureDate) {
    query = query.where('departureDate', '=', route.query.departureDate)
  }

  console.log('deals', query)
  return query
}, {
  watch: [() => route.query.destination],
})
</script>
