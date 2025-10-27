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

useHead({
  htmlAttrs: {
    lang: 'fr',
  },
})
</script>
