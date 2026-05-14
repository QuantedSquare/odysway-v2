<template>
  <div>
    <div v-if="voyage && !customTravel">
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
        <LazySubHeaderMobileCTABar
          :hydrate-on-idle="true"
          :date-sections="page.dateSections"
          :starting-price="voyage.pricing.startingPrice"
          :no-group-travel="!voyage.availabilityTypes?.includes('groupe')"
          :slug="voyage.slug.current"
        />
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
          <LazyContactUsSection
            v-if="!voyage.availabilityTypes?.includes('groupe') && voyage.availabilityTypes?.includes('privatisation')"
            :contact-section="page.contactSection"
          />

          <LazyDatesPricesContainer
            :closing-days="voyage.closingDays"
            :contact-section="page.contactSection"
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
            :static-faq="page.faqSection?.faqBlock"
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
  middleware: ['old-voyages-link-redirection'],
  // The global `out-in` transitions delay hydration ~150-300 ms; disabling
  // here is a measurable LCP/TBT win for this perf-sensitive route.
  pageTransition: false,
  layoutTransition: false,
})

const route = useRoute()
const { trackViewItem } = useGtmTracking()
const { formatVoyageForGtm } = useGtmVoyageFormatter()

// Explicit projection (no `...,` spread) so the singleton's many unused
// CMS-only fields don't ship in the inlined payload. Fields below are the
// only ones actually consumed by the template + child components.
const voyagePageQuery = `
  *[_type == "page_voyage"][0]{
    dateSections,
    experiencesBlock,
    accompanistsTitle,
    housingTitle,
    housingTypeTitle,
    housingMoodTitle,
    priceDetailsSection,
    reviewsSection,
    indivSection,
    pageNotFound{
      description,
      buttonTo,
      buttonText
    },
    authorNote{
      title
    },
    faqSection{
      faqBlock
    },
    contactSection{
      ...,
      teamMembers[]->{
        _id,
        name,
        image
      }
    },
    stickyBlock{
      ...,
      ctaCall{
        ...,
        avatars[]->{
          _id,
          name,
          image
        }
      }
    }
  }
`
// The voyage doc is large. We split it into two queries:
//
// 1. `voyageHeroQuery`  — awaited at SSR. Contains everything needed for
//    LCP-critical UI (Hero, Chips, InfoCard, BottomAppBar), for SEO/JSON-LD,
//    and for the `<link rel=preload>` image hint. Avoids the `...,` spread
//    so the inlined Sanity payload stays small.
//
// 2. `voyageContentQuery` — fetched with `lazy: true`. Contains heavy rich
//    blocks (authorNote, experiencesBlock, programmeBlock, accompanists*,
//    housingBlock, pricingDetailsBlock, faqBlock). All consumers of these
//    fields are `LazyXxx` with internal `v-if` guards, so they render empty
//    shells SSR-side and populate once content resolves client-side.
const voyageHeroQuery = `
  *[_type == "voyage" && slug.current == $slug][0]{
    _id,
    _type,
    slug,
    title,
    duration,
    monthlyAvailability,
    image{
      asset->{
       ...
      },
      alt,
      hotspot,
      crop
    },
    imageSecondary,
    photosList,
    videoLinks,
    rating,
    comments,
    pricing,
    availabilityTypes,
    closingDays,
    levelBadgeOrder,
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
    destinations[]->{
      _id,
      title,
      iso,
      chapka
    },
    experienceType->{
      _id,
      title,
      badgeTitle
    },
    categories[]->{
      _id,
      title
    },
    difficultyLevel->{
      description,
      level,
      title
    }
  }
`

const voyageContentQuery = `
  *[_type == "voyage" && slug.current == $slug][0]{
    authorNote{
      ...,
      author->{
        ...
      }
    },
    experiencesBlock,
    programmeBlock,
    accompanistsList,
    accompanistsDescription,
    housingBlock,
    pricingDetailsBlock,
    faqBlock
  }
`

