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
        <p class="text-overline text-primary mb-1">
          Back-office
        </p>
        <h1 class="text-h5 text-md-h4 font-weight-bold mb-1">
          Dossiers de départ
        </h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Assignez un deal ActiveCampaign (pipeline Gestions Départs) à chaque date de voyage.
          Les voyages avec des dates sans dossier apparaissent en premier.
        </p>
      </v-col>
      <v-col
        cols="12"
        md="4"
        class="d-flex justify-end ga-2"
      >
        <v-btn
          variant="tonal"
          :loading="loading"
          @click="fetchDates"
        >
          Rafraîchir
        </v-btn>
      </v-col>
    </v-row>

    <!-- Stats -->
    <v-row class="mb-4">
      <v-col
        cols="6"
        md="3"
      >
        <v-card
          rounded="lg"
          class="glass-surface pa-4 text-center"
          elevation="4"
        >
          <div class="text-h4 font-weight-bold text-warning">
            {{ missingCount }}
          </div>
          <div class="text-caption text-medium-emphasis">
            Sans dossier
          </div>
        </v-card>
      </v-col>
      <v-col
        cols="6"
        md="3"
      >
        <v-card
          rounded="lg"
          class="glass-surface pa-4 text-center"
          elevation="4"
        >
          <div class="text-h4 font-weight-bold text-success">
            {{ assignedCount }}
          </div>
          <div class="text-caption text-medium-emphasis">
            Avec dossier
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-card
      rounded="lg"
      class="mb-4 glass-surface"
      elevation="4"
    >
      <v-card-text>
        <v-row align="center">
          <v-col
            cols="12"
            md="5"
          >
            <v-text-field
              v-model="search"
              label="Rechercher par titre ou slug"
              :prepend-inner-icon="mdiMagnify"
              clearable
              hide-details
              density="comfortable"
            />
          </v-col>
          <v-col
            cols="12"
            md="7"
          >
            <v-chip-group
              v-model="filter"
              selected-class="bg-primary text-white"
              column
            >
              <v-chip
                value="all"
                label
              >
                Toutes
              </v-chip>
              <v-chip
                value="missing"
                label
              >
                Sans dossier
              </v-chip>
              <v-chip
                value="assigned"
                label
              >
                Avec dossier
              </v-chip>
            </v-chip-group>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- List -->
    <div
      v-if="loading"
      class="d-flex justify-center py-12"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        size="48"
      />
    </div>

    <template v-else>
      <v-expansion-panels
        v-model="openPanels"
        multiple
        variant="accordion"
      >
        <v-expansion-panel
          v-for="group in filteredGroups"
          :key="group.slug"
          rounded="lg"
          class="mb-3 glass-surface"
          elevation="4"
        >
          <v-expansion-panel-title class="py-3">
            <div class="d-flex align-center ga-3 w-100">
              <v-avatar
                size="40"
                rounded="lg"
                color="grey-lighten-3"
              >
                <v-img
                  v-if="group.image"
                  :src="group.image"
                  cover
                />
                <v-icon
                  v-else
                  size="24"
                  color="grey"
                >
                  {{ mdiImageOff }}
                </v-icon>
              </v-avatar>
              <div class="flex-grow-1">
                <div class="text-body-1 font-weight-bold">
                  {{ group.title || group.slug }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ group.slug }}
                </div>
              </div>
              <div class="d-flex align-center ga-2 mr-4">
                <v-chip
                  v-if="group.missingCount > 0"
                  color="warning"
                  label
                  size="small"
                >
                  {{ group.missingCount }} sans dossier
                </v-chip>
                <v-chip
                  v-if="group.assignedCount > 0"
                  color="success"
                  label
                  size="small"
                >
                  {{ group.assignedCount }} assigné{{ group.assignedCount > 1 ? 's' : '' }}
                </v-chip>
              </div>
            </div>
          </v-expansion-panel-title>

          <v-expansion-panel-text class="pa-0">
            <v-divider />
            <div
              v-for="date in group.dates"
              :key="date.id"
              class="date-row px-4 py-3"
              :class="{ 'border-warning': !date.departure_id }"
            >
              <v-row align="center">
                <!-- Date + seats -->
                <v-col
                  cols="12"
                  md="3"
                >
                  <NuxtLink
                    :to="`/booking-management/${date.travel_slug}/${date.id}`"
                    class="text-body-2 font-weight-bold d-flex align-center ga-1"
                  >
                    {{ dayjs(date.departure_date).format('DD MMM YYYY') }}
                    <v-icon size="12">
                      {{ mdiArrowRight }}
                    </v-icon>
                  </NuxtLink>
                  <div class="text-caption text-medium-emphasis">
                    <span v-if="date.return_date">retour {{ dayjs(date.return_date).format('DD MMM YYYY') }} · </span>
                    {{ date.booked_seat || 0 }} / {{ date.max_travelers || '?' }} voyageurs
                  </div>
                </v-col>

                <!-- Publication -->
                <v-col
                  cols="12"
                  md="1"
                >
                  <v-chip
                    :color="date.published ? 'green-light' : 'grey'"
                    label
                    size="x-small"
                  >
                    {{ date.published ? 'Publiée' : 'Brouillon' }}
                  </v-chip>
                </v-col>

                <!-- Departure deal -->
                <v-col
                  cols="12"
                  md="8"
                >
                  <div
                    v-if="date.departure_id"
                    class="d-flex align-center ga-2"
                  >
                    <v-chip
                      color="success"
                      label
                      size="small"
                      :prepend-icon="mdiCheckCircle"
                    >
                      Dossier #{{ date.departure_id }}
                    </v-chip>
                    <v-btn
                      :href="`https://odysway90522.activehosted.com/app/deals/${date.departure_id}`"
                      target="_blank"
                      size="x-small"
                      variant="tonal"
                      color="primary"
                      :append-icon="mdiArrowRight"
                    >
                      Voir
                    </v-btn>
                    <v-btn
                      icon
                      size="x-small"
                      color="error"
                      variant="text"
                      :loading="removingId === date.id"
                      @click="onRemove(date)"
                    >
                      <v-icon size="16">
                        {{ mdiDelete }}
                      </v-icon>
                    </v-btn>
                  </div>

                  <v-form
                    v-else
                    @submit.prevent="onAssign(date)"
                  >
                    <div class="d-flex align-center ga-2">
                      <v-text-field
                        v-model="dealUrls[date.id]"
                        label="URL deal AC (dossier de départ)"
                        placeholder="https://…activehosted.com/app/deals/123"
                        density="compact"
                        hide-details
                        class="flex-grow-1"
                      />
                      <v-btn
                        type="submit"
                        color="primary"
                        size="small"
                        :loading="assigningId === date.id"
                        :disabled="assigningId === date.id"
                      >
                        Assigner
                      </v-btn>
                    </div>
                    <v-alert
                      v-if="errors[date.id]"
                      type="error"
                      density="compact"
                      class="mt-1"
                      variant="tonal"
                    >
                      {{ errors[date.id] }}
                    </v-alert>
                  </v-form>
                </v-col>
              </v-row>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <div
        v-if="!filteredGroups.length"
        class="text-center py-12 text-medium-emphasis"
      >
        Aucun voyage correspondant.
      </div>
    </template>
  </v-container>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import dayjs from 'dayjs'
