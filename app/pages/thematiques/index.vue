<template>
  <ContentLayout
    :page-content="categoriesWithVoyages.pageContent"
    :displayed-data="displayedData"
    type="thematiques"
  >
    <template #content>
      <DisplayVoyagesRow
        :voyages="categoriesWithVoyages.categories"
      />
    </template>
  </ContentLayout>
</template>

<script setup>
const allQueries = `
  {
    "pageContent": *[_type == "page_thematiques"][0]{
      ...
    },
    "categories": *[_type == "category"]{
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
      availabilityTypes,
      "startingPrice": pricing.startingPrice,
      pricing {
        startingPrice
      }
    }
    }
  }
`
const sanity = useSanity()

const { data: categoriesWithVoyages } = await useAsyncData('categories-with-voyages', async () => {
  try {
    const result = await sanity.fetch(allQueries)
    return result || []
  }
  catch {
    return []
  }
})

const displayedData = computed(() => ({
  items: categoriesWithVoyages.value?.categories?.map(category => ({
    id: category._id,
    title: category.title,
    slug: category.slug?.current,
    image: category.image,
    type: 'thematiques',
    discoveryTitle: category.discoveryTitle || category.description || '',
  })).filter(category => category.image?.asset?._ref),
  selectedItem: null,
  pageTitle: categoriesWithVoyages.value?.pageContent?.index?.pageTitle || 'Toutes nos thématiques',
  showOnBottom: false,
}))

useHead({
  htmlAttrs: {
    lang: 'fr',
  },
})

if (categoriesWithVoyages.value?.pageContent) {
  useSeo({
    seoData: categoriesWithVoyages.value?.pages?.seo,
    content: categoriesWithVoyages.value?.pages,
    pageType: 'website',
    slug: 'thematiques',
  })
}
</script>
