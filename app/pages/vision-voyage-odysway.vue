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

const visionPageQuery = groq`*[_type == "visionVoyageOdysway"][0]{
  ...,
  teamSection{
    content[]{
      ...,
      _type == "image" => {
        ...,
        asset->{
          _id,
          _ref,
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
  const defaultContent = {
    title: 'Vision Voyage Odysway',
    description: 'Vision Voyage Odysway',
    image: visionPage.value.heroSection.image,
  }

  useSeo({
    seoData: visionPage.value?.seo,
    content: defaultContent,
    pageType: 'website',
    slug: 'vision-voyage-odysway',
    baseUrl: '/vision-voyage-odysway',
    structuredData: [
      createOrganizationSchema({
        description: visionPage.value?.seo?.metaDescription || defaultContent.description,
      }),
      createWebSiteSchema(),
    ],
  })
}
</script>

<style scoped>
.focus :deep(h2){
  color: rgb(var(--v-theme-primary))!important;
  font-size: 28px!important;
}
</style>