import { mdiMagnify, mdiArrowRight, mdiDelete, mdiCheckCircle, mdiImageOff } from '@mdi/js'
import { bookingApi, getApiErrorMessage } from '~/utils/bookingApi'

definePageMeta({
  layout: 'booking',
  middleware: 'booking-management',
})

const sanity = useSanity()
const voyagesQuery = groq`*[_type == "voyage"]{
  "slug": slug.current,
  title,
  image {
    asset -> { url }
  }
}`
const { data: voyagesList } = await useAsyncData('departuresVoyagesList', () =>
  sanity.fetch(voyagesQuery),
)

const loading = ref(false)
const dates = ref([])
const search = ref('')
const filter = ref('all')
const openPanels = ref([])

// Per-row state
const dealUrls = reactive({})
const assigningId = ref(null)
const removingId = ref(null)
const errors = reactive({})

const fetchDates = async () => {
  loading.value = true
  try {
    dates.value = await bookingApi.getAllDates()
  }
  catch (err) {
    console.error(getApiErrorMessage(err, 'Erreur chargement des dates'))
  }
  finally {
    loading.value = false
  }
}

const missingCount = computed(() => dates.value.filter(d => !d.departure_id).length)
const assignedCount = computed(() => dates.value.filter(d => !!d.departure_id).length)

