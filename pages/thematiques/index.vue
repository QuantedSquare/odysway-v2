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
const sanity = useSanity()

const pageContentQuery = groq`*[_type == "page_thematiques"][0]{
  index,
  slug,
  common
}`

const categoriesQuery = groq`*[_type == "category"] | order(title asc) {
  _id,
  title,
  slug,
  discoveryTitle,
  image
}`

const voyagesQuery = groq`*[_type == "voyage"] {
  _id,
  title,
  slug,
  image,
  imageSecondary,
  description,
  duration,
  nights,
  level,
  destinations[]-> {
    _id,
    title
  },
  experienceType-> {
    _id,
    title
  },
  categories[]-> {
    _id,
    title
  },
  rating,
  comments,
  pricing,
  groupeAvailable,
  privatisationAvailable,
  customAvailable,
  badgeSection,
  monthlyAvailability,
  idealPeriods,
  miniatureDisplay
}`

const { data: pageContent } = await useAsyncData('page-thematiques', () =>
  sanity.fetch(pageContentQuery)
)

const { data: categories } = await useAsyncData('categories', () =>
  sanity.fetch(categoriesQuery)
)

const { data: voyages } = await useAsyncData('voyages-on-thematiques', () =>
  sanity.fetch(voyagesQuery)
)

const categoriesWithVoyages = computed(() => {
  if (!categories.value || !voyages.value?.length) return []

  return categories.value.map(category => ({
    ...category,
    id: category._id,
    voyages: voyages.value.filter(voyage =>
      voyage.categories?.some(c => c._id === category._id)
    ),
  }))
})

useHead({
  htmlAttrs: {
    lang: 'fr',
  },
})
</script>
