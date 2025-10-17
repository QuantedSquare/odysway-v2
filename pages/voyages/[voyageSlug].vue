<template>
  <div>
    <div v-if="voyage">
      <BottomAppBar
        :date-sections="page.dateSections"
        :starting-price="voyage.pricing.startingPrice"
        :no-group-travel="!voyage.groupeAvailable"
        :slug="voyage.slug.current"
      />
      <v-container
        fluid
        class="py-0 my-0 px-3 px-md-4"
      >
        <HeroVoyageSection :voyage="voyage" />

        <ChipsContainer
          :badge-section="voyage.badgeSection"
          :badge-title="voyage.experienceType.badgeTitle"
          :level="voyage.level"
        />

        <StickyContainer>
          <template #left-side>
            <AuthorNote
              :author-note="voyage.authorNote"
              :page="page"
            />

            <LazyHighlightsContainer
              :experiences-block="voyage.experiencesBlock"
              :page="page.experiencesBlock"
            />

            <LazyProgrammeContainer
              :programme-block="voyage.programmeBlock"
            />

            <LazyAccompanistsContainer
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

        <v-container
          fluid
          class="px-0"
        >
          <LazyHousingSection
            :housing-block="voyage.housingBlock"
            :housing-title="page.housingTitle"
            :housing-type-title="page.housingTypeTitle"
            :housing-mood-title="page.housingMoodTitle"
          />

          <LazyDatesPricesContainer
            :date-sections="page.dateSections"
            :indiv-section="page.indivSection"
            :is-groupe-available="voyage.groupeAvailable"
            :is-privatisation-available="voyage.privatisationAvailable"
            :last-minute-price="voyage.pricing.lastMinuteReduction"
            :early-bird-price="voyage.pricing.earlyBirdReduction || 0"
          />

          <LazyPriceDetailsContainer
            :pricing-details-block="voyage.pricingDetailsBlock"
            :price-details-section="page.priceDetailsSection"
          />
          <LazyReviewCarousel
            :reviews-section="page.reviewsSection"
          />

          <LazyFaqVoyagesContainer
            :background-image="voyage.image.src"
            :faq-block="voyage.faqBlock"
          />

          <LazyWhySection :why-section="page.whySection" />

          <LazyHorizontalCarousel
            v-if="voyagePropositions"
            v-show="voyagePropositions.length > 0"
          >
            <template #title>
              <h4 class="text-primary text-custom-size">
                D'autres idées de voyages
              </h4>
            </template>
            <template #carousel-item>
              <v-col
                v-for="voyageProp in voyagePropositions"
                :key="voyageProp._id"
                class="pt-0"
              >
                <LazyVoyageCard
                  :voyage="voyageProp"
                />
              </v-col>
            </template>
          </LazyHorizontalCarousel>
        </v-container>
      </v-container>
    </div>

    <ColorContainer
      v-else
      color="white"
    >
      <v-row
        justify="center"
        align="center"
      >
        <v-col
          cols="12"
          md="8"
        >
          <p class="text-center text-primary text-h3">
            {{ page.pageNotFound.description }}
          </p>
        </v-col>
        <v-col
          cols="12"
          class="d-flex justify-center"
        >
          <v-btn-secondary
            :to="page.pageNotFound.buttonTo"
            class="mt-8 mx-auto text-decoration-none"
          >
            {{ page.pageNotFound.buttonText }}
          </v-btn-secondary>
        </v-col>
      </v-row>
    </ColorContainer>
  </div>
</template>

<script setup>
import { getImageUrl } from '~/utils/getImageUrl'
import { useSanityQuery } from '@nuxtjs/sanity/dist/runtime/composables/useSanityQuery'

definePageMeta({
  layout: 'voyage',
  middleware: ['old-voyages-link-redirection'],
})
const { gtag } = useGtag()

const route = useRoute()

const voyagePageQuery = `
  *[_type == "page_voyage"][0]{
    ...
  }
`
const { data: page } = await useSanityQuery(voyagePageQuery, {}, {
  key: 'voyage-page',
  getCachedData: (key) => {
    return useNuxtApp().payload.data[key] || useNuxtApp().static.data[key]
  },
})


const voyageQuery = `
  *[_type == "voyage" && slug.current == $slug][0]{
    ...,
    experienceType->{
      badgeTitle,
      _id
    },
    authorNote{
      ...,
      author->{
      ...
      }
    },
  }
`
const { data: voyage } = await useSanityQuery(voyageQuery, {
  slug: route.params.voyageSlug,
}, {
  key: 'voyage-' + route.params.voyageSlug,
  getCachedData: (key) => {
    return useNuxtApp().payload.data[key] || useNuxtApp().static.data[key]
  },
})

