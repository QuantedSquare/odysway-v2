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
          Gestion des voyages
        </h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Voyages groupe et sur-mesure, avec accès rapide aux dates.
        </p>
      </v-col>
      <v-col
        cols="12"
        md="4"
        class="d-flex justify-end"
      >
        <v-btn
          color="primary"
          variant="flat"
          :prepend-icon="mdiPlus"
          @click="goToAddDate"
        >
          Ajouter une date
        </v-btn>
      </v-col>
    </v-row>

    <!-- Stats -->
    <v-row class="mb-4">
      <v-col
        cols="4"
        md="3"
      >
        <v-card
          rounded="lg"
          elevation="0"
          class="bo-card pa-4"
        >
          <div class="text-h5 font-weight-bold">
            {{ displayedTravels.length }}
          </div>
          <div class="text-caption text-medium-emphasis">
            Voyages
          </div>
        </v-card>
      </v-col>
      <v-col
        cols="4"
        md="3"
      >
        <v-card
          rounded="lg"
          elevation="0"
          class="bo-card pa-4"
        >
          <div class="text-h5 font-weight-bold">
            {{ displayedTravels.reduce((sum, t) => sum + (t.nb_dates || 0), 0) }}
          </div>
          <div class="text-caption text-medium-emphasis">
            Dates
          </div>
        </v-card>
      </v-col>
      <v-col
        cols="4"
        md="3"
      >
        <v-card
          rounded="lg"
          elevation="0"
          class="bo-card pa-4"
        >
          <div class="text-h5 font-weight-bold text-success">
            {{ displayedTravels.reduce((sum, t) => sum + (t.booked_seats || 0), 0) }}
          </div>
          <div class="text-caption text-medium-emphasis">
            Places reservees
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-card
      rounded="lg"
      class="mb-4 bo-card"
      elevation="0"
    >
      <v-card-text class="pa-3">
        <v-row align="center">
          <v-col
            cols="12"
            md="4"
          >
            <v-text-field
              v-model="search"
              label="Rechercher par titre ou slug"
              :prepend-inner-icon="mdiMagnify"
              clearable
              density="compact"
              hide-details
            />
          </v-col>
          <v-spacer />
          <v-col
            cols="12"
            md="4"
            class="d-flex justify-end ga-2"
          >
            <v-btn-toggle
              v-model="tab"
              mandatory
              density="compact"
              variant="outlined"
              divided
              rounded="lg"
              color="primary"
            >
              <v-btn
                value="catalogue"
                size="small"
              >
                Groupe
              </v-btn>
              <v-btn
                value="custom"
                size="small"
              >
                Sur-mesure
              </v-btn>
            </v-btn-toggle>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Data table -->
    <v-card
      rounded="lg"
      class="bo-card"
      elevation="0"
    >
      <v-data-table
        :headers="headers"
        :items="displayedTravels"
        :loading="loading"
        class="elevation-0"
        :items-per-page="50"
        hover
        density="compact"
      >
        <template #item="{ item }">
          <tr
            class="cursor-pointer"
            @click="goToTravel(item.travel_slug)"
          >
            <td>
              <div class="d-flex align-center ga-3 py-1">
                <v-avatar
                  color="surface-variant"
                  size="40"
                  rounded="lg"
                >
                  <v-img
                    v-if="item.image"
                    :src="item.image"
                    cover
                  />
                  <v-icon
                    v-else
                    size="20"
                    color="secondary"
                    :icon="mdiImageOff"
                  />
                </v-avatar>
                <div class="d-flex flex-column">
                  <span class="font-weight-bold text-body-2">{{ item.title || item.travel_slug }}</span>
                  <span class="text-caption text-medium-emphasis">{{ item.travel_slug }}</span>
                </div>
              </div>
            </td>
            <td>
              <v-chip
                :color="item.is_custom_travel ? 'info' : 'primary'"
                size="x-small"
                label
                variant="tonal"
              >
                {{ item.is_custom_travel ? 'Sur-mesure' : 'Groupe' }}
              </v-chip>
            </td>
            <td><span class="font-weight-medium">{{ item.nb_dates || 0 }}</span></td>
            <td><span class="font-weight-medium">{{ item.ongoing_dates > 0 ? item.ongoing_dates : '-' }}</span></td>
            <td><span class="font-weight-medium">{{ item.booked_seats || 0 }}</span></td>
            <td class="text-right">
              <v-btn
                size="small"
                color="primary"
                variant="text"
                @click.stop="goToTravel(item.travel_slug)"
              >
                Ouvrir
              </v-btn>
            </td>
          </tr>
        </template>
        <template #no-data>
          <div class="text-center py-8">
            <v-icon
              size="40"
              color="secondary"
              class="mb-2"
            >
              {{ mdiImageOff }}
            </v-icon>
            <p class="text-body-2 text-medium-emphasis mb-3">
              Aucun voyage trouve
            </p>
            <v-btn
              color="primary"
              variant="tonal"
              size="small"
              @click="goToAddDate"
            >
              Ajouter une date
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { mdiMagnify, mdiImageOff, mdiPlus } from '@mdi/js'
import { bookingApi, getApiErrorMessage } from '~/utils/bookingApi'

