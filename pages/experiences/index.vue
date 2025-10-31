<template>
  <ContentLayout
    :page-content="pageContent"
    :displayed-data="displayedData"
    type="experiences"
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

const displayedData = computed(() => ({
  items: experiencesWithVoyages.value?.map(experience => ({
    id: experience._id,
    title: experience.title,
    slug: experience.slug?.current,
    image: experience.image,
    type: 'experiences',
    discoveryTitle: experience.discoveryTitle || experience.description || '',
  })).filter(experience => experience.image?.asset?._ref),
  selectedItem: null,
  pageTitle: pageContent.value?.index?.pageTitle || 'Toutes nos expériences',
  showOnBottom: false,
}))

useHead({
  htmlAttrs: {
    lang: 'fr',
  },
})
</script>
