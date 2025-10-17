<template>
  <ContentLayout
    :is-category="true"
    :page-content="pageContent"
  >
    <template #content>
      <DisplayVoyagesRow
        :voyages="categoriesWithVoyages"
        :page-content="pageContent"
      />
    </template>
  </ContentLayout>
</template>

<script setup>

const pageContentQuery = groq`*[_type == "page_thematiques"][0]{
  index,
  slug,
  common
}`
const categoriesQuery = `
  *[_type == "category"]{
    ...,
    "voyages": *[_type == "voyage" && references(^._id)]{
      ...,
    }
  }
`
const { data: pageContent } = await useSanityQuery(pageContentQuery)

const { data: categoriesWithVoyages } = await useSanityQuery(categoriesQuery)

useHead({
  htmlAttrs: {
    lang: 'fr',
  },
})
</script>
