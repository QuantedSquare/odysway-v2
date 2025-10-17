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
const { data: pageContent } = await useSanityQuery(pageContentQuery)

const { data: experiencesWithVoyages } = await useSanityQuery(experiencesQuery)

useHead({
  htmlAttrs: {
    lang: 'fr',
  },
})
</script>
