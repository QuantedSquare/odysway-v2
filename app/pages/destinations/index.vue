<template>
  <ContentLayout
    type="destinations"
    :display-divider="true"
    :displayed-data="displayedData"
    :page-content="destinationsWithVoyages.pageContent"
  >
    <template #content>
      <DisplayVoyagesRow
        :voyages="destinationsWithVoyages.destinations"
      />
    </template>
  </ContentLayout>
</template>

<script setup>
const allQueries = `
{
  "destinations": *[_type == "destination"]{
    _id,
    title,
    slug,
    "description": metaDescription,
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
  },
  "pageContent": *[_type == "page_destinations"][0]{
    ...
  }
}
`
const sanity = useSanity()
const { data: destinationsWithVoyages } = await useAsyncData('destinations', () =>
  sanity.fetch(allQueries),
)

const displayedData = computed(() => ({
  items: destinationsWithVoyages.value?.destinations?.map(destination => ({
    id: destination._id,
    title: destination.title,
    slug: destination.slug?.current,
    image: destination.image,
    type: 'destinations',
    discoveryTitle: destination.metaDescription || destination.description || '',
  })).filter(destination => destination.image?.asset?._ref),
  selectedItem: null,
  pageTitle: destinationsWithVoyages.value?.pageContent?.index?.pageTitle || 'Toutes nos destinations',
  showOnBottom: false,
}))

useHead({
  htmlAttrs: {
    lang: 'fr',
  },
})

if (destinationsWithVoyages.value?.pageContent) {
  useSeo({
    seoData: destinationsWithVoyages.value?.pageContent?.seo,
    slug: 'destinations',
    content: destinationsWithVoyages.value?.pageContent,
    pageType: 'website',
  })
}
</script>
