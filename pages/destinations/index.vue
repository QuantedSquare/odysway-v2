<template>
  <ContentLayout
    :is-destination="true"
    :display-divider="true"
  >
  
    <template #content>
      <DisplayVoyagesRow
        :voyages="destinationsWithVoyages"
      />
    </template>
  </ContentLayout>
</template>

<script setup>
const sanity = useSanity()

const destinationsQuery = groq`*[_type == "destination"] | order(title asc) {
  _id,
  title,
  slug,
  image
}`

const voyagesQuery = groq`*[_type == "voyage"] {
  _id,
  title,
  slug,
  image,
  imageSecondary,
  description,
  duration,
  nights,
  level,
  destinations[]-> {
    _id,
    title
  },
  experienceType-> {
    _id,
    title
  },
  categories[]-> {
    _id,
    title
  },
  rating,
  comments,
  pricing,
  groupeAvailable,
  privatisationAvailable,
  customAvailable,
  badgeSection,
  monthlyAvailability,
  idealPeriods,
  miniatureDisplay
}`

const { data: destinations } = await useAsyncData('destinations', () =>
  sanity.fetch(destinationsQuery)
)

const { data: voyages } = await useAsyncData('voyages-on-destinations', () =>
  sanity.fetch(voyagesQuery)
)

const destinationsWithVoyages = computed(() => {
  if (!destinations.value || !voyages.value?.length) return []

  return destinations.value.map(destination => ({
    ...destination,
    id: destination._id,
    voyages: voyages.value.filter(voyage =>
      voyage.destinations?.some(d => d._id === destination._id)
    ),
  }))
})

useHead({
  htmlAttrs: {
    lang: 'fr',
  },
})
</script>
