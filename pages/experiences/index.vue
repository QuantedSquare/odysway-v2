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
    ...,
    "voyages": *[_type == "voyage" && references(^._id)]{
      ...,
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
