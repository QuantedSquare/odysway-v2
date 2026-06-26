<template>
  <div
    class="relative w-100 px-0 pt-0 bg-warm"
  >
    <ClientOnly>
      <FunnelCardHeader
        v-if="voyage"
        :titre="voyage.title"
        :travel-type="voyage.travelType"
        :image="voyage.imgSrc"
        :date="checkoutStepperRef?.displayedDates"
        :current-step="checkoutStepperRef?.currentStep"
        :step-definitions="checkoutStepperRef?.stepDefinitions"
        :skipper-mode="checkoutStepperRef?.skipperMode"
        :voyage="voyage"
        :dynamic-deal-values="checkoutStepperRef?.dynamicDealValues"
        :page-texts="pageTexts"
      />
      <template #fallback>
        <div class="w-100 h-50 bg-primary" />
      </template>
    </ClientOnly>
    <v-container>
      <v-row
        justify="center"
        align="center"
      >
        <v-skeleton-loader
          v-if="loading"
          type="card"
        />
        <ClientOnly>
          <!-- ✅ Funnel component -->
          <FunnelCheckoutStepper
            v-if="pageTexts && voyage && dealValues"
            ref="checkoutStepperRef"
            :page-texts="pageTexts"
            :voyage="voyage"
            :initial-deal-values="dealValues"
          />

          <!-- ⚠️ Graceful fallback -->
          <v-card
            v-else
            class="pa-8 text-center mt-16 mx-auto"
            max-width="600"
          >
            <v-icon
              size="64"
              color="warning"
              class="mb-4"
            >
              {{ mdiAlertCircleOutline }}
            </v-icon>
            <h2 class="text-h5 mb-2 font-weight-bold">
              {{ pageTexts?.error_state?.title || "Oops !" }}
            </h2>
            <p class="text-body-1 mb-4">
              {{ pageTexts?.error_state?.message || "Nous n’avons pas pu charger les informations de votre voyage. Il se peut que le lien soit expiré ou incomplet." }}
            </p>
            <v-btn
              color="primary"
              to="/voyages"
              rounded
            >
              {{ pageTexts?.error_state?.button_text || "Retourner à la liste des voyages" }}
            </v-btn>
          </v-card>
        </ClientOnly>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { mdiAlertCircleOutline } from '@mdi/js'

import { buildVoyageFromSanity, buildVoyageFromAC } from '~/utils/voyageBuilders'

// 🧭 Layout & SEO
definePageMeta({ layout: 'funnel' })
useSeoMeta({
  htmlAttrs: { lang: 'fr' },
  robots: 'noindex, follow',
  canonical: 'https://odysway.com/',
})

const route = useRoute()
const { travelTitle } = useFunnelHeader()
const { report, reportApiError, setContext } = useFunnelReporter()

const checkoutStepperRef = useTemplateRef('checkoutStepperRef')

// 🧠 Extract query parameters
const dateId = route.query.date_id
const bookedId = route.query.booked_id
const voyageSlug = route.query.voyage
const dealValues = ref(null)
// 🎯 Local state
const voyage = ref(null)
const pageTexts = ref(null)
const loading = ref(true)
const error = ref(null)
const imgSrc = ref(null)
// 🧱 1. Fetch page texts (from Sanity)
const checkoutTextsQuery = groq`*[_type == "checkout"][0]{ ... }`
const voyagePageStickyQuery = groq`*[_type == "page_voyage"][0]{
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
}`
try {
  const [{ data: pageTextsData }, { data: voyagePageData }] = await Promise.all([
    useSanityQuery(checkoutTextsQuery),
    useSanityQuery(voyagePageStickyQuery),
  ])
  pageTexts.value = pageTextsData.value
  if (pageTexts.value && voyagePageData.value) {
    pageTexts.value.stickyBlock = voyagePageData.value.stickyBlock
  }

  imgSrc.value = getImageUrl(pageTexts.value.image_checkout?.asset?._ref || null)
}
catch (err) {
  console.error('Error fetching checkout page texts:', err)
}

