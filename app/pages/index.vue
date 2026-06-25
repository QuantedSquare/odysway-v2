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
      class="mx-0 mx-md-5 px-1 py-0 "
    >
      <section class="py-0 my-0 px-2 px-md-4">
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
        <LazyColorContainer color="grey-light">
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
              :icon="mdiFire"
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
        <LazyColorContainer color="white">
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

        <!-- Best-sellers (destinations à l'honneur) -->
        <LazyColorContainer
          v-if="bestSellerDestinations.length"
          color="white"
        >
          <LazyHorizontalCarousel
            text-color="primary"
            slider-name="home-best-sellers"
            :eyebrow="bestSellersEyebrow"
          >
            <template #title>
              <span style="color: rgba(43, 76, 82, 1)">{{ bestSellersTitle }}</span>
            </template>
            <template #carousel-item>
              <v-col
                v-for="dest in bestSellerDestinations"
                :key="dest._id"
                cols="auto"
                class="pa-2"
              >
                <BestSellerCard
                  :title="dest.title"
                  :prefix="dest.bestSellerPrefix"
                  :image="dest.image"
                  :slug="dest.slug"
                  :count="destinationCount(dest)"
                />
              </v-col>
            </template>
          </LazyHorizontalCarousel>
        </LazyColorContainer>

        <!-- Séjours en France -->
        <LazyColorContainer color="soft-blush">
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
        <LazyColorContainer color="grey-light-2">
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

        <!-- Avis -->
        <LazyColorContainer color="white">
          <LazyCommonReviewContainer :eyebrow="reviewsEyebrow">
            <template #title>
              <span style="color: rgba(43, 76, 82, 1)">
                {{ homeSanity?.reviews?.title }}
              </span>
            </template>
            <template #cta>
              {{ homeSanity?.reviews?.ctaText }}
            </template>
          </LazyCommonReviewContainer>
        </LazyColorContainer>
      </section>
    </v-container>
  </div>
</template>

<script setup>
import { mdiFire } from '@mdi/js'
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
    ...,
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
      subtitle,
      voyages[]->{ ${voyageProjection} }
    },
    bestSellers{
      eyebrow,
      title,
      destinations[]->{
        _id,
        title,
        "slug": slug.current,
        image,
        bestSellerPrefix,
        "voyageSlugs": *[_type == "voyage" && references(^._id)].slug.current
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

// Dernières places / Best-sellers reuse curated CMS lists. If the dedicated
// fields are empty, fall back to existing carousels so the sections still
// render without new data entry.
const lastMinuteVoyages = computed(() => {
  const dedicated = homeSanity.value?.lastMinute?.voyages
  if (dedicated?.length) return dedicated
  return homeSanity.value?.summerTravel?.voyagesSummerTravel || []
})
const lastMinuteTitle = computed(() => homeSanity.value?.lastMinute?.title || 'Dernières places')
const lastMinuteEyebrow = computed(() => homeSanity.value?.lastMinute?.eyebrow || '')
const lastMinuteSubtitle = computed(() => homeSanity.value?.lastMinute?.subtitle || 'Il reste quelques places, le départ est proche.')

const bestSellersTitle = computed(() => homeSanity.value?.bestSellers?.title || 'Nos best-sellers')
const bestSellersEyebrow = computed(() => homeSanity.value?.bestSellers?.eyebrow || 'Les plus demandés')

// Best-sellers = portrait cards featuring destinations (prefix + name + count).
// Fallback demo set so the section is never empty before CMS is filled.
const defaultBestSellers = [
  { _id: 'bs-nepal', title: 'Népal', bestSellerPrefix: 'Trek & immersion au', slug: 'nepal', voyageSlugs: [] },
  { _id: 'bs-kenya', title: 'Kenya', bestSellerPrefix: 'Safari & rencontres au', slug: 'kenya', voyageSlugs: [] },
  { _id: 'bs-marrakech', title: 'Marrakech', bestSellerPrefix: 'Bien-être à', slug: 'maroc', voyageSlugs: [] },
  { _id: 'bs-srilanka', title: 'Sri Lanka', bestSellerPrefix: 'Île fantastique, le', slug: 'sri-lanka', voyageSlugs: [] },
  { _id: 'bs-laponie', title: 'Laponie', bestSellerPrefix: 'Aurores boréales en', slug: 'laponie', voyageSlugs: [] },
]
const bestSellerDestinations = computed(() => {
  const dest = homeSanity.value?.bestSellers?.destinations
  return dest?.length ? dest : defaultBestSellers
})

// Eyebrows (CMS value with demo fallback) for the other carousels/sections.
const guaranteedEyebrow = computed(() => homeSanity.value?.guaranteedDepartures?.eyebrow || 'Réservez l\'esprit tranquille')
const franceEyebrow = computed(() => homeSanity.value?.franceTrips?.eyebrow || 'Près de chez vous')
const followDesiresEyebrow = computed(() => homeSanity.value?.followDesires?.eyebrow || 'Par où commencer')
const reviewsEyebrow = computed(() => homeSanity.value?.reviews?.eyebrow || 'Ils en parlent mieux que nous')

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
const bestSellerVoyageSlugs = computed(() =>
  [...new Set(bestSellerDestinations.value.flatMap(d => d.voyageSlugs || []).filter(Boolean))],
)
const { countsBySlug } = useTravelersCount(bestSellerVoyageSlugs)
const destinationCount = dest =>
  (dest.voyageSlugs || []).reduce((sum, s) => sum + (countsBySlug.value[s] || 0), 0) || null

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
