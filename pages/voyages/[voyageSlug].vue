<template>
  <v-container
    fluid
    class="py-0 my-0 px-3 px-md-4"
  >
    <template v-if="voyage && page">
      <HeroVoyageSection :voyage="voyage" />
      <BottomAppBar
        :date-sections="page.dateSections"
        :starting-price="voyage.pricing.startingPrice"
      />

      <ChipsContainer
        :badge-section="voyage.badgeSection"
        :level="voyage.level"
      />

      <StickyContainer>
        <template #left-side>
          <AuthorNote
            :author-note="voyage.authorNote"
            :page="page"
          />

          <HighlightsContainer
            :experiences-block="voyage.experiencesBlock"
            :page="page.experiencesBlock"
          />

          <ProgrammeContainer
            :programme-block="voyage.programmeBlock"
          />

          <AccompanistsContainer
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
        <HousingSection
          :housing-block="voyage.housingBlock"
          :housing-title="page.housingTitle"
          :housing-type-title="page.housingTypeTitle"
          :housing-mood-title="page.housingMoodTitle"
        />

        <DatesPricesContainer
          :date-sections="page.dateSections"
          :indiv-section="page.indivSection"
          :is-groupe-available="voyage.groupeAvailable"
          :is-privatisation-available="voyage.privatisationAvailable"
          :last-minute-price="voyage.pricing.lastMinuteReduction"
          :early-bird-price="voyage.pricing.earlyBirdReduction || 0"
        />

        <PriceDetailsContainer
          :pricing-details-block="voyage.pricingDetailsBlock"
          :price-details-section="page.priceDetailsSection"
        />
        <ReviewCarousel
          :reviews-section="page.reviewsSection"
        />

        <FaqVoyagesContainer
          :background-image="voyage.image.src"
          :faq-block="voyage.faqBlock"
        />

        <WhySection :why-section="page.whySection" />

        <HorizontalCarousel
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
              :key="voyageProp.id"
              class="pt-0"
            >
              <VoyageCard
                :voyage="voyageProp"
              />
            </v-col>
          </template>
        </HorizontalCarousel>
      </v-container>
    </template>
    <v-skeleton-loader
      v-else
      type="card-avatar, article"
    />
  </v-container>
</template>

<script setup>
definePageMeta({
  layout: 'voyage',
})
const route = useRoute()
const { data: page } = await useAsyncData('voyages-textes', () =>
  queryCollection('page_voyage_fr').first(),
)
const { data: voyage } = await useAsyncData(`voyages-${route.params.voyageSlug}`, () =>
  queryCollection('voyages').where('slug', '=', route.params.voyageSlug).first(),
)

const { data: voyagePropositions } = useAsyncData('voyages-propositions', () => {
  return queryCollection('voyages').where('published', '=', true).where('slug', '<>', route.params.voyageSlug).where('experienceType', '=', voyage.value.experienceType).limit(10).all()
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
    canonical: voyage.value.seoSection?.canonicalUrl || `https://odysway.com/voyages/${voyage.value.slug}`,
  })

  // Structured Data (TouristTrip)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    'name': voyage.value.title,
    'description': voyage.value.metaDescription || voyage.value.description,
    'image': voyage.value.image?.src ? [`https://odysway.com${voyage.value.image.src}`] : [],
    'touristType': 'Adventure',
    'offers': {
      '@type': 'Offer',
      'price': voyage.value.pricing?.startingPrice,
      'priceCurrency': 'EUR',
      'availability': 'https://schema.org/InStock',
    },
    'url': `https://odysway.com/voyages/${voyage.value.slug}`,
    'provider': {
      '@type': 'Organization',
      'name': 'Odysway',
      'url': 'https://odysway.com',
    },
    'itinerary': voyage.value.programmeBlock?.map(day => ({
      '@type': 'TouristAttraction',
      'name': day.title,
      'description': day.description,
      'image': day.photo ? [`https://odysway.com${day.photo}`] : [],
    })),
    ...(voyage.value.rating && voyage.value.comments
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            'ratingValue': voyage.value.rating,
            'reviewCount': voyage.value.comments,
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
        'item': `https://odysway.com/voyages/${voyage.value.slug}`,
      },
    ],
  }

  useHead({
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
