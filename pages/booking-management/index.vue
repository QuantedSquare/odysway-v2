<template>
  <v-container>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <h1>Gestion des voyages</h1>
        <p>
          Gérer les voyages et les dates associées. Ne sont affichés que les voyages possédant au minimum une date.
        </p>
      </v-col>
      <v-col
        cols="3"
        class="d-flex justify-end align-start"
      />
      <v-col
        cols="3"
        class="d-flex flex-column ga-2 justify-end align-right"
      >
        <v-btn @click="goToAddDate">
          + Ajouter une date
        </v-btn>
        <v-btn
          color="secondary"
          @click="goToCustomTravels"
        >
          Voyages Custom
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-autocomplete
          v-model="search"
          :items="travelesList"
          label="Rechercher un voyage"
          item-title="title"
          item-value="slug"
          clearable
        />
      </v-col>
      <v-col
        v-if="loading"
        cols="12"
        md="4"
      >
        <v-skeleton-loader type="card" />
      </v-col>
      <v-col
        v-for="travel in filteredTravels"
        v-else-if="filteredTravels.length > 0"
        :key="travel.travel_slug"
        cols="12"
        md="4"
      >
        <v-card
          class="mb-4"
          hover
          @click="goToTravel(travel.travel_slug)"
        >
          <v-img
            v-if="travel.image"
            :src="travel.image"
            height="100"
            cover
          />
          <v-card-title class="text-h5">
            {{ travel.title || travel.travel_slug }}
          </v-card-title>
          <v-card-text>
            Nombre de dates: {{ travel.nb_dates }}
            <br>
            Nombre de places réservées: {{ travel.booked_seats }}
          </v-card-text>
        </v-card>
      </v-col>
      <v-col
        v-else
        cols="12"
      >
        <v-alert color="secondary">
          Aucun voyage trouvé
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const search = ref(null)
const loading = ref(false)
const sanity = useSanity()
const travelesListQuery = groq`*[_type == "voyage" && customAvailable == false]{
  "slug": slug.current,
  title,
  image {
    asset -> {
      url
    }
  }
}`
const { data: travelesList } = await useAsyncData('travelesList', () =>
  sanity.fetch(travelesListQuery),
)
useSeoMeta({
  htmlAttrs: {
    lang: 'fr',
  },
  robots: 'noindex, follow',
  canonical: 'https://www.odysway.com/',
})
definePageMeta({
  layout: 'booking',
  middleware: 'booking-management',
})
const travels = ref([])
const router = useRouter()

const fetchTravels = async () => {
  loading.value = true
  console.log('fetching...')
  const res = await fetch('/api/v1/booking/travels')
  const data = await res.json()
  travels.value = data.filter(travel => !travel.is_custom_travel)
  loading.value = false
}

const goToTravel = (slug) => {
  router.push(`/booking-management/${slug}`)
}

const goToAddDate = () => {
  router.push('/booking-management/add-date')
}

const goToCustomTravels = () => {
  router.push('/booking-management/custom-travels')
}

const filteredTravels = computed(() => {
  // Merge travelesList (all possible travels) with booking data from travels.value
  return travelesList.value?.map((travel) => {
    const bookingData = travels.value.find(t => t.travel_slug === travel.slug)
    return {
      ...bookingData,
      travel_slug: travel.slug,
      image: travel.image?.asset?.url,
      title: travel.title,
      nb_dates: bookingData?.nb_dates || 0,
      booked_seats: bookingData?.booked_seats || 0,
    }
  }).filter((travel) => {
    if (search.value) {
      return travel.travel_slug.includes(search.value)
    }
    return true
  })
})

onMounted(fetchTravels)
</script>

<style scoped>

</style>
