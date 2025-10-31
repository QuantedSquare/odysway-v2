<template>
  <ContentLayout
    type="destinations"
    :display-divider="true"
    :displayed-data="displayedData"
  >
    <template #content>
      <DisplayVoyagesRow
        :voyages="destinationsWithVoyages"
      />
    </template>
  </ContentLayout>
</template>

<script setup>
const destinationQuery = `
  *[_type == "destination"]{
     _id,
    title,
    slug,
    description,
    image,
    "voyages": *[_type == "voyage" && references(^._id) && !('custom' in availabilityTypes)]{
        _id,
      title,
      slug,
      image,
      duration,
      nights,
      rating,
      comments,
      pricing
    }
  }
`
const sanity = useSanity()
const { data: destinationsWithVoyages } = await useAsyncData('destinations', () =>
  sanity.fetch(destinationQuery),
)

const displayedData = computed(() => ({
  items: destinationsWithVoyages.value?.map(destination => ({
    id: destination._id,
    title: destination.title,
    slug: destination.slug?.current,
    image: destination.image,
    type: 'destinations',
    discoveryTitle: destination.metaDescription || destination.description || '',
  })).filter(destination => destination.image?.asset?._ref),
  selectedItem: null,
  pageTitle: 'Toutes nos destinations',
  showOnBottom: false,
}))

useHead({
  htmlAttrs: {
    lang: 'fr',
  },
})
</script>
