<template>
  <v-container
    fluid
    class="relative"
  >
    <!-- Background image -->
    <v-img
      class="footer-bg-img absolute"
      :src="img('/logos/odysway-text.png', { format: 'webp', quality: 70, width: 1024, height: 400 })"
      :lazy-src="img('/logos/odysway-text.png', { format: 'webp', quality: 10, width: 1024, height: 400 })"
      :srcset="`${img('/logos/odysway-text.png', { format: 'webp', quality: 70, width: 1024, height: 400 })} 1024w, ${img('/logos/odysway-text.png', { format: 'webp', quality: 70, width: 640, height: 400 })} 640w`"
      sizes="(max-width: 600px) 480px, 1024px"
      cover
      loading="lazy"
      alt="Odysway texte en fond, en bas de page"
      width="100%"
      height="400"
    />

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
            Oops !
          </h2>
          <p class="text-body-1 mb-4">
            Nous n’avons pas pu charger les informations de votre voyage.
            Il se peut que le lien soit expiré ou incomplet.
          </p>
          <v-btn
            color="primary"
            to="/voyages"
            rounded
          >
            Retourner à la liste des voyages
          </v-btn>
        </v-card>
      </ClientOnly>
    </v-row>
  </v-container>
</template>

<script setup>
import { mdiAlertCircleOutline } from '@mdi/js'

import { useImage } from '#imports'
import { buildVoyageFromSanity, buildVoyageFromAC } from '~/utils/voyageBuilders'

// 🧭 Layout & SEO
definePageMeta({ layout: 'funnel' })
useSeoMeta({
  htmlAttrs: { lang: 'fr' },
  robots: 'noindex, follow',
  canonical: 'https://odysway.com/',
})

const img = useImage()
const route = useRoute()
const { travelTitle } = useFunnelHeader()

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
const sanity = useSanity()
try {
  const { data: pageTextsData } = await useAsyncData('checkout-page-texts', () =>
    sanity.fetch(checkoutTextsQuery),
  )
  pageTexts.value = pageTextsData.value

  imgSrc.value = getImageUrl(pageTexts.value.image_checkout?.asset?._ref || null)
}
catch (err) {
  console.error('Error fetching checkout page texts:', err)
}

// 🚀 2. Build voyage (from AC or Sanity)
const initCheckout = async () => {
  try {
    loading.value = true
    if (bookedId) {
      // ActiveCampaign deal checkout
      const deal = await apiRequest(`/ac/deals/deal-from-bms?bookedId=${bookedId}`)
      if (!deal) throw new Error(`No deal found with bookedId ${bookedId}`)
      dealValues.value = buildDynamicDealValues(deal)
      voyage.value = buildVoyageFromAC(deal, imgSrc.value)
      travelTitle.value = voyage.value?.title || ''
    }
    else if (dateId) {
      // Sanity voyage checkout
      const fetchedDate = await apiRequest(`/booking/date/${dateId}`)
      const bookedSeat = Number(fetchedDate.booked_seat || 0)
      const maxTravelers = Number(fetchedDate.max_traveler ?? fetchedDate.max_travelers ?? 0)
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
        throw new Error(`Date not found for ${voyageSlug || fetchedDate.travel_slug}`)
      }
    }
    else {
      throw new Error('Missing required query parameters')
    }
    loading.value = false
  }
  catch (err) {
    loading.value = false
    console.error('Error building voyage:', err)
    error.value = err.message
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
