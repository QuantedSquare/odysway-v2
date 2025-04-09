<template>
  <div>
    <h1>Search</h1>
  </div>
</template>

<script setup>
// const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation('voyages'))
const route = useRoute()

const { data: deal, status } = useAsyncData('search', async () => {
  const query = await queryCollection('deals').where('iso', '=', 'FR').all()
  console.log('deal', query)
  return query
})
</script>
