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
const { data: destinationsWithVoyages } = await useSanityQuery(destinationQuery)

useHead({
  htmlAttrs: {
    lang: 'fr',
  },
})
</script>
