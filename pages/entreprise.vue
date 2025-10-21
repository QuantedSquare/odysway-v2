<template>
  <v-container
    class="pt-4 py-md-0 my-0 px-2 px-md-4"
    fluid
  >
    <HeroSection
      :image-src="page.heroSection.image"
    >
      <template #title>
        {{ page.heroSection.title }}
      </template>
    </HeroSection>

    <SectionContainer>
      <template #content>
        <!-- Content Block 1 -->
        <EnrichedText
          v-if="page.contentBlock1"
          :value="page.contentBlock1"
          class="mb-8"
        />
        <CtaButton
          v-if="page.ctaButton"
          :link="page.ctaButton.link"
          :external="page.ctaButton.external"
          class="my-8"
        >
          <template #text>
            {{ page.ctaButton.text }}
          </template>
        </CtaButton>

        <!-- Content Block 2 -->
        <EnrichedText
          v-if="page.contentBlock2"
          :value="page.contentBlock2"
          class="mb-8"
        />
        <CtaButton
          v-if="page.ctaButton"
          :link="page.ctaButton.link"
          :external="page.ctaButton.external"
          class="my-8"
        >
          <template #text>
            {{ page.ctaButton.text }}
          </template>
        </CtaButton>

        <!-- Content Block 3 -->
        <EnrichedText
          v-if="page.contentBlock3"
          :value="page.contentBlock3"
          class="mb-8"
        />
        <CtaButton
          v-if="page.ctaButton"
          :link="page.ctaButton.link"
          :external="page.ctaButton.external"
          class="my-8"
        >
          <template #text>
            {{ page.ctaButton.text }}
          </template>
        </CtaButton>

        <!-- Content Block 4 -->
        <EnrichedText
          v-if="page.contentBlock4"
          :value="page.contentBlock4"
          class="mb-8"
        />

        <!-- Content Block 5 -->
        <EnrichedText
          v-if="page.contentBlock5"
          :value="page.contentBlock5"
          class="mb-8"
        />
        <CtaButton
          v-if="page.ctaButton"
          :link="page.ctaButton.link"
          :external="page.ctaButton.external"
          class="my-8"
        >
          <template #text>
            {{ page.ctaButton.text }}
          </template>
        </CtaButton>
      </template>
    </SectionContainer>
  </v-container>
</template>

<script setup>
definePageMeta({
  layout: 'simple-pages',
})

const route = useRoute()
// #TODO Page settings à définir
const entreprisePageQuery = groq`*[_type == "entreprise"][0]{
  ...,
  pageSettings,
  heroSection{
    image,
    title
  },
  contentBlock1[]{
    ...,
    _type == "image" => {
      ...,
      asset->{
        _id,
        url,
        metadata
      }
    }
  },
  contentBlock2[]{
    ...,
    _type == "image" => {
      ...,
      asset->{
        _id,
        url,
        metadata
      }
    }
  },
  contentBlock3[]{
    ...,
    _type == "image" => {
      ...,
      asset->{
        _id,
        url,
        metadata
      }
    }
  },
  contentBlock4[]{
    ...,
    _type == "image" => {
      ...,
      asset->{
        _id,
        url,
        metadata
      }
    }
  },
  contentBlock5[]{
    ...,
    _type == "image" => {
      ...,
      asset->{
        _id,
        url,
        metadata
      }
    }
  },
  ctaButton
}`

const sanity = useSanity()
const { data: page } = await useAsyncData('entreprise', () =>
  sanity.fetch(entreprisePageQuery),
)

if (page.value) {
  const seoTitle = page.value.pageSettings?.seo?.title || page.value.pageSettings?.title || page.value.heroSection.title || 'Tribus par Odysway'
  const seoDescription = page.value.pageSettings?.seo?.description || page.value.pageSettings?.description || 'Des expériences uniques pour votre entreprise : découvrez nos séminaires et voyages Tribus'
  const robots = page.value.pageSettings?.seo?.robots || 'index, follow'

  // Set the page title explicitly
  useHead({
    title: seoTitle,
    htmlAttrs: {
      lang: 'fr',
    },
  })

  // Set SEO meta tags
  useSeoMeta({
    title: seoTitle,
    description: seoDescription,
    ogTitle: seoTitle,
    ogDescription: seoDescription,
    ogType: 'website',
    ogUrl: `https://odysway.com${route.path}`,
    twitterTitle: seoTitle,
    twitterDescription: seoDescription,
    twitterCard: 'summary_large_image',
    canonical: `https://odysway.com${route.path}`,
    robots,
  })
}
</script>
