<template>
  <div>
    <div v-if="voyage && !customTravel">
      <RdvBottomBar
        v-if="isRdvVariant"
        :starting-price="voyage.pricing.startingPrice"
        :dates-text="rdvContent.bottomBar.datesText"
        :rdv-button-text="rdvContent.bottomBar.rdvButtonText"
        @scroll-to-dates="scrollToDates"
      />
      <LazyBottomAppBar
        v-else
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

            <RdvSection
              v-if="isRdvVariant"
              :section="rdvContent.rdvSection"
              :cal-link="rdvContent.calLink"
            />

            <LazyProgrammeContainer :programme-block="voyage.programmeBlock" />

            <LazyAccompanistsContainer
              :voyage="voyage"
              :title="page.accompanistsTitle"
            />
          </template>
          <template #right-side>
            <RdvInfoCard
              v-if="isRdvVariant"
              :sticky-block="page.stickyBlock"
              :voyage="voyage"
              :content="rdvContent"
              :upcoming-dates="upcomingDates"
              @scroll-to-dates="scrollToDates"
            />
            <InfoCard
              v-else
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

          <template v-if="isRdvVariant">
            <RdvBand
              :text="rdvContent.band.text"
              :button-text="rdvContent.band.buttonText"
            />
            <RdvDatesCompact
              :content="rdvContent.dates"
              :upcoming-dates="upcomingDates"
              :is-loading="areDatesLoading"
              :voyage="voyage"
              :rdv-button-text="rdvContent.infoCard.rdvButtonText"
            />
          </template>
          <LazyDatesPricesContainer
            v-else
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

          <RdvNudge
            v-if="isRdvVariant"
            :title="rdvContent.nudge.title"
            :subtitle="rdvContent.nudge.subtitle"
            :button-text="rdvContent.nudge.buttonText"
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
      <RdvCalDialog
        v-if="isRdvVariant"
        :cal-link="rdvContent.calLink"
        :voyage="voyage"
      />
      <!-- Banner variant switcher (remove once a variant is chosen) -->
      <!-- <div style="position:fixed;bottom:110px;right:16px;z-index:2000">
        <v-btn-toggle
          v-model="bannerVariant"
          mandatory
          density="compact"
          rounded="lg"
          color="primary"
        >
          <v-btn
            value="A"
            size="small"
          >
            A
          </v-btn>
          <v-btn
            value="B"
            size="small"
          >
            B
          </v-btn>
          <v-btn
            value="C"
            size="small"
          >
            C
          </v-btn>
        </v-btn-toggle>
      </div>
      <CallBannerDelayed
        :voyage-title="voyage.title"
        :variant="bannerVariant"
      /> -->
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
import { useGoTo } from 'vuetify'
import { detectAdPlatform } from '~/composables/useLeadSource'
import {
  AB_TEST_NAME,
  RDV_VARIANT_DEFAULTS,
  resolveVoyageVariant,
  toUpcomingDates,
  withRdvDefaults,
} from '~/utils/rdvVariant'

definePageMeta({
  layout: 'voyage',
  middleware: ['old-voyages-link-redirection'],
})

const route = useRoute()
const { trackViewItem } = useGtmTracking()
const { formatVoyageForGtm } = useGtmVoyageFormatter()

const voyageSlugRef = computed(() => route.params.voyageSlug)
const [{ data: page }, { data: voyage }] = await Promise.all([
  useSanityQuery(VOYAGE_PAGE_QUERY),
  useSanityQuery(VOYAGE_QUERY, { slug: voyageSlugRef }),
])

const experienceTypeIdRef = computed(() => voyage.value?.experienceType?._id)
const { data: voyagePropositions } = await useSanityQuery(
  VOYAGE_PROPOSITIONS_QUERY,
  { slug: voyageSlugRef, experienceTypeId: experienceTypeIdRef },
  { lazy: true },
)
// Test A/B « prise de rendez-vous » : ?from-meta-2 sert la variante B (cf. utils/rdvVariant).
// Textes : défauts du code < page_voyage.rdvVariant < voyage.rdvBlock (bloc principal).
const rdvContent = computed(() => {
  const content = withRdvDefaults(RDV_VARIANT_DEFAULTS, page.value?.rdvVariant)
  content.rdvSection = withRdvDefaults(content.rdvSection, voyage.value?.rdvBlock)
  return content
})
const abVariant = computed(() => rdvContent.value.enabled ? resolveVoyageVariant(route.query) : 'A')
const isRdvVariant = computed(() => abVariant.value === 'B')

// Les dates ne sont chargées ici que pour la variante B (carte + liste réduite) ;
// en A, InfoCard et DatesPricesContainer gardent leur propre chargement.
const { dates: rdvDates, isLoading: areDatesLoading } = isRdvVariant.value
  ? useDates()
  : { dates: ref([]), isLoading: ref(false) }
const upcomingDates = computed(() => toUpcomingDates(rdvDates.value, {
  closingDays: voyage.value?.closingDays,
  lastMinutePrice: voyage.value?.pricing?.lastMinuteReduction,
  earlyBirdPrice: voyage.value?.pricing?.earlyBirdReduction,
}))

const goTo = useGoTo()
const { trackAbExposure, trackAbEvent } = useGtmTracking()
const { getLeadSource } = useLeadSource()

function scrollToDates(position) {
  trackAbEvent('cta_dates_click', { ab_test: AB_TEST_NAME, position })
  goTo('#dates-container', { offset: -100 })
}

onMounted(() => {
  if (!voyage.value) return
  // Exposition au test avant view_item, pour que ab_variant / lead_source soient déjà
  // dans le dataLayer quand les balises de la page se déclenchent. app.vue n'enregistre
  // la query d'arrivée qu'après ce hook (parent monté en dernier), d'où la détection
  // directe sur la query courante.
  trackAbExposure({
    abTest: AB_TEST_NAME,
    abVariant: abVariant.value,
    leadSource: detectAdPlatform(route.query) || getLeadSource().platform,
    itemId: voyage.value.slug?.current,
  })

  // GTM: Track view_item event
  const formattedVoyage = formatVoyageForGtm(voyage.value)
  trackViewItem(formattedVoyage, voyage.value.pricing?.startingPrice)
})

// const bannerVariant = ref('A')

const customTravel = computed(() => {
  const types = voyage.value?.availabilityTypes
  return Array.isArray(types) && types.length === 1 && types[0] === 'custom'
})

// Sur-mesure-only voyages are sold on their unlisted page when it is published.
// 302, not 301: the voyage may later become groupe/privatisation and move back here.
if (customTravel.value && voyage.value?.customPagePublished) {
  await navigateTo(`/sur-mesure/${voyage.value.slug.current}`, { redirectCode: 302 })
}

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
    structuredData: [
      createTouristTripSchema(
        voyage.value,
        `https://odysway.com/voyages/${voyage.value.slug.current}`,
        config,
      ),
      createFAQPageSchema(
        [
          ...(voyage.value.faqBlock || []),
          ...(page.value?.faqSection?.faqBlock || []),
        ],
        `https://odysway.com/voyages/${voyage.value.slug.current}`,
      ),
    ],
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

// Image preload — reactive to handle lazy data
watchEffect(() => {
  if (!voyage.value || customTravel.value) return

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
