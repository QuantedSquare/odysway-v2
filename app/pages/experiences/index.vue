<template>
  <ContentLayout
    :is-experience="true"
    :page-content="pageContent"
  >
    <template #content>
      <DisplayVoyagesRow
        :voyages="experiencesWithVoyages"
        :page-content="pageContent"
      />
    </template>
  </ContentLayout>
</template>

<script setup>
const pageContentQuery = groq`*[_type == "page_experiences"][0]{
  index,
  slug,
  common
}`
const experiencesQuery = `
  *[_type == "experience"]{
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
const { data: pageContent } = await useAsyncData('page-content', () =>
  sanity.fetch(pageContentQuery),
)

const { data: experiencesWithVoyages } = await useAsyncData('experiences-with-voyages', () =>
  sanity.fetch(experiencesQuery),
)

useHead({
  htmlAttrs: {
    lang: 'fr',
  },
})
</script>
