<template>
  <v-container
    fluid
  >
    <template v-if="voyage && page">
      <HeroVoyageSection :voyage="voyage" />
      <BottomAppBar
        :date-sections="page.dateSections"
        :pricing="voyage.pricing"
      />

      <!-- <ChipsContainer /> -->

      <StickyContainer>
        <template #left-side>
          <AuthorNote
            :author-note="voyage.authorNote"
            :page="page"
          />

          <HighlightsContainer
            :experiences-block="voyage.experiencesBlock"
            :page="page.experiencesBlock"
          />

          <ProgrammeContainer
            :programme-block="voyage.programmeBlock"
          />

          <AccompanistsContainer
            :voyage="voyage"
            :title="page.accompanistsTitle"
          />
        </template>
        <template #right-side>
          <InfoCard
            :sticky-block="page.stickyBlock"
            :voyage="voyage"
          />
        </template>
      </StickyContainer>

      <HousingSection
        :housing-block="voyage.housingBlock"
        :housing-title="page.housingTitle"
        :housing-type-title="page.housingTypeTitle"
        :housing-mood-title="page.housingMoodTitle"
      />

      <DatesPricesContainer
        :date-sections="page.dateSections"
      />

      <PriceDetailsContainer
        :pricing-details-block="voyage.pricingDetailsBlock"
      />

      <ReviewCarousel
        :reviews-section="page.reviewsSection"
      />

      <FaqVoyagesContainer
        :faq-block="voyage.faqBlock"
      />

      <WhySection :why-section="page.whySection" />
    </template>
    <v-skeleton-loader
      v-else
      type="card-avatar, article"
    />
  </v-container>
</template>

<script setup>
definePageMeta({
  layout: 'voyage',
})
const route = useRoute()
const [{ data: page }, { data: voyage }] = await Promise.all([
  useAsyncData('voyages-textes', () => queryCollection('page_voyage_fr').first()),
  useAsyncData('voyages', () => queryCollection('voyages').where('slug', '=', route.params.voyageSlug).first()),
])

// if (page.value) {
//   defineOgImageComponent(page.value?.ogImage?.component, {
//     title: page.value.ogImage?.props.title,
//     description: page.value.ogImage?.props.description,
//   })
//   useHead(page.value.head || {}) // <-- Nuxt Schema.org
//   useSeoMeta(page.value.seo || {}) // <-- Nuxt Robots
// }
// console.log('voyagesData', voyagesData.value)
</script>
