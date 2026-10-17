<template>
  <div>
    <div v-if="isPublished">
      <LazyBottomAppBar
        :hydrate-on-idle="true"
        :date-sections="page.dateSections"
        :starting-price="voyage.pricing.startingPrice"
        :no-group-travel="!voyage.availabilityTypes?.includes('groupe')"
        :slug="voyage.slug.current"
      />

      <v-container
        fluid
        class="py-0 my-0 px-3 px-md-4"
      >
        <HeroVoyageSection :voyage="voyage" />
        <LazyChipsContainer
          :hydrate-on-idle="true"
          :badges="voyage.badges"
          :badge-title="voyage.experienceType?.badgeTitle"
          :difficulty-level="voyage.difficultyLevel"
          :level-badge-order="voyage.levelBadgeOrder"
        />
        <!-- <LazySubHeaderMobileCTABar
          :hydrate-on-idle="true"
          :date-sections="page.dateSections"
          :starting-price="voyage.pricing.startingPrice"
          :no-group-travel="!voyage.availabilityTypes?.includes('groupe')"
          :slug="voyage.slug.current"
        /> -->
        <v-divider class="d-block d-md-none" />
        <StickyContainer>
          <template #left-side>
            <LazyAuthorNote
              :author-note="voyage.authorNote"
              :page="page"
            />

            <LazyHighlightsContainer
              :experiences-block="voyage.experiencesBlock"
              :page="page.experiencesBlock"
            />

            <LazyProgrammeContainer :programme-block="voyage.programmeBlock" />

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
            :closing-days="voyage.closingDays"
            :sticky-block="page.stickyBlock"
            :date-sections="page.dateSections"
            :is-groupe-available="voyage.availabilityTypes?.includes('groupe')"
            :is-privatisation-available="voyage.availabilityTypes?.includes('privatisation')"
            :last-minute-price="voyage.pricing.lastMinuteReduction"
            :early-bird-price="voyage.pricing.earlyBirdReduction || 0"
            :voyage="voyage"
            :indiv-section="page.indivSection"
          />

          <LazyPriceDetailsContainer
            :pricing-details-block="voyage.pricingDetailsBlock"
            :price-details-section="page.priceDetailsSection"
          />
          <LazyReviewCarousel :reviews-section="page.reviewsSection" />

          <LazyFaqVoyagesContainer
            :background-image="voyage.image"
            :faq-block="voyage.faqBlock"
            :static-faq="page.faqSection.faqBlock"
          />

          <!-- <LazyWhySection :why-section="page.whySection" /> -->

          <TrackableVoyageList
            v-if="voyagePropositions && voyagePropositions.length > 0"
            :voyages="voyagePropositions"
            list-name="D'autres idées de voyages"
          >
            <LazyHorizontalCarousel slider-name="voyage-autres-idees">
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
                    item-list-name="D'autres idées de voyages"
                  />
                </v-col>
              </template>
            </LazyHorizontalCarousel>
          </TrackableVoyageList>
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
import imageUrlBuilder from '@sanity/image-url'

definePageMeta({
  layout: 'voyage',
})

const route = useRoute()
const config = useRuntimeConfig()
const { trackViewItem } = useGtmTracking()
const { formatVoyageForGtm } = useGtmVoyageFormatter()

const voyageSlugRef = computed(() => route.params.voyageSlug)
const [{ data: page }, { data: voyage }] = await Promise.all([
  useSanityQuery(VOYAGE_PAGE_QUERY),
  useSanityQuery(VOYAGE_QUERY, { slug: voyageSlugRef }),
])

// Only "sur-mesure only" voyages whose page was explicitly published in Sanity
// are served here. Groupe/privatisation voyages keep their public /voyages page.
const isPublished = computed(() => {
  const types = voyage.value?.availabilityTypes
  const isCustomOnly = Array.isArray(types) && types.length === 1 && types[0] === 'custom'
  return isCustomOnly && voyage.value?.customPagePublished === true
})

if (!isPublished.value && import.meta.server) {
  setResponseStatus(useRequestEvent(), 404)
}

const experienceTypeIdRef = computed(() => voyage.value?.experienceType?._id)
const { data: voyagePropositions } = await useSanityQuery(
  VOYAGE_PROPOSITIONS_QUERY,
  { slug: voyageSlugRef, experienceTypeId: experienceTypeIdRef },
  { lazy: true },
)
onMounted(() => {
  // GTM: Track view_item event
  if (isPublished.value) {
    const formattedVoyage = formatVoyageForGtm(voyage.value)
    trackViewItem(formattedVoyage, voyage.value.pricing?.startingPrice)
  }
})

const builder = imageUrlBuilder({
  projectId: config.public.sanity.projectId,
  dataset: config.public.sanity.dataset,
})

const buildMainImageUrl = (image, width, height, quality = 90) => {
  if (!image) return ''
  return builder
    .image(image)
    .width(width)
    .height(height)
    .auto('format')
    .quality(quality)
    .fit('crop')
    .url()
}

// Unlisted page: never indexed, whatever the voyage's SEO settings say.
// No structured data / breadcrumbs either — nothing should advertise it.
if (isPublished.value) {
  useSeo({
    seoData: { ...voyage.value.seo, canonicalUrl: null, robotsIndex: false, robotsFollow: false },
    content: voyage.value,
    pageType: 'website',
    slug: voyage.value.slug?.current,
    baseUrl: `/sur-mesure/${voyage.value.slug.current}`,
  })
}
if (import.meta.server) {
  useResponseHeader('X-Robots-Tag').value = 'noindex, nofollow'
}

// Image preload — reactive to handle lazy data
watchEffect(() => {
  if (!isPublished.value) return

  const image = voyage.value.image
  const link = []

  if (image) {
    // Must mirror the rendered <NuxtImg> srcset/sizes exactly, otherwise
    // the browser downloads a different URL than the preload (waste).
    const srcset = [
      `${buildMainImageUrl(image, 400, 225, 80)} 400w`,
      `${buildMainImageUrl(image, 600, 338, 80)} 600w`,
      `${buildMainImageUrl(image, 800, 450, 80)} 800w`,
      `${buildMainImageUrl(image, 1000, 563, 80)} 1000w`,
      `${buildMainImageUrl(image, 1400, 788, 80)} 1400w`,
    ].join(', ')

    link.push({
      rel: 'preload',
      as: 'image',
      imagesrcset: srcset,
      imagesizes: '(max-width: 600px) 92vw, (max-width: 960px) 60vw, 70vw',
      fetchpriority: 'high',
    })
  }

  useHead({
    link,
  })
})
</script>

<style scoped>
@media (min-width: 1000px) {
  .text-custom-size {
    font-size: 2.5rem !important;
  }
}
</style>
