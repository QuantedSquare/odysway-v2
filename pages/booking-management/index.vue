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
const travelesList = await queryCollection('voyages').select('slug', 'title', 'image').where('customAvailable', '=', false).all()

definePageMeta({
  layout: 'booking',
  middleware: 'booking-management',
})
const travels = ref([])
const router = useRouter()

const fetchTravels = async () => {
  loading.value = true
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
  const enrichedTravelsDate = travels.value?.map((travel) => {
    const correspondingTravel = travelesList.find(t => t.slug === travel.travel_slug)
    return {
      ...travel,
      image: correspondingTravel?.image?.src,
      title: correspondingTravel?.title,
    }
  })
  if (search.value) {
    return enrichedTravelsDate?.filter(travel => travel.travel_slug.includes(search.value))
  }
  return enrichedTravelsDate
})

onMounted(fetchTravels)
</script>

<style scoped>

</style>