// 🚀 2. Build voyage (from AC or Sanity)
const initCheckout = async () => {
  // Seed context so every report from here on carries the funnel identifiers.
  setContext({ bookedId, dateId, voyageSlug })
  try {
    loading.value = true
    if (bookedId) {
      // ActiveCampaign deal checkout
      const deal = await apiRequest(`/ac/deals/deal-from-bms?bookedId=${bookedId}`)
      if (!deal) {
        report({
          code: 'AC_DEAL_FROM_BMS_EMPTY',
          step: 'init',
          severity: 'fatal',
          origin: { field: 'deal', endpoint: '/ac/deals/deal-from-bms', received: bookedId },
          message: `Aucun deal trouvé pour bookedId ${bookedId}`,
        })
        throw new Error(`No deal found with bookedId ${bookedId}`)
      }
      setContext({ dealId: deal?.id, voyageSlug: deal?.slug })
      dealValues.value = buildDynamicDealValues(deal)
      voyage.value = buildVoyageFromAC(deal, imgSrc.value)
      travelTitle.value = voyage.value?.title || ''
    }
    else if (dateId) {
      // Sanity voyage checkout
      const fetchedDate = await apiRequest(`/booking/date/${dateId}`)
      const bookedSeat = Number(fetchedDate.booked_seat || 0)
      const maxTravelers = Number(fetchedDate.max_traveler ?? fetchedDate.max_travelers ?? 0)
      if (Number.isNaN(bookedSeat) || Number.isNaN(maxTravelers)) {
        report({
          code: 'DATE_SEAT_NAN',
          step: 'init',
          origin: {
            field: Number.isNaN(maxTravelers) ? 'max_traveler' : 'booked_seat',
            received: Number.isNaN(maxTravelers) ? fetchedDate.max_traveler : fetchedDate.booked_seat,
            expected: 'nombre',
          },
          message: 'Valeur de places non numérique sur la date',
        })
      }
      if (maxTravelers > 0 && bookedSeat >= maxTravelers) {
        await navigateTo({
          path: '/checkout/complet',
          query: {
            voyage: voyageSlug || fetchedDate.travel_slug,
            date_id: dateId,
          },
        })
        return
      }
      const travelSanity = await apiRequest(`/sanity/?slug=${voyageSlug || fetchedDate.travel_slug}`)

      if (fetchedDate && travelSanity) {
        voyage.value = buildVoyageFromSanity(fetchedDate, travelSanity, imgSrc.value)
        travelTitle.value = voyage.value?.title || ''
        dealValues.value = buildDynamicDealValues()
      }
      else {
        report({
          code: 'SANITY_TRAVEL_MISSING',
          step: 'init',
          severity: 'fatal',
          origin: { field: 'travelSanity', received: voyageSlug || fetchedDate.travel_slug, endpoint: '/sanity' },
          message: 'Voyage Sanity introuvable pour le slug',
        })
        throw new Error(`Date not found for ${voyageSlug || fetchedDate.travel_slug}`)
      }
    }
    else {
      report({
        code: 'MISSING_QUERY_PARAMS',
        step: 'init',
        severity: 'fatal',
        origin: { field: 'date_id|booked_id', received: null, expected: 'date_id ou booked_id dans l\'URL' },
        message: 'Paramètres de requête manquants sur /checkout',
      })
      throw new Error('Missing required query parameters')
    }
    loading.value = false
  }
  catch (err) {
    loading.value = false
    console.error('Error building voyage:', err)
    error.value = err.message
    // Backstop: report any init failure not already covered above (e.g. a
    // network failure on one of the fetches) with its API origin.
    if (err?.__funnel) {
      reportApiError(err, { code: 'INIT_CHECKOUT_FAILED', step: 'init', message: 'Échec d\'initialisation du checkout' })
    }
  }
}

await initCheckout()
</script>

<style scoped>
.relative {
  position: relative;
}

.absolute {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
