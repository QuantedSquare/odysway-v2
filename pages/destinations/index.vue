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
const { data: destinationsWithVoyages } = await useSanityQuery(destinationQuery, {}, {
  key: 'destinations-index',
  getCachedData: (key) => {
    return useNuxtApp().payload.data[key] || useNuxtApp().static.data[key]
  },
})

useHead({
  htmlAttrs: {
    lang: 'fr',
  },
})
</script>