const search = ref('')
const loading = ref(false)
const tab = ref('catalogue')
const sortBy = ref('dates_desc')
const sanity = useSanity()

const _tabs = [
  { label: 'Groupe/Individuel', value: 'catalogue' },
  { label: 'Sur-mesure', value: 'custom' },
]

const _sortOptions = [
  { label: 'Plus de dates', value: 'dates_desc' },
  { label: 'Moins de dates', value: 'dates_asc' },
  { label: 'Plus de reservations', value: 'booked_desc' },
]

const travelesListQuery = groq`*[_type == "voyage"]{
  "slug": slug.current,
  title,
  availabilityTypes,
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
  htmlAttrs: { lang: 'fr' },
  robots: 'noindex, follow',
  canonical: 'https://www.odysway.com/',
})

definePageMeta({
  layout: 'booking',
  middleware: 'booking-management',
})

const travels = ref([])
const router = useRouter()

const headers = [
  { title: 'Voyage', key: 'title', sortable: false },
  { title: 'Type', key: 'type', sortable: false },
  { title: 'Dates', key: 'nb_dates', sortable: true },
  { title: 'Dates en cours', key: 'ongoing_dates', sortable: true },
  { title: 'Places réservées', key: 'booked_seats', sortable: true },
  { title: '', key: 'actions', sortable: false },
]

const fetchTravels = async () => {
  loading.value = true
  try {
    travels.value = await bookingApi.getTravels()
  }
  catch (err) {
    console.error(getApiErrorMessage(err, 'Erreur chargement voyages'))
    travels.value = []
  }
  finally {
    loading.value = false
  }
}

const mergedTravels = computed(() => {
  return travelesList.value?.map((travel) => {
    const bookingData = travels.value.find(t => t.travel_slug === travel.slug)
    const isCustom = travel.availabilityTypes?.includes('custom') || bookingData?.is_custom_travel
    return {
      ...bookingData,
      travel_slug: travel.slug,
      image: travel.image?.asset?.url,
      title: travel.title,
      nb_dates: bookingData?.nb_dates || 0,
      ongoing_dates: bookingData?.ongoing_dates ?? null,
      booked_seats: bookingData?.booked_seats || 0,
      is_custom_travel: isCustom,
    }
  }) || []
})

const filteredTravels = computed(() => {
  const query = search.value?.toLowerCase() || ''
  return mergedTravels.value.filter((travel) => {
    const matchesTab = tab.value === 'custom' ? travel.is_custom_travel : !travel.is_custom_travel
    const matchesQuery = query
      ? travel.travel_slug?.toLowerCase().includes(query) || travel.title?.toLowerCase().includes(query)
      : true
    return matchesTab && matchesQuery
  })
})

const displayedTravels = computed(() => {
  const sorted = [...filteredTravels.value]
  if (sortBy.value === 'dates_desc') {
    sorted.sort((a, b) => (b.nb_dates || 0) - (a.nb_dates || 0))
  }
  else if (sortBy.value === 'dates_asc') {
    sorted.sort((a, b) => (a.nb_dates || 0) - (b.nb_dates || 0))
  }
  else if (sortBy.value === 'booked_desc') {
    sorted.sort((a, b) => (b.booked_seats || 0) - (a.booked_seats || 0))
  }
  return sorted
})

const goToTravel = (slug) => {
  router.push(`/booking-management/${slug}`)
}

const goToAddDate = () => {
  router.push('/booking-management/add-date')
}

const _toggleToCustomTravels = () => {
  if (tab.value === 'custom') {
    tab.value = 'catalogue'
  }
  else {
    tab.value = 'custom'
  }
}

onMounted(fetchTravels)
</script>
