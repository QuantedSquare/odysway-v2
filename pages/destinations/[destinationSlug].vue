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
import _ from 'lodash'

const route = useRoute()
const slug = computed(() => route.params.destinationSlug)

const { data: destinations } = useAsyncData('destinations', () => {
  return queryCollection('destinations').where('published', '=', true).all()
})
const { data: regions } = useAsyncData('regions', () => {
  return queryCollection('regions').all()
})

const selectedDestination = computed(() => {
  return destinations.value?.find(d => d.slug === slug.value)
})

const selectedRegion = computed(() => {
  return regions.value?.find(r => r.slug === slug.value)
})

const isRegion = computed(() => !!selectedRegion.value)
const isDestination = computed(() => !!selectedDestination.value)

const destinationsInRegion = computed(() => {
  if (!isRegion.value) return []
  return destinations.value?.filter(dest =>
    dest.regions && dest.regions.some(r => r.nom === selectedRegion.value?.nom),
  ) || []
})

const { data: destinationContent, status: destinationContentStatus } = useAsyncData('destinationContent', () => {
  return queryCollection('destinationsContent').where('stem', 'LIKE', `destinations/${slug.value}/%`).where('published', '=', true).first()
}, {
  watch: [slug],
})
provide('page', destinationContent)

const { data: voyages } = useAsyncData('voyages', async () => {
  const travelList = await queryCollection('voyages').where('published', '=', true).all()
  let filtered = []
  if (isDestination.value) {
    const destinationName = selectedDestination.value?.titre
    filtered = travelList.filter(v => v.destinations?.some(d => d.name.includes(destinationName)))
  }
  else if (isRegion.value) {
    const destinationNames = destinationsInRegion.value?.map(d => d.titre) || []
    filtered = travelList.filter(v =>
      v.destinations?.some(d => destinationNames.includes(d.name)),
    )
  }
  return _.uniqBy(filtered, 'slug')
}, {
  watch: [slug, isDestination, isRegion, destinationsInRegion, selectedDestination, selectedRegion],
})
</script>
