<template>
  <v-container>
    <v-row
      justify="center"
      class="text-center"
    >
      <v-col
        v-if="status === 'success' && voyage"
        cols="12"
        xl="10"
      >
        <v-row
          justify="center"
          align="center"
        >
          <v-col
            v-if="voyage"
            cols="12"
          >
            <SanityImage
              v-if="voyage.image?.asset"
              :asset-id="voyage.image.asset._ref"
              auto="format"
            >
              <template #default="{ src }">
                <v-img
                  rounded="xl"
                  class="d-flex align-end"
                  :src="src"
                  :alt="voyage.image.alt || voyage.title"
                  :height="mdAndUp ? '348px' : '250px'"
                  cover
                >
                  <div class="d-flex align-center justify-center ">
                    <h3
                      v-if="voyage"
                      class="text-white  text-h3 pa-10 text-shadow"
                    >
                      {{ voyage.title }}
                    </h3>
                  </div>
                </v-img>
              </template>
            </SanityImage>
          </v-col>
          <v-col
            cols="12"
            sm="6"
            md="9"
          >
            <div>
              <slot
                v-if="isOption"
                name="title_option"
              />
              <slot
                v-else
                name="title_default"
              />
            </div>
          </v-col>
        </v-row>
        <v-row

          class="mt-8"
        >
          <v-col cols="12">
            <slot
              v-if="isOption"
              name="accroche_option"
            />
            <slot
              v-else-if="isDevis"
              name="accroche_devis"
            />
            <slot
              v-else
              name="accroche_default"
            />
          </v-col>
        </v-row>
        <v-row justify="center">
          <v-col
            cols="auto"
            class="mt-8"
          >
            <v-btn-secondary
              to="/thematiques"
              nuxt
              size="x-large"
              class="text-decoration-none"
            >
              Retour aux voyages
            </v-btn-secondary>
          </v-col>
        </v-row>
      </v-col>
      <v-col
        v-else-if="status === 'pending'"
        cols="12"
      >
        <v-skeleton-loader type="card" />
      </v-col>
      <v-col
        v-else
        cols="12"
        class="d-flex flex-column justify-center align-center ga-2"
      >
        <h3 v-if="voyage">
          {{ voyage.title }}
        </h3>
        <slot
          name="error"
        />
        <v-btn-secondary
          to="/"
          nuxt
          size="x-large"
        >
          Retour aux voyages
        </v-btn-secondary>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const route = useRoute()
const { trackPurchase } = useGtmTracking()

const isOption = ref(route.query.isoption === 'true')
const isDevis = ref(route.query.devis === 'true')

// Enhanced voyage query with all fields needed for GTM tracking
const voyageQuery = groq`*[_type == "voyage" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  image,
  "destinations": destinations[]-> {
    _id,
    title
  },
  "experienceType": experienceType-> {
    _id,
    title
  },
  "categories": categories[]-> {
    _id,
    title
  },
  monthlyAvailability,
  availabilityTypes,
  pricing {
    startingPrice,
    pricePerPerson
  },
  startingPrice,
  promoChildren,
  indivRoomPrice
}`

const voyageSlugRef = computed(() => route.query.voyage)
const { data: voyage, status } = await useSanityQuery(
  voyageQuery,
  { slug: voyageSlugRef },
)

const { mdAndUp } = useDisplay()

onMounted(async () => {
  // Track purchase event for GTM
  if (route.query.purchase === 'true' && route.query.booked_id && !isOption.value) {
    const sessionKey = `gtm_tracked_${route.query.booked_id}`
    const alreadyTracked = sessionStorage.getItem(sessionKey)

    if (!alreadyTracked) {
      try {
        // Fetch purchase data from API
        const purchaseData = await $fetch(`/api/v1/booking/purchase-data?booked_id=${route.query.booked_id}`)

        if (!purchaseData.isOption && purchaseData.shouldTrack && voyage.value) {
          // Mark as tracked in sessionStorage to prevent re-fire on page refresh
          sessionStorage.setItem(sessionKey, '1')
          // Track GTM purchase event
          trackPurchase({
            transactionId: purchaseData.transactionId,
            paymentType: purchaseData.paymentType,
            totalValue: purchaseData.totalValue,
            optinNewsletter: purchaseData.optinNewsletter,
            userData: purchaseData.userData,
            voyage: voyage.value,
            dynamicDealValues: purchaseData.dynamicDealValues,
          })
        }
      }
      catch (error) {
        console.error('Error tracking purchase:', error)
      }
    }
  }

  if (!route.query.isoption && localStorage.getItem('consent') === 'granted') {
    if (route.query.purchase === 'true') {
      setTimeout(() => {
        // #TODO: add code to track GTM event
      }, 100)
    }
  }
})
</script>

<style scoped>
.position-absolute{
  position:absolute;
  bottom: 0;
}

.position-relative {
  position: relative;
}
</style>
