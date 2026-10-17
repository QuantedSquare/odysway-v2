<template>
  <v-container
    fluid
    class="py-6"
  >
    <v-row class="align-center mb-4">
      <v-col
        cols="12"
        md="8"
      >
        <h1 class="text-h5 font-weight-bold mb-1">
          Voyages sur-mesure
        </h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Pour creer un voyage sur mesure, s'assurer de le creer dans Sanity et de cocher la case "Voyage sur-mesure".
        </p>
      </v-col>
    </v-row>

    <v-card
      rounded="lg"
      elevation="0"
      class="bo-card mb-4"
    >
      <v-card-text class="pa-3">
        <v-autocomplete
          v-model="search"
          :items="travelesList"
          label="Rechercher un voyage"
          item-title="title"
          item-value="slug"
          clearable
          density="compact"
          hide-details
        />
      </v-card-text>
    </v-card>

    <v-row>
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
        sm="6"
        md="4"
      >
        <v-card
          rounded="lg"
          elevation="0"
          class="bo-card"
          hover
          @click="goToTravel(travel.slug)"
        >
          <v-img
            :src="travel.image || '/images/IMG_20250101_161727_049.jpg'"
            height="140"
            cover
            class="rounded-t-lg"
          >
            <div
              style="position: absolute; bottom: 0; left: 0; right: 0; height: 60px; background: linear-gradient(transparent, rgba(0,0,0,0.4));"
            />
          </v-img>
          <v-card-title class="text-subtitle-1 font-weight-bold py-3 text-center">
            {{ travel.title || travel.slug }}
          </v-card-title>
        </v-card>
      </v-col>
      <v-col
        v-else
        cols="12"
        class="text-center py-12"
      >
        <v-icon
          size="48"
          color="secondary"
          class="mb-3"
        >
          {{ mdiCompassOutline }}
        </v-icon>
        <div class="text-body-2 text-medium-emphasis">
          Aucun voyage sur-mesure trouve.
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { mdiCompassOutline } from '@mdi/js'
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

const _goToAddDate = () => {
  router.push('/booking-management/add-date')
}

const _goToCustomTravels = () => {
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