const voyagePropositionsQuery = `
  *[_type == "voyage" && slug.current != $slug && experienceType._ref == $experienceTypeId][0...5]{
    _id,
    title,
    slug,
    image,
    rating,
    comments,
    groupeAvailable,
    duration,
    pricing{
      startingPrice
    }
  }
`
const { data: voyagePropositions } = await useSanityQuery(voyagePropositionsQuery, {
  slug: route.params.voyageSlug,
  experienceTypeId: voyage.value?.experienceType?._id,
}, {
  key: 'voyage-propositions-' + route.params.voyageSlug,
  getCachedData: (key) => {
    return useNuxtApp().payload.data[key] || useNuxtApp().static.data[key]
  },
})

onMounted(() => {
  gtag('event', 'page_view', {
    eventCategory: 'Voyage',
    eventAction: 'View',
    eventLabel: voyage.value?.title })
  trackPixel('trackCustom', 'VoyageView', { titre: route.params.voyageSlug })
})

watchEffect(() => {
  if (!voyage.value) return
  // SEO Meta Tags
  useSeoMeta({
    title: voyage.value.seoSection?.metaTitle || voyage.value.title,
    description: voyage.value.seoSection?.ogDescription || voyage.value.metaDescription || voyage.value.description,
    ogTitle: voyage.value.seoSection?.ogTitle || voyage.value.title,
    ogDescription: voyage.value.seoSection?.ogDescription || voyage.value.metaDescription || voyage.value.description,
    ogImage: voyage.value.seoSection?.ogImage?.src || voyage.value.image?.src,
    ogType: 'website',
    twitterTitle: voyage.value.seoSection?.twitterTitle || voyage.value.title,
    twitterDescription: voyage.value.seoSection?.twitterDescription || voyage.value.metaDescription || voyage.value.description,
    twitterImage: voyage.value.seoSection?.twitterImage?.src || voyage.value.image?.src,
    twitterCard: voyage.value.seoSection?.twitterCard || 'summary_large_image',
    canonical: voyage.value.seoSection?.canonicalUrl || `https://odysway.com/voyages/${voyage.value.slug.current}`,
  })

  // Structured Data (TouristTrip)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    'name': voyage.value.title,
    'description': voyage.value.metaDescription || voyage.value.description,
    'image': voyage.value.image ? [getImageUrl(voyage.value.image.asset._ref, `${voyage.value.slug.current}.jpg`)] : '',
    'touristType': 'Adventure',
    'mainEntity': {
      '@type': 'TouristTrip',
      'name': voyage.value.title,
      'description': voyage.value.metaDescription || voyage.value.description,
      'url': `https://odysway.com/voyages/${voyage.value.slug.current}`,
    },
    'offers': {
      '@type': 'Offer',
      'price': voyage.value.pricing?.startingPrice,
      'priceCurrency': 'EUR',
      'availability': 'https://schema.org/InStock',
    },
    'url': `https://odysway.com/voyages/${voyage.value.slug.current}`,
    'provider': {
      '@type': 'Organization',
      'name': 'Odysway',
      'url': 'https://odysway.com',
    },
    'itinerary': voyage.value.programmeBlock?.map((day, index) => ({
      '@type': 'TouristAttraction',
      'name': day.title,
      'description': day.description,
      'image': day.photo ? [getImageUrl(day.photo.asset._ref, `${voyage.value.slug.current}-day-${index + 1}.jpg`)] : '',
    })),
    ...(voyage.value.rating && voyage.value.comments
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            'ratingValue': voyage.value.rating,
            'reviewCount': voyage.value.comments,
            'itemReviewed': {
              '@type': 'TouristTrip',
              'name': voyage.value.title,
              'url': `https://odysway.com/voyages/${voyage.value.slug.current}`,
            },
          },
        }
      : {}),
  }
  // BreadcrumbList structured data
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Voyages',
        'item': 'https://odysway.com/voyages',
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': voyage.value.title,
        'item': `https://odysway.com/voyages/${voyage.value.slug.current}`,
      },
    ],
  }

  useHead({
    htmlAttrs: {
      lang: 'fr',
    },
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(structuredData),
      },
      {
        type: 'application/ld+json',
        children: JSON.stringify(breadcrumbs),
      },
    ],
  })
})
</script>

<style scoped>
@media (min-width: 1000px) {
.text-custom-size{
    font-size: 2.5rem!important;
  }
}
</style>