// Group dates by voyage, merging with Sanity titles/images
const groups = computed(() => {
  const map = new Map()
  for (const date of dates.value) {
    if (!map.has(date.travel_slug)) {
      map.set(date.travel_slug, [])
    }
    map.get(date.travel_slug).push(date)
  }

  return Array.from(map.entries()).map(([slug, slugDates]) => {
    const sanityVoyage = voyagesList.value?.find(v => v.slug === slug)
    const missing = slugDates.filter(d => !d.departure_id).length
    const assigned = slugDates.filter(d => !!d.departure_id).length

    // Sort within group: missing first, then by departure_date asc
    const sortedDates = [...slugDates].sort((a, b) => {
      if (!a.departure_id && b.departure_id) return -1
      if (a.departure_id && !b.departure_id) return 1
      return dayjs(b.departure_date).valueOf() - dayjs(a.departure_date).valueOf()
    })

    return {
      slug,
      title: sanityVoyage?.title || null,
      image: sanityVoyage?.image?.asset?.url || null,
      dates: sortedDates,
      missingCount: missing,
      assignedCount: assigned,
    }
  }).sort((a, b) => {
    // Voyages with missing dates first, then alphabetically by title
    if (a.missingCount > 0 && b.missingCount === 0) return -1
    if (a.missingCount === 0 && b.missingCount > 0) return 1
    return (a.title || a.slug).localeCompare(b.title || b.slug, 'fr')
  })
})

const filteredGroups = computed(() => {
  const query = search.value?.toLowerCase() || ''
  return groups.value.filter((group) => {
    if (query && !group.slug.toLowerCase().includes(query) && !group.title?.toLowerCase().includes(query)) {
      return false
    }
    if (filter.value === 'missing') return group.missingCount > 0
    if (filter.value === 'assigned') return group.assignedCount > 0
    return true
  })
})

// Auto-open panels that have missing dates
// watch(groups, (newGroups) => {
//   openPanels.value = newGroups
//     .map((g, i) => (g.missingCount > 0 ? i : null))
//     .filter(i => i !== null)
// }, { immediate: true })

const onAssign = async (date) => {
  errors[date.id] = ''
  const url = dealUrls[date.id] || ''
  const match = url.match(/deals\/(\d+)$/)
  if (!match) {
    errors[date.id] = 'URL invalide.'
    return
  }
  const dealId = match[1]
  assigningId.value = date.id
  try {
    await bookingApi.assignDepartureDeal(date.travel_slug, date.id, { dealId })
    dealUrls[date.id] = ''
    await fetchDates()
  }
  catch (err) {
    errors[date.id] = getApiErrorMessage(err, 'Erreur lors de l\'assignation.')
  }
  finally {
    assigningId.value = null
  }
}

const onRemove = async (date) => {
  if (!confirm('Retirer le dossier de départ de cette date ?')) return
  removingId.value = date.id
  try {
    await bookingApi.removeDepartureDeal(date.travel_slug, date.id)
    await fetchDates()
  }
  catch (err) {
    console.error(getApiErrorMessage(err, 'Erreur lors de la suppression'))
  }
  finally {
    removingId.value = null
  }
}

onMounted(fetchDates)
</script>

<style scoped>
.date-row {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.date-row:last-child {
  border-bottom: none;
}
.border-warning {
  border-left: 3px solid rgb(var(--v-theme-warning));
}
</style>
