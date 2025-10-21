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
    ...,
    "voyages": *[_type == "voyage" && references(^._id)]{
      ...,
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
