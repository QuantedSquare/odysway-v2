<template>
  <div>
    <!-- Hero + bandeau de réassurance (le bandeau est inclus dans le calcul
         de hauteur 100svh du hero sur desktop). -->
    <HomeHeroSection
      v-if="homeSanity"
      :image="homeSanity.heroSection.image"
      :placeholder-image="homeSanity.heroSection.image"
      :image-test="homeSanity.heroSectionTest.image"
      :image-mobile="homeSanity.heroSection.imageMobile"
      :image-mobile-test="homeSanity.heroSectionTest.imageMobile"
      :typewriter-words="homeSanity.heroSection.typewritterWords"
      :placeholder="homeSanity.heroSection.placeholder"
      :title-text="heroTitleText"
      :subtitle-text="heroSubtitleText"
      :trust-items="homeSanity?.trustBand?.items"
    />

    <v-container
      fluid
      class="px-0 px-sm-4"
    >
      <section class="py-0 my-0 px-0 px-md-4">
        <!-- Séjours du moment (mosaïque) -->
        <MomentMosaic
          v-if="homeSanity"
          :data="homeSanity?.momentSection"
        />

        <!-- Concept / manifeste -->
        <ConceptManifesto
          v-if="homeSanity"
          :data="homeSanity?.concept"
        />

        <!-- Départs garantis -->
        <LazyColorContainer
          :hydrate-on-visible="{ rootMargin: '400px' }" color="grey-light">
          <TrackableVoyageList
            :voyages="homeSanity?.guaranteedDepartures?.voyagesGuaranteedDepartures"
            :list-name="homeSanity?.guaranteedDepartures?.title"
          >
            <LazyHorizontalCarousel
              text-color="primary"
              slider-name="home-departs-garantis"
              :eyebrow="guaranteedEyebrow"
            >
              <template #title>
                <span style="color: rgba(43, 76, 82, 1)">
                  {{ homeSanity?.guaranteedDepartures?.title }}
                </span>
              </template>
              <template #carousel-item>
                <v-col
                  v-for="voyage in homeSanity?.guaranteedDepartures?.voyagesGuaranteedDepartures"
                  :key="voyage._id"
                >
                  <VoyageCardWithDates
                    :voyage="voyage"
                    :dates-by-slug="datesBySlug"
                    :item-list-name="homeSanity?.guaranteedDepartures?.title"
                    variant="guaranteed"
                  />
                </v-col>
              </template>
            </LazyHorizontalCarousel>
          </TrackableVoyageList>
          <div class="d-flex justify-center mb-5 mt-8">
            <v-btn
              height="60"
              variant="tonal"
              class="bg-primary text-white text-body-1 d-inline font-weight-bold"
              @click="handleProchainsDepartsClick"
            >
              {{ homeSanity?.guaranteedDepartures?.ctaButton?.text }}
            </v-btn>
          </div>
        </LazyColorContainer>

        <!-- Dernières places -->
        <LazyColorContainer
          :hydrate-on-visible="{ rootMargin: '400px' }"
          v-if="lastMinuteVoyages.length"
          color="soft-blush"
        >
          <TrackableVoyageList
            :voyages="lastMinuteVoyages"
            :list-name="lastMinuteTitle"
          >
            <LazyHorizontalCarousel
              text-color="primary"
              slider-name="home-last-minute"
              :eyebrow="lastMinuteEyebrow"
              :subtitle="lastMinuteSubtitle"
            >
              <template #title>
                <span style="color: rgba(43, 76, 82, 1)">{{ lastMinuteTitle }}</span>
              </template>
              <template #carousel-item>
                <v-col
                  v-for="voyage in lastMinuteVoyages"
                  :key="voyage._id"
                >
                  <VoyageCardWithDates
                    :voyage="voyage"
                    :dates-by-slug="datesBySlug"
                    :item-list-name="lastMinuteTitle"
                    variant="lastMinute"
                  />
                </v-col>
              </template>
            </LazyHorizontalCarousel>
          </TrackableVoyageList>
        </LazyColorContainer>

        <!-- Voyager selon vos envies -->
        <LazyColorContainer
          :hydrate-on-visible="{ rootMargin: '400px' }" color="white">
          <LazyCardGrid
            :categories="homeSanity?.followDesires?.categoriesFollowDesires"
            :promotion-name="homeSanity?.followDesires?.title"
            :eyebrow="followDesiresEyebrow"
          >
            <template #title>
              <span class="text-primary">
                {{ homeSanity.followDesires.title }}
              </span>
            </template>
          </LazyCardGrid>
        </LazyColorContainer>

        <!-- Best-sellers (voyages et/ou destinations à l'honneur) -->
        <LazyColorContainer
          :hydrate-on-visible="{ rootMargin: '400px' }"
          v-if="bestSellerItems.length"
          color="white"
        >
          <LazyHorizontalCarousel
            text-color="primary"
            slider-name="home-best-sellers"
            :eyebrow="bestSellersEyebrow"
            class="best-sellers-carousel"
          >
            <template #title>
              <span style="color: rgba(43, 76, 82, 1)">{{ bestSellersTitle }}</span>
            </template>
            <template #carousel-item>
              <v-col
                v-for="item in bestSellerItems"
                :key="item.key"
                cols="auto"
                class="pa-2"
              >
                <BestSellerCard
                  :title="item.title"
                  :prefix="item.prefix"
                  :image="item.image"
                  :to="item.to"
                  :compact="item.compact"
                  :count="item.count"
                />
              </v-col>
            </template>
          </LazyHorizontalCarousel>
        </LazyColorContainer>

        <!-- Séjours en France -->
        <LazyColorContainer
          :hydrate-on-visible="{ rootMargin: '400px' }" color="soft-blush">
          <TrackableVoyageList
            :voyages="homeSanity?.franceTrips?.voyagesFrance"
            :list-name="homeSanity?.franceTrips?.title"
          >
            <LazyHorizontalCarousel
              text-color="primary"
              slider-name="home-france-trips"
              :eyebrow="franceEyebrow"
            >
              <template #title>
                <span style="color: rgba(43, 76, 82, 1)">
                  {{ homeSanity?.franceTrips?.title }}
                </span>
              </template>
              <template #carousel-item>
                <v-col
                  v-for="voyage in homeSanity?.franceTrips?.voyagesFrance"
                  :key="voyage._id"
                >
                  <VoyageCardWithDates
                    :voyage="voyage"
                    :dates-by-slug="datesBySlug"
                    :item-list-name="homeSanity?.franceTrips?.title"
                  />
                </v-col>
              </template>
            </LazyHorizontalCarousel>
          </TrackableVoyageList>
        </LazyColorContainer>

        <!-- Conseiller / envie de partir -->
        <LazyColorContainer
          :hydrate-on-visible="{ rootMargin: '400px' }" color="grey-light-2">
          <LazyInfoContainer>
            <template #top>
              <AvatarsRowStack />
            </template>
            <template #title>
              {{ homeSanity.contact?.title }}
            </template>
            <template #description>
              {{ homeSanity.contact?.description }}
            </template>
            <template #bottom>
              <CtaButton
                :color="homeSanity.contact?.ctaButton.color"
                :link="homeSanity.contact?.ctaButton.link"
                cta-id="contact-rdv-home"
                :cta-label="homeSanity.contact?.ctaButton.text"
              >
                <template #text>
                  {{ homeSanity.contact?.ctaButton.text }}
                </template>
              </CtaButton>
            </template>
          </LazyInfoContainer>
        </LazyColorContainer>

        <!-- Avis (cartes photo plein cadre, style prototype) -->
        <LazyColorContainer
          :hydrate-on-visible="{ rootMargin: '400px' }" color="white">
          <LazyHomeReviewsRail
            :eyebrow="reviewsEyebrow"
            :title="homeSanity?.reviews?.title || 'Des voyageurs partagent leurs souvenirs'"
            :cta-text="homeSanity?.reviews?.ctaText"
          />
        </LazyColorContainer>

        <!-- Newsletter -->
        <LazyColorContainer
          :hydrate-on-visible="{ rootMargin: '400px' }"
          v-if="homeSanity?.newsletter"
          color="soft-blush"
        >
          <LazyNewsletterContainer>
            <template #title>
              <EnrichedText :value="homeSanity.newsletter.title" />
            </template>
            <template #subtitle>
              <EnrichedText
                class="text-grey-darken-2"
                :value="homeSanity.newsletter.subtitle"
              />
            </template>
          </LazyNewsletterContainer>
        </LazyColorContainer>
      </section>
    </v-container>
  </div>
</template>

<script setup>
import { portableTextToPlain } from '~/utils/portableTextToPlain'

const config = useRuntimeConfig()
const { trackCtaClick } = useGtmTracking()

definePageMeta({
  layout: 'homepage',
})

// Shared voyage projection for the carousels that reuse curated CMS lists.
const voyageProjection = `
  _id,
  "slug": slug.current,
  image,
  imageCard,
  rating,
  comments,
  title,
  availabilityTypes,
  duration,
  pricing,
  closingDays,
  destinations[]->{ _id, title },
  experienceType->{ _id, title },
  categories[]->{ _id, title },
  monthlyAvailability
`

const homeQuery = groq`
  *[_type == "homePage"][0]{
    // Explicit top-level fields (was a full-document "..." spread that pulled
    // every unused homePage field into the SSR HTML). Objects are fetched whole
    // to keep every sub-field the components read.
    heroSection,
    heroSectionTest,
    concept,
    trustBand,
    newsletter,
    momentSection{
      ...,
      feature{
        ...,
        voyage->{ "slug": slug.current }
      },
      miniFeatures[]{
        ...,
        voyage->{ "slug": slug.current }
      }
    },
    lastMinute{
      title,
      eyebrow,
      subtitle
    },
    bestSellers{
      eyebrow,
      title,
      items[]{
        travelersCountOverride,
        voyage->{
          _id,
          title,
          "slug": slug.current,
          image,
          imageCard
        },
        destination->{
          _id,
          title,
          "slug": slug.current,
          image,
          bestSellerPrefix,
          "voyageSlugs": *[_type == "voyage" && references(^._id)].slug.current
        },
        region->{
          _id,
          "title": nom,
          "slug": slug.current,
          image,
          bestSellerPrefix,
          "voyageSlugs": *[_type == "voyage" && ^._id in destinations[]->regions[]._ref].slug.current
        }
      }
    },
    contact{
      title,
      description,
      ctaButton{
        text,
        link,
        color
      },
    },
    reviews{
      ctaText,
      title,
      eyebrow
    },
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
    franceTrips{
      title,
      eyebrow,
      voyagesFrance[]->{ ${voyageProjection} }
    },
    followDesires{
      title,
      eyebrow,
      categoriesFollowDesires[]->{
        _id,
        title,
        slug,
        discoveryTitle,
        showOnHome,
        image,
        icon
      }
    },
    guaranteedDepartures{
      title,
      eyebrow,
      voyagesGuaranteedDepartures[]->{ ${voyageProjection} },
      ctaButton{
        text,
        link
      }
    },
    summerTravel{
      title,
      voyagesSummerTravel[]->{ ${voyageProjection} }
    },
    unforgettableTravels{
      title,
      voyagesUnforgettableTravels[]->{ ${voyageProjection} }
    }
  }
`

const { data: homeSanity } = await useSanityQuery(homeQuery)

// Extract plain-text title/subtitle so the LCP h1/h2 can render directly
// without the @portabletext/vue runtime, which was the dominant cost in
// the LCP "element render delay" metric.
const isProd = computed(() => config.public.environment === 'production')
const heroTitleText = computed(() => {
  const blocks = isProd.value
    ? homeSanity.value?.heroSection?.title
    : homeSanity.value?.heroSectionTest?.title
  return portableTextToPlain(blocks)
})
const heroSubtitleText = computed(() => {
  const blocks = isProd.value
    ? homeSanity.value?.heroSection?.subtitle
    : homeSanity.value?.heroSectionTest?.subtitle
  return portableTextToPlain(blocks)
})

// Dernières places: the voyages whose next bookable departure is the closest in
// time and still has seats left, resolved live from Supabase (one entry per
// voyage). Title/eyebrow/subtitle stay editable in Sanity.
const { lastMinuteVoyages } = useLastMinuteVoyages()
const lastMinuteTitle = computed(() => homeSanity.value?.lastMinute?.title || 'Dernières places')
const lastMinuteEyebrow = computed(() => homeSanity.value?.lastMinute?.eyebrow || '')
const lastMinuteSubtitle = computed(() => homeSanity.value?.lastMinute?.subtitle || 'Il reste quelques places, le départ est proche.')

const bestSellersTitle = computed(() => homeSanity.value?.bestSellers?.title || 'Nos best-sellers')
const bestSellersEyebrow = computed(() => homeSanity.value?.bestSellers?.eyebrow || 'Les plus demandés')

// Best-sellers = portrait cards featuring voyages and/or destinations, mixed
// in a single CMS-ordered list (bestSellers.items[], each entry either a
// voyage or a destination reference — see homePageType.ts).
// Fallback demo set so the section is never empty before CMS is filled.
const defaultBestSellers = [
  { _id: 'bs-nepal', title: 'Népal', bestSellerPrefix: 'Trek & immersion au', slug: 'nepal', voyageSlugs: [] },
  { _id: 'bs-kenya', title: 'Kenya', bestSellerPrefix: 'Safari & rencontres au', slug: 'kenya', voyageSlugs: [] },
  { _id: 'bs-marrakech', title: 'Marrakech', bestSellerPrefix: 'Bien-être à', slug: 'maroc', voyageSlugs: [] },
  { _id: 'bs-srilanka', title: 'Sri Lanka', bestSellerPrefix: 'Île fantastique, le', slug: 'sri-lanka', voyageSlugs: [] },
  { _id: 'bs-laponie', title: 'Laponie', bestSellerPrefix: 'Aurores boréales en', slug: 'laponie', voyageSlugs: [] },
]
const bestSellerEntries = computed(() => homeSanity.value?.bestSellers?.items || [])

// Eyebrows (CMS value with demo fallback) for the other carousels/sections.
const guaranteedEyebrow = computed(() => homeSanity.value?.guaranteedDepartures?.eyebrow || 'Réservez l\'esprit tranquille')
const franceEyebrow = computed(() => homeSanity.value?.franceTrips?.eyebrow || 'Près de chez vous')
const followDesiresEyebrow = computed(() => homeSanity.value?.followDesires?.eyebrow || 'Par où commencer')
const reviewsEyebrow = computed(() => homeSanity.value?.reviews?.eyebrow || '')

const slugOf = voyage => voyage?.slug?.current || voyage?.slug

const homeVoyages = computed(() => {
  if (!homeSanity.value) return []
  const sections = [
    homeSanity.value.franceTrips?.voyagesFrance || [],
    homeSanity.value.guaranteedDepartures?.voyagesGuaranteedDepartures || [],
    lastMinuteVoyages.value,
  ]
  return sections.flat().filter(Boolean)
})

const homeVoyageSlugs = computed(() => {
  return [...new Set(homeVoyages.value.map(slugOf).filter(Boolean))]
})

const { datesBySlug } = useTravelDates(homeVoyageSlugs)

// Best-sellers "N voyageurs partis" badge — counted from Supabase booked_dates,
// aggregated per destination across all of its voyages (voyageSlugs from GROQ).
// Entries with a manual travelersCountOverride skip the Supabase lookup entirely.
const bestSellerVoyageSlugs = computed(() => [...new Set(
  bestSellerEntries.value
    .filter(entry => entry.travelersCountOverride == null)
    .flatMap(entry => entry.voyage
      ? [slugOf(entry.voyage)]
      : (entry.destination?.voyageSlugs || entry.region?.voyageSlugs || []))
    .filter(Boolean),
)])
const { countsBySlug } = useTravelersCount(bestSellerVoyageSlugs)
// Aggregate the "voyageurs partis" count across every voyage slug attached to
// the destination/region (both expose voyageSlugs from the GROQ query).
const aggregateAutoCount = item =>
  (item.voyageSlugs || []).reduce((sum, s) => sum + (countsBySlug.value[s] || 0), 0) || null

// Normalised portrait-card items, in the order set in the CMS. Each entry is
// either a voyage (compact card) or a destination (prefix + name card); the
// override, if set, always wins over the computed count.
const bestSellerItems = computed(() => {
  if (bestSellerEntries.value.length) {
    return bestSellerEntries.value.map((entry, i) => {
      if (entry.voyage) {
        const v = entry.voyage
        return {
          key: v._id || i,
          to: `/voyages/${slugOf(v)}`,
          title: v.title,
          prefix: '',
          image: v.imageCard || v.image,
          compact: true,
          count: entry.travelersCountOverride ?? (countsBySlug.value[slugOf(v)] || null),
        }
      }
      if (entry.destination) {
        const d = entry.destination
        return {
          key: d._id || i,
          to: d.slug ? `/destinations/${d.slug}` : '/destinations',
          title: d.title,
          prefix: d.bestSellerPrefix,
          image: d.image,
          compact: false,
          count: entry.travelersCountOverride ?? aggregateAutoCount(d),
        }
      }
      if (entry.region) {
        const r = entry.region
        return {
          key: r._id || i,
          // Regions are served by the destinations route (see
          // /destinations/[destinationSlug].vue, which detects region slugs).
          to: r.slug ? `/destinations/${r.slug}` : '/destinations',
          title: r.title,
          prefix: r.bestSellerPrefix || '',
          image: r.image,
          compact: false,
          count: entry.travelersCountOverride ?? aggregateAutoCount(r),
        }
      }
      return null
    }).filter(Boolean)
  }
  // Nothing configured in the CMS yet: fall back to the demo destinations.
  return defaultBestSellers.map(d => ({
    key: d._id,
    to: `/destinations/${d.slug}`,
    title: d.title,
    prefix: d.bestSellerPrefix,
    image: null,
    compact: false,
    count: null,
  }))
})

// GTM tracking handlers
const handleProchainsDepartsClick = () => {
  const link = homeSanity.value?.guaranteedDepartures?.ctaButton?.link || '/prochains-departs'

  trackCtaClick({
    ctaId: 'prochains-departs-home',
    ctaLabel: homeSanity.value?.guaranteedDepartures?.ctaButton?.text || 'Prochains départs',
    ctaUrl: link,
  })

  navigateTo(link)
}

if (homeSanity.value) {
  // Fallback values for content
  const defaultContent = {
    title: 'Odysway - Voyages en Petits Groupes et Expériences Authentiques',
    description: 'Découvrez nos voyages en petits groupes à travers le monde. Expériences authentiques, rencontres locales et aventures inoubliables avec Odysway.',
    image: homeSanity.value.heroSection?.image,
  }

  // Use the SEO composable
  useSeo({
    seoData: homeSanity.value.seo,
    content: defaultContent,
    pageType: 'website',
    slug: 'home',
    baseUrl: '/',
    structuredData: [
      createOrganizationSchema({
        description: homeSanity.value.seo?.metaDescription || defaultContent.description,
        aggregateRating: {
          ratingValue: '4.9',
          reviewCount: '156',
          bestRating: '5',
        },
      }),
      createWebSiteSchema(),
    ],
  })
}
</script>

<style scoped>
/* The best-seller cards' hover shadow/lift was getting clipped: the
   carousel's scrolling row needs overflow-auto (via HorizontalCarousel) for
   the horizontal drag/scroll to work, and that same rule clips vertical
   overflow too — including a hovered card's shadow bloom. CardGrid's desktop
   cards never hit this because they sit in a plain v-row with no scroll
   container at all.

   Fix: give the row 60px of internal padding (inside the clip boundary, so
   the shadow has room), then pull its margin-top/-bottom in by that same
   60px so the row's outer position on the page doesn't shift. Vuetify's
   mt-4/mt-md-10 utility classes are !important, so overriding margin-top
   needs !important too — and since overflow:auto clips at the padding edge
   (not the margin edge), that pre-existing margin was never usable as
   buffer room in the first place; it only set the visual gap above the
   title, which this keeps net-identical by replacing it with
   (original margin) − 60px instead of margin-top: -60px outright. */
.best-sellers-carousel :deep(.v-row.overflow-auto) {
  padding-block: 60px !important;
  margin-top: -44px !important; /* 16px (mt-4) - 60px */
  margin-bottom: -60px !important;
}

@media (min-width: 960px) {
  .best-sellers-carousel :deep(.v-row.overflow-auto) {
    margin-top: -20px !important; /* 40px (mt-md-10) - 60px */
  }
}
</style>
