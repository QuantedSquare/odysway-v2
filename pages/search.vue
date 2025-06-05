<template>
  <v-container
    class="py-0 my-0"
    fluid
  >
    <SearchHeroSection :destination="fetchedDestination">
      <SearchField />
    </SearchHeroSection>
    <v-container class="pt-10 pt-md-16">
      <v-row>
        <v-col
          cols=""
          md="auto"
          class="d-flex align-center"
        >
          <span class="text-primary text-h3 font-weight-bold mr-5">{{ nbVoyages === 1 ? '1 voyage' : `${nbVoyages}
            voyages` }}</span>
        </v-col>
        <v-col
          cols=""
          md="auto"
          class="d-flex align-center ga-2"
        >
          <!-- Add closable props & logic -->
          <v-chip
            v-if="routeQuery.destination"
            variant="flat"
            :size="lgAndUp ? 'x-large' : 'large'"
            color="secondary-light-2"
            density="comfortable"
          >
            <span class="d-flex align-center text-white text-caption text-sm-subtitle-1 px-3 pb-1">
              {{ capitalizeFirstLetter(routeQuery.destination) }}
            </span>
          </v-chip>
          <!-- Add closable props & logic -->

          <v-chip
            v-if="routeQuery.travelType"
            variant="flat"
            :size="lgAndUp ? 'x-large' : 'large'"
            color="secondary-light-2"
            density="comfortable"
            @click:close="chip = false"
          >
            <span class="d-flex align-center text-white text-caption text-sm-subtitle-1 px-3 pb-1">
              {{ routeQuery.travelType }}
            </span>
          </v-chip>
          <!-- Add closable props & logic -->

          <v-chip
            v-if="routeQuery.from"
            variant="flat"
            :size="lgAndUp ? 'x-large' : 'large'"
            color="secondary-light-2"
            density="comfortable"
          >
            <span class="d-flex align-center text-white text-caption text-sm-subtitle-1 px-3 pb-1">
              {{ parsedDates }}
            </span>
          </v-chip>
        </v-col>
        <v-spacer />
        <v-col
          v-if="route.fullPath !== '/search'"
          cols=""
          md="auto"
          class="d-flex justify-end"
        >
          <v-btn
            color="primary"
            variant="outlined"
            size="large"
            class="text-subtitle-2"
            @click="reinitiliazeFilter"
          >
            Réinitialiser
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          v-if="limitedVoyages?.length > 0"
          cols="12"
        >
          <v-row>
            <v-col
              v-for="voyage in limitedVoyages"
              :key="voyage.id"
              cols="12"
              sm="6"
              lg="4"
              xl="3"
            >
              <CtaColCard v-if="voyage.isCta" />
              <!-- TODO : refactor voyage card -->
              <VoyageCard
                v-else
                :voyage="voyage"
              />
            </v-col>
          </v-row>
        </v-col>
        <v-col
          v-else
          cols="12"
        >
          <p class="text-body-1">
            Modifiez vos critères de recherche
          </p>
        </v-col>
      </v-row>
      <v-row
        v-if="voyagesWithCta.length > 9"
        justify="center"
        align="center"
        class="flex-column my-10"
      >
        <span class="text-h6 text-secondary">Voir {{ isExpanded ? 'moins' : 'plus' }}</span>
        <BouncingBtn
          v-model="isExpanded"
          class="text-secondary"
        />
      </v-row>
    </v-container>
    <!-- <v-container>
      <v-row>
        <ContentRenderer
          v-if="fetchedDestinationContentStatus === 'success' && fetchedDestinationContent"
          :value="fetchedDestinationContent"
        />
      </v-row>
    </v-container> -->
    <ColorContainer color="grey-light-2">
      <InfoContainer>
        <template #top>
          <AvatarsRowStack />
        </template>
        <template #title>
          Vous hésitez encore ?
        </template>
        <template #description>
          Prenez un RDV avec un spécialiste qui vous conseillera selon vos envies.
        </template>
        <template #bottom>
          <CtaButton
            color="secondary"
            link="/calendly"
          >
            <template #text>
              Prendre RDV
            </template>
          </CtaButton>
        </template>
      </InfoContainer>
    </ColorContainer>
  </v-container>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import SearchField from '~/components/content/SearchField.vue'

