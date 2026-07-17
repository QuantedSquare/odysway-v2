<template>
  <v-container
    class="py-0 px-2 px-md-4 pt-4 pt-md-0"
    fluid
  >
    <SimpleHeroSection
      :displayed-img="page.heroSection.image"
      :title-color="page.heroSection.titleColor"
    >
      <template #title>
        {{ page.heroSection.title }}
      </template>
    </SimpleHeroSection>
    <AvisContainer>
      <template #first-phrase>
        {{ page.firstPhrase }}
      </template>
      <template #second-phrase>
        {{ page.secondPhrase }}
      </template>
    </AvisContainer>
  </v-container>
</template>

<script setup>
import { createReviewAggregateSchema } from '~/utils/structuredData'

const pageQuery = `
  *[_type == "avisVoyageurs"][0]{
    heroSection,
    firstPhrase,
    secondPhrase,
    seo
  }
`
const { data: page } = await useSanityQuery(pageQuery)

// Same query string as AvisContainer, so useSanityQuery shares the cached payload
// (no extra request). Used only to emit AggregateRating + Review structured data.
const reviewsQuery = `
  *[_type == "review"]{
    author,
    date,
    rating,
    text,
    voyage->{ title }
  }
`
const { data: reviews } = await useSanityQuery(reviewsQuery)

const reviewSchema = computed(() => createReviewAggregateSchema(
  (reviews.value || []).map(r => ({
    author: r.author,
    date: r.date,
    rating: r.rating,
    text: typeof r.text === 'string' ? r.text : '',
    voyageTitle: r.voyage?.title || '',
  })),
))

if (page.value) {
  useSeo({
    seoData: page.value?.seo,
    content: page.value,
    pageType: 'website',
    slug: 'avis-voyageurs',
    baseUrl: '/avis-voyageurs',
    structuredData: reviewSchema.value,
  })
}
</script>
