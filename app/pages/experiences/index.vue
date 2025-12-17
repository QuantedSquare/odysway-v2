<template>
  <ContentLayout
    type="experiences"
    :displayed-data="displayedData"
    :page-content="experiencesWithVoyages.pageContent"
  >
    <template #content>
      <DisplayVoyagesRow
        :voyages="experiencesWithVoyages.experiences"
      />
    </template>
  </ContentLayout>
</template>

<script setup>
const allQueries = `
  {
    "pageContent": *[_type == "page_experiences"][0]{
      ...
    },
    "experiences": *[_type == "experience"]{
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
    },
    }
  }
`
const sanity = useSanity()

const { data: experiencesWithVoyages } = await useAsyncData('experiences-with-voyages', () =>
  sanity.fetch(allQueries),
)
const displayedData = computed(() => ({
  items: experiencesWithVoyages.value?.experiences?.map(experience => ({
    id: experience._id,
    title: experience.title,
    slug: experience.slug?.current,
    image: experience.image,
    type: 'experiences',
    discoveryTitle: experience.discoveryTitle || experience.description || '',
  })).filter(experience => experience.image?.asset?._ref),
  selectedItem: null,
  pageTitle: experiencesWithVoyages.value?.pageContent?.index?.pageTitle || 'Toutes nos expériences',
  showOnBottom: false,
}))

useHead({
  htmlAttrs: {
    lang: 'fr',
  },
})

if (experiencesWithVoyages.value?.pageContent) {
  useSeo({
    seoData: experiencesWithVoyages.value?.pageContent?.seo,
    content: experiencesWithVoyages.value?.pageContent,
    pageType: 'website',
    slug: 'experiences',
  })
}
</script>
