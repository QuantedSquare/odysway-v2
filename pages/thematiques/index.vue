<template>
  <ContentLayout
    :page-content="pageContent"
    :displayed-data="displayedData"
    type="thematiques"
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
const { data: pageContent } = await useAsyncData('page-content', async () => {
  try {
    const result = await sanity.fetch(pageContentQuery)
    return result || {}
  }
  catch {
    return {}
  }
})

const { data: categoriesWithVoyages } = await useAsyncData('categories-with-voyages', async () => {
  try {
    const result = await sanity.fetch(categoriesQuery)
    return result || []
  }
  catch {
    return []
  }
})

const displayedData = computed(() => ({
  items: categoriesWithVoyages.value?.map(category => ({
    id: category._id,
    title: category.title,
    slug: category.slug?.current,
    image: category.image,
    type: 'thematiques',
    discoveryTitle: category.discoveryTitle || category.description || '',
  })).filter(category => category.image?.asset?._ref),
  selectedItem: null,
  pageTitle: pageContent.value?.index?.pageTitle || 'Toutes nos thématiques',
  showOnBottom: false,
}))

useHead({
  htmlAttrs: {
    lang: 'fr',
  },
})
</script>
