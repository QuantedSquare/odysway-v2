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
const categoriesQuery = groq`
  *[_type == "category"]{
    _id,
    title,
    slug,
    description,
    image,
    "voyages": *[_type == "voyage" && references(^._id)]{
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

const { data: categoriesWithVoyages } = await useAsyncData('categories-with-voyages', () =>
  sanity.fetch(categoriesQuery),
)

useHead({
  htmlAttrs: {
    lang: 'fr',
  },
})
</script>
