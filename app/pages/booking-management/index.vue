<template>
  <v-container
    fluid
    class="py-6 glass-page"
  >
    <v-row class="align-center mb-4">
      <v-col
        cols="12"
        md="8"
      >
        <h1 class="text-h5 text-md-h4 font-weight-bold mb-1">
          Gestion des voyages
        </h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Vue unifiée des voyages catalogue et sur-mesure, avec accès rapide aux dates.
        </p>
      </v-col>
      <v-col
        cols="12"
        md="4"
        class="d-flex justify-end ga-2"
      >
        <v-btn
          variant="text"
          @click="toggleToCustomTravels"
        >
          {{ tab === 'custom' ? 'Voyages groupe/individuel' : 'Voyages sur-mesure' }}
        </v-btn>
        <v-btn
          color="primary"
          @click="goToAddDate"
        >
          + Ajouter une date
        </v-btn>
      </v-col>
    </v-row>

    <v-card
      rounded="lg"
      class="mb-4 glass-surface"
      elevation="8"
    >
      <v-card-text>
        <v-row class="ga-3">
          <v-col
            cols="12"
            md="4"
          >
            <v-text-field
              v-model="search"
              label="Rechercher par titre ou slug"
              :prepend-inner-icon="mdiMagnify"
              clearable
              density="comfortable"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <v-select
              v-model="tab"
              :items="tabs"
              item-title="label"
              item-value="value"
              label="Type de voyage"
              density="comfortable"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <v-select
              v-model="sortBy"
              :items="sortOptions"
              item-title="label"
              item-value="value"
              label="Trier"
              density="comfortable"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card
      rounded="lg"
      class="glass-surface"
      elevation="8"
    >
      <v-data-table
        :headers="headers"
        :items="displayedTravels"
        :loading="loading"
        class="elevation-0"
        :items-per-page="50"
        hover
      >
        <template #item="{ item }">
          <tr
            class="cursor-pointer"
            @click="goToTravel(item.travel_slug)"
          >
            <td>
              <div class="d-flex align-center ga-3">
                <v-avatar
                  color="grey-lighten-2"
                  size="48"
                  rounded="circle"
                >
                  <v-img
                    v-if="item.image"
                    :src="item.image"
                    cover
                  />
                  <v-icon
                    v-else
                    size="48"
                    :icon="mdiImageOff"
                  />
                </v-avatar>
                <div class="d-flex flex-column">
                  <span class="font-weight-bold">{{ item.title || item.travel_slug }}</span>
                  <span class="text-caption text-medium-emphasis">{{ item.travel_slug }}</span>
                </div>
              </div>
            </td>
            <td>
              <v-chip
                :color="item.is_custom_travel ? 'purple' : 'primary'"
                size="small"
                label
              >
                {{ item.is_custom_travel ? 'Sur-mesure' : 'Groupe/Individuel' }}
              </v-chip>
            </td>
            <td><span class="font-weight-medium">{{ item.nb_dates || 0 }}</span></td>
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
          <div class="text-center py-6">
            <p class="text-body-2 text-medium-emphasis mb-2">
              Aucun voyage trouvé
            </p>
            <v-btn
              color="primary"
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
import { mdiMagnify, mdiImageOff } from '@mdi/js'

const search = ref('')
const loading = ref(false)
const tab = ref('catalogue')
const sortBy = ref('dates_desc')
const sanity = useSanity()

const tabs = [
  { label: 'Groupe/Individuel', value: 'catalogue' },
  { label: 'Sur-mesure', value: 'custom' },
]

const sortOptions = [
  { label: 'Plus de dates', value: 'dates_desc' },
  { label: 'Moins de dates', value: 'dates_asc' },
  { label: 'Plus de réservations', value: 'booked_desc' },
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
  { title: 'Places réservées', key: 'booked_seats', sortable: true },
  { title: '', key: 'actions', sortable: false },
]

const fetchTravels = async () => {
  loading.value = true
  const res = await fetch('/api/v1/booking/travels')
  const data = await res.json()
  travels.value = data
  loading.value = false
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

const toggleToCustomTravels = () => {
  if (tab.value === 'custom') {
    tab.value = 'catalogue'
  }
  else {
    tab.value = 'custom'
  }
}

onMounted(fetchTravels)
</script>