const { lgAndUp } = useDisplay()
useSeoMeta({
  robots: 'noindex, follow',
  canonical: 'https://www.odysway.com/search',
})
const router = useRouter()
const route = useRoute()
const routeQuery = computed(() => route.query)
const isExpanded = ref(false)

const { data: fetchedDestination } = useAsyncData('fetchedDestination', () => {
  if (route.query.destination) {
    return queryCollection('destinations').where('stem', '=', `destinations/${route.query.destination}/${route.query.destination}`).where('published', '=', true).select('titre', 'interjection', 'image').first()
  }
  return null
}, {
  watch: [routeQuery],
})

// const { data: fetchedDestinationContent, status: fetchedDestinationContentStatus } = useAsyncData('fetchedDestinationContent', () => {
//   if (route.query.destination) {
//     return queryCollection('destinationsContent').where('stem', 'LIKE', `destinations/${route.query.destination}/%`).where('published', '=', true).first()
//   }
//   return null
// }, {
//   watch: [routeQuery],

// })
// provide('page', fetchedDestinationContent)

const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const monthNumberToFrench = [
  '', // 0 index unused
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

const parsedDates = computed(() => {
  if (!routeQuery.value.from) return ''
  const monthNumbers = routeQuery.value.from.split(',').map(Number).filter(n => n > 0 && n <= 12)
  if (monthNumbers.length === 0) return ''
  const monthNames = monthNumbers.map(n => monthNumberToFrench[n])
  return monthNames.join(' - ')
})

function filterByDestination(voyages, destination) {
  if (!destination) return voyages
  return voyages.filter(v => v.destinations?.some(d => d.name.includes(destination)))
}

function filterByType(voyages, travelType) {
  if (!travelType) return voyages
  const groupeType = travelType === 'Voyage en groupe'
  return voyages.filter(v => v.groupeAvailable === groupeType && v.monthlyAvailability?.length > 0)
}

function filterByDate(voyages, fromList) {
  if (!fromList) return voyages
  const monthNumbers = fromList.split(',').map(Number).filter(n => n > 0 && n <= 12)
  if (monthNumbers.length === 0) return voyages
  const monthNames = monthNumbers.map(n => monthNumberToFrench[n])
  return voyages.filter(v =>
    v.monthlyAvailability?.some(m => monthNames.includes(m.month)),
  )
}

const { data: voyages } = useAsyncData(
  `search-${JSON.stringify(route.query)}`,
  async () => {
    let destination = null
    if (route.query.destination) {
      const { titre } = await queryCollection('destinations')
        .where('stem', '=', `destinations/${route.query.destination}/${route.query.destination}`)
        .where('published', '=', true)
        .select('titre')
        .first()
      destination = titre
    }

    const travelType = route.query.travelType || null
    const fromList = route.query.from || null

    let voyages = await queryCollection('voyages').where('published', '=', true).all()

    voyages = filterByDestination(voyages, destination)
    voyages = filterByType(voyages, travelType)
    voyages = filterByDate(voyages, fromList)

    return voyages
  },
  { watch: [routeQuery] },
)

const nbVoyages = computed(() => {
  return voyages.value?.length || 0
})

const voyagesWithCta = computed(() => {
  const original = voyages.value || []
  const result = [...original]
  const cta = { id: 'cta', isCta: true }

  if (original.length >= 2) {
    result.splice(2, 0, cta)
  }
  else {
    result.push(cta)
  }

  return result
})

const limitedVoyages = computed(() => {
  return voyagesWithCta.value.slice(0, isExpanded.value ? voyagesWithCta.value.length : 9)
})

function reinitiliazeFilter() {
  router.push({
    path: '/search',
    query: null,
  })
}
</script>