const voyagePropositionsQuery = `
  *[_type == "voyage" && (
        !('custom' in availabilityTypes) ||
        (count(availabilityTypes) > 1)
      ) && slug.current != $slug && experienceType._ref == $experienceTypeId][0...5]{
    _id,
    title,
    "slug": slug.current,
    image,
    imageCard,
    rating,
    comments,
    availabilityTypes,
    duration,
    pricing{
      startingPrice
    },
    destinations[]->{
      _id,
      title
    },
    experienceType->{
      _id,
      title
    },
    categories[]->{
      _id,
      title
    },
    monthlyAvailability
  }
`
const voyageSlugRef = computed(() => route.params.voyageSlug)
const [{ data: page }, { data: voyageHero }] = await Promise.all([
  useSanityQuery(voyagePageQuery),
  useSanityQuery(voyageHeroQuery, { slug: voyageSlugRef }),
])

// Below-fold heavy content — fetched lazily so the SSR HTML payload stays
// small. Children read these via the merged `voyage` computed below.
const { data: voyageContent } = await useSanityQuery(
  voyageContentQuery,
  { slug: voyageSlugRef },
  { lazy: true },
)

// Merged view that downstream code (HeroVoyageSection, InfoCard, lazy
// children, useSeo, GTM tracking) consumes as before. Spread order matters:
// content fields override hero only when present, otherwise stay undefined.
const voyage = computed(() => {
  if (!voyageHero.value) return null
  return { ...voyageHero.value, ...(voyageContent.value || {}) }
})

const experienceTypeIdRef = computed(() => voyage.value?.experienceType?._id)
const { data: voyagePropositions } = await useSanityQuery(
  voyagePropositionsQuery,
  { slug: voyageSlugRef, experienceTypeId: experienceTypeIdRef },
  { lazy: true },
)
onMounted(() => {
  // GTM: Track view_item event
  if (voyage.value) {
    const formattedVoyage = formatVoyageForGtm(voyage.value)
    trackViewItem(formattedVoyage, voyage.value.pricing?.startingPrice)
  }
})

const customTravel = computed(() => {
  const types = voyage.value?.availabilityTypes
  return Array.isArray(types) && types.length === 1 && types[0] === 'custom'
})

const config = useRuntimeConfig()

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

// SEO composable — called once during setup (not inside watchEffect)
if (voyage.value && !customTravel.value) {
  useSeo({
    seoData: voyage.value.seo,
    content: voyage.value,
    pageType: 'website',
    slug: voyage.value.slug?.current,
    structuredData: createTouristTripSchema(
      voyage.value,
      `https://odysway.com/voyages/${voyage.value.slug.current}`,
      config,
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
}

// Image preload — emitted once at SSR so the <link rel=preload> ships in
// the initial HTML head (the only place where it can race the LCP image
// fetch). voyage.value is set during the synchronous setup await above and
// never changes for a given route, so a watchEffect was overkill — it just
// shifted work to hydration where the preload no longer helps.
if (voyage.value && !customTravel.value && voyage.value.image) {
  const image = voyage.value.image
  // Must mirror the rendered <NuxtImg> srcset/sizes exactly, otherwise the
  // browser downloads a different URL than the preload (waste).
  const srcset = [
    `${buildMainImageUrl(image, 400, 225, 80)} 400w`,
    `${buildMainImageUrl(image, 600, 338, 80)} 600w`,
    `${buildMainImageUrl(image, 800, 450, 80)} 800w`,
    `${buildMainImageUrl(image, 1000, 563, 80)} 1000w`,
    `${buildMainImageUrl(image, 1400, 788, 80)} 1400w`,
  ].join(', ')

  useHead({
    link: [{
      rel: 'preload',
      as: 'image',
      imagesrcset: srcset,
      imagesizes: '(max-width: 600px) 92vw, (max-width: 960px) 60vw, 70vw',
      fetchpriority: 'high',
    }],
  })
}
</script>

<style scoped>
@media (min-width: 1000px) {
  .text-custom-size {
    font-size: 2.5rem !important;
  }
}
</style>
