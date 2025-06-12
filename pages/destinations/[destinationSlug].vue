<template>
  <ContentLayout
    :is-destination="true"
    :selected-destination="selectedDestination"
  >
    <template #slugContent>
      <DisplayVoyagesRow
        :is-search="true"
        :voyages="voyages"
      />
    </template>
    <template
      v-if="destinationContentStatus === 'success' && destinationContent"
      #blogPost
    >
      <ContentRenderer
        v-if="destinationContent"
        :value="destinationContent"
      />
    </template>
  </ContentLayout>
</template>

<script setup>
const route = useRoute()
const slug = computed(() => route.params.destinationSlug)

const { data: destinations } = await useAsyncData('destinations', () => {
  return queryCollection('destinations').where('published', '=', true).all()
})

const selectedDestination = computed(() => {
  return destinations.value.find(d => d.slug === slug.value)
})

const { data: destinationContent, status: destinationContentStatus } = useAsyncData('destinationContent', () => {
  return queryCollection('destinationsContent').where('stem', 'LIKE', `destinations/${slug.value}/%`).where('published', '=', true).first()
}, {
  watch: [slug],
})
provide('page', destinationContent)

const { data: voyages } = useAsyncData('voyages', async () => {
  const travelList = await queryCollection('voyages').where('published', '=', true).all()
  console.log('voyages', travelList)
  const destinationName = selectedDestination.value.titre
  return travelList.filter(v => v.destinations?.some(d => d.name.includes(destinationName)))
})
</script>
