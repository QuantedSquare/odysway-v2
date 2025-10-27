<template>
  <div>
    <HeroSection
      v-if="page?.heroImage"
      :image-src="page.heroImage"
    >
      <template #title>
        {{ page.title }}
      </template>
    </HeroSection>

    <SectionContainer v-if="page">
      <template #content>
        <EnrichedText
          v-if="page.content"
          :value="page.content"
        />

        <CtaButton
          v-if="page.ctaButton"
          :link="getButtonLink(page.ctaButton.link)"
          :external="page.ctaButton.external"
          class="mt-8"
        >
          <template #text>
            {{ page.ctaButton.text }}
          </template>
        </CtaButton>
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

const surMesureQuery = groq`*[_type == "surMesure" && slug.current == "sur-mesure"][0]{
  title,
  heroImage,
  content,
  ctaButton
}`

const { data: page, status } = await useAsyncData('sur-mesure', () =>
  sanity.fetch(surMesureQuery),
)

if (page.value) {
  const defaultContent = {
    title: 'Un voyage sur mesure, au rythme de vos envies',
    description: 'Un voyage sur mesure, au rythme de vos envies',
    image: page.value.heroImage,
  }
  useSeo({
    seoData: page.value?.seo,
    content: defaultContent,
    pageType: 'website',
    slug: 'sur-mesure',
    baseUrl: '/sur-mesure',
    structuredData: [
      createOrganizationSchema({
        description: page.value?.seo?.metaDescription || defaultContent.description,
      }),
      createWebSiteSchema(),
    ],
  })
}
function getButtonLink(link) {
  if (!link) return '/'
  // If it's a full URL to odysway.com, extract just the path
  if (link.startsWith('https://odysway.com')) {
    return link.replace('https://odysway.com', '')
  }
  return link
}
</script>
