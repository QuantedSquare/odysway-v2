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

const query = groq`*[_type == "chequesVacances" && slug.current == "cheques-vacances"][0]{
  title,
  heroImage,
  content,
  ctaButton,
  seo
}`

const { data: page, status } = await useAsyncData('cheques-vacances', () =>
  sanity.fetch(query),
)

function getButtonLink(link) {
  if (!link) return '/'
  // If it's a full URL to odysway.com, extract just the path
  if (link.startsWith('https://odysway.com')) {
    return link.replace('https://odysway.com', '')
  }
  return link
}

if (page.value) {
  useSeo({
    seoData: page.value?.seo,
    content: page.value,
    pageType: 'website',
    slug: 'cheques-vacances',
    baseUrl: '/cheques-vacances',
  })
}
</script>
