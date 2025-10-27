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
const pageQuery = `
  *[_type == "avisVoyageurs"][0]{
    heroSection,
    firstPhrase,
    secondPhrase,
    seo
  }
`
const sanity = useSanity()
const { data: page } = await useAsyncData('avis-voyageurs', () =>
  sanity.fetch(pageQuery),
)

if (page.value) {
  useSeo({
    seoData: page.value?.seo,
    content: page.value,
    pageType: 'website',
    slug: 'avis-voyageurs',
    baseUrl: '/avis-voyageurs',
  })
}
</script>
