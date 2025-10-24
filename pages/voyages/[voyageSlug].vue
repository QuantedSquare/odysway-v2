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
          :badges="voyage.badges"
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
definePageMeta({
  layout: 'voyage',
  middleware: ['old-voyages-link-redirection'],
})
const { gtag } = useGtag()

const route = useRoute()
const sanity = useSanity()

const voyagePageQuery = `
  *[_type == "page_voyage"][0]{
    ...
  }
`
const voyageQuery = `
  *[_type == "voyage" && slug.current == $slug][0]{
    ...,
    seo{
      metaTitle,
      metaDescription,
      canonicalUrl,
      focusKeyword,
      keywords,
      robotsIndex,
      robotsFollow,
      ogTitle,
      ogDescription,
      ogImage{
        asset->{
          _ref,
          _id,
          url
        },
        alt
      }
    },
    badges[]{
      badge->{
        _id,
        title,
        text,
        picto
      },
      variable1Value,
      variable2Value,
      overrideText
    },
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
const { data: page } = await useAsyncData('voyage-page', () =>
  sanity.fetch(voyagePageQuery),
)

const { data: voyage } = await useAsyncData('voyage', () =>
  sanity.fetch(voyageQuery, { slug: route.params.voyageSlug }),
)

const { data: voyagePropositions } = await useAsyncData('voyage-propositions', () =>
  sanity.fetch(voyagePropositionsQuery, {
    slug: route.params.voyageSlug,
    experienceTypeId: voyage.value?.experienceType?._id,
  }),
)

onMounted(() => {
  gtag('event', 'page_view', {
    eventCategory: 'Voyage',
    eventAction: 'View',
    eventLabel: voyage.value?.title })
  trackPixel('trackCustom', 'VoyageView', { titre: route.params.voyageSlug })
})

watchEffect(() => {
  if (!voyage.value) return

  // Use the SEO composable with TouristTrip structured data
  useSeo({
    seoData: voyage.value.seo,
    content: voyage.value,
    pageType: 'website',
    slug: voyage.value.slug?.current,
    structuredData: createTouristTripSchema(
      voyage.value,
      `https://odysway.com/voyages/${voyage.value.slug.current}`,
    ),
    breadcrumbs: [
      { name: 'Accueil', url: 'https://odysway.com' },
      { name: 'Voyages', url: 'https://odysway.com/voyages' },
      {
        name: voyage.value.title,
        url: `https://odysway.com/voyages/${voyage.value.slug.current}`,
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
