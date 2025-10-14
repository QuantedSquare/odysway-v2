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
const { data: pageContent } = await useSanityQuery(pageContentQuery, {}, {
  key: 'page-thematiques',
  getCachedData: (key) => {
    return useNuxtApp().payload.data[key] || useNuxtApp().static.data[key]
  },
})

const { data: categoriesWithVoyages } = await useSanityQuery(categoriesQuery, {}, {
  key: 'categories-with-voyages',
  getCachedData: (key) => {
    return useNuxtApp().payload.data[key] || useNuxtApp().static.data[key]
  },
})
console.log('categoriesWithVoyages', categoriesWithVoyages.value)
useHead({
  htmlAttrs: {
    lang: 'fr',
  },
})
</script>
