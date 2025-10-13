<template>
  <div>
    <FixedImgHeroSection
      v-if="page?.heroImage && page?.heroImageMobile"
      :img-src="page.heroImage"
      :img-src-mobile="page.heroImageMobile"
    />

    <SectionContainer v-if="page">
      <template #content>
        <EnrichedText
          v-if="page.mainContent"
          :value="page.mainContent"
        />

        <h1 v-if="page.howItWorksTitle" class="text-center my-8">
          {{ page.howItWorksTitle }}
        </h1>

        <IntegrationCapcadeau />

        <v-row v-if="page.pictoCols && page.pictoCols.length > 0">
          <PictoCol
            v-for="(col, index) in page.pictoCols"
            :key="index"
            :img-src="col.image"
          >
            <template #text>
              {{ col.text }}
            </template>
          </PictoCol>
        </v-row>
      </template>
    </SectionContainer>

    <div
      v-else-if="status === 'pending'"
      class="d-flex justify-center align-center"
    >
      <v-progress-circular indeterminate />
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'simple-pages',
})

const sanity = useSanity()

const query = groq`*[_type == "offreCadeau" && slug.current == "offre-cadeau"][0]{
  title,
  heroImage,
  heroImageMobile,
  mainContent,
  howItWorksTitle,
  pictoCols[]{
    image,
    text
  }
}`

const { data: page, status } = await useAsyncData('offre-cadeau', () =>
  sanity.fetch(query)
)
</script>
