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
// const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation('voyages'))
const route = useRoute()

const { data: deals } = useAsyncData('search', async () => {
  const destination = route.query.destination?.toUpperCase() || 'FR'
  const query = await queryCollection('deals').where('iso', '=', destination).all()
  console.log('deals', query)
  return query
}, {
  watch: [() => route.query.destination],
})
</script>
