<template>
  <v-container
    fluid
  >
    <HeroVoyageSection />
    <BottomAppBar />

    <!-- <ChipsContainer /> -->

    <StickyContainer>
      <template #left-side>
        <AuthorNote />

        <HighlightsContainer />

        <ProgrammeContainer />

        <AccompanistsContainer />
      </template>
      <template #right-side>
        <InfoCard />
      </template>
    </StickyContainer>

    <HousingSection />

    <DatesPricesContainer />

    <PriceDetailsContainer />

    <ReviewCarousel />

    <FaqVoyagesContainer />

    <WhySection />
  </v-container>
</template>

<script setup>
definePageMeta({
  layout: 'voyage',
})
const route = useRoute()

const [{ data: voyagesTextes }, { data: voyagesData }, { data: dates }] = await Promise.all([

  // NEW VERSION
  useAsyncData('voyages-textes', () => {
    return queryCollection('page_voyage_fr').first()
  }),
  useAsyncData('voyages', () => {
    return queryCollection('voyages').where('slug', '=', route.params.voyageSlug).first()
  }),
  useAsyncData('deal', () => {
    return queryCollection('dates').where('path', 'LIKE', `/dates/${route.params.voyageSlug}%`).all()
  }),
])

if (voyagesData.value) {
  provide('voyage', voyagesData.value)
}
if (voyagesTextes.value) {
  provide('page', voyagesTextes.value)
}
if (dates.value) {
  provide('dates', dates.value)
}

// if (page.value) {
//   defineOgImageComponent(page.value?.ogImage?.component, {
//     title: page.value.ogImage?.props.title,
//     description: page.value.ogImage?.props.description,
//   })
//   useHead(page.value.head || {}) // <-- Nuxt Schema.org
//   useSeoMeta(page.value.seo || {}) // <-- Nuxt Robots
// }
console.log('voyagesData', voyagesData.value)
</script>
