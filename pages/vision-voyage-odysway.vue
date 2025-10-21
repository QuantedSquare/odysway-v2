<template>
  <v-container
    class="pt-4 py-md-0 my-0 px-2 px-md-4"
    fluid
  >
    <SimpleHeroSection
      :displayed-img="visionPage.heroSection.image"
      :title-color="'white'"
    >
      <template #title>
        {{ visionPage.heroSection.title }}
      </template>
    </SimpleHeroSection>
    <TextContainer class="focus">
      <template #text>
        <EnrichedText
          class="focus"
          :value="visionPage.priseDeConscience.content"
        />
        <ConceptContainer :image-src="visionPage.founderSection.image">
          <template #founder>
            {{ visionPage.founderSection.caption }}
          </template>
        </ConceptContainer>
        <EnrichedText :value="visionPage.ceQueOnDefend.content" />
        <EnrichedText :value="visionPage.teamSection.content" />
      </template>
    </TextContainer>
  </v-container>
</template>

<script setup>
definePageMeta({
  layout: 'simple-pages',
})

const route = useRoute()

const visionPageQuery = groq`*[_type == "visionVoyageOdysway"][0]{
  ...,
  teamSection{
    content[]{
      ...,
      _type == "image" => {
        ...,
        asset->{
          _id,
          url,
          metadata
        }
      }
    }
  }
}`

const sanity = useSanity()
const { data: visionPage } = await useAsyncData('vision-voyage-odysway', () =>
  sanity.fetch(visionPageQuery),
)

if (visionPage.value) {
  // Set the visionPage title explicitly
  useHead({
    title: visionPage.value.pageSettings.seo?.title || visionPage.value.pageSettings.title,
    htmlAttrs: {
      lang: 'fr',
    },
    ...visionPage.value.pageSettings.head,
  })

  // Set SEO meta tags
  useSeoMeta({
    title: visionPage.value.pageSettings.seo?.title || visionPage.value.pageSettings.title,
    description: visionPage.value.pageSettings.seo?.description || visionPage.value.pageSettings.description,
    ogTitle: visionPage.value.pageSettings.seo?.title || visionPage.value.pageSettings.title,
    ogDescription: visionPage.value.pageSettings.seo?.description || visionPage.value.pageSettings.description,
    ogType: 'website',
    ogUrl: `https://odysway.com${route.path}`,
    twitterTitle: visionPage.value.pageSettings.seo?.title || visionPage.value.pageSettings.title,
    twitterDescription: visionPage.value.pageSettings.seo?.description || visionPage.value.pageSettings.description,
    twitterCard: 'summary_large_image',
    canonical: `https://odysway.com${route.path}`,
    robots: visionPage.value.pageSettings.robots || 'index, follow',
  })
}
</script>

<style scoped>
.focus :deep(h2){
  color: rgb(var(--v-theme-primary))!important;
  font-size: 28px!important;
}
</style>
