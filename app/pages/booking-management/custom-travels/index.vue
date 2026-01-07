<template>
  <v-container>
    <v-row>
      <v-col
        cols="12"
      >
        <h1>Gestion des voyages sur-mesure</h1>
        <p>
          Pour créer un voyage sur mesure, s'assurer de le créer dans Sanity.
          <br>
          Et de cocher la case "Voyage sur-mesure" dans Sanity.
        </p>
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
        :key="travel.slug"
        cols="12"
        md="4"
      >
        <v-card
          class="mb-4"
          hover
          @click="goToTravel(travel.slug)"
        >
          <v-img
            :src="travel.image || '/images/IMG_20250101_161727_049.jpg'"
            height="100"
            cover
          />
          <v-card-title class="text-h5 py-4 text-center">
            {{ travel.title || travel.slug }}
          </v-card-title>
          <!-- <v-card-text>
            Nombre de dates: {{ travel.nb_dates }}
            <br>
            Nombre de places réservées: {{ travel.booked_seats }}
          </v-card-text> -->
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
import { bookingApi, getApiErrorMessage } from '~/utils/bookingApi'

const search = ref(null)
const loading = ref(false)
const sanity = useSanity()
const travelesListQuery = `*[_type == "voyage" && ('custom' in availabilityTypes)]{
  slug,
  title,
  image {
    asset -> {
      url
    }
  }
}`

const travelesList = ref([])
// const { data: travelesList } = await useAsyncData('travelesList-custom', () =>
//   sanity.fetch(travelesListQuery),
// )

definePageMeta({
  layout: 'booking',
  middleware: 'booking-management',
})
const travels = ref([])
const router = useRouter()

const fetchTravels = async () => {
  loading.value = true
  try {
    const data = await bookingApi.getTravels()
    travels.value = (data || []).filter(travel => travel.is_custom_travel)
    travelesList.value = await sanity.fetch(travelesListQuery)
  }
  catch (err) {
    console.error(getApiErrorMessage(err, 'Erreur chargement'))
    travels.value = []
  }
  finally {
    loading.value = false
  }
}

const goToTravel = (slug) => {
  console.log('goToTravel', slug)
  router.push(`/booking-management/${slug}`)
}

const goToAddDate = () => {
  router.push('/booking-management/add-date')
}

const goToCustomTravels = () => {
  router.push('/booking-management/custom-travels')
}

const filteredTravels = computed(() => {
  const enrichedTravelsDate = travelesList.value.map((travel) => {
    return {
      image: travel?.image?.asset?.url,
      title: travel?.title,
      slug: travel?.slug.current,
    }
  })
  if (search.value) {
    return enrichedTravelsDate?.filter(travel => travel.title.includes(search.value))
  }
  return enrichedTravelsDate
})
onMounted(fetchTravels)
</script>

<style scoped>

</style>
