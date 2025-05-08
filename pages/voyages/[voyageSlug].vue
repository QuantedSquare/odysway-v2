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
        <!-- <InfoCard /> -->
      </template>
    </StickyContainer>

    <HousingSection />

    <!-- <DatesPricesContainer /> -->

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
const { data: dates } = await useAsyncData('dates', async () => {
  const res = await fetch(`/api/v1/booking/${route.params.voyageSlug}/dates`)
  return await res.json()
})
const [{ data: voyagesTextes }, { data: voyagesData }] = await Promise.all([
  useAsyncData('voyages-textes', () => queryCollection('page_voyage_fr').first()),
  useAsyncData('voyages', () => queryCollection('voyages').where('slug', '=', route.params.voyageSlug).first()),
])

console.log('DATES', dates.value)
if (voyagesData.value) {
  // console.log('voyagesv2Data', voyagesData.value)
  provide('voyage', voyagesData.value)
}
if (voyagesTextes.value) {
  // console.log('voyages-textes', voyagesTextes.value)
  provide('page', voyagesTextes.value)
}
if (dates.value) {
  console.log('dates', dates.value)
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
// console.log('voyagesData', voyagesData.value)
</script>
