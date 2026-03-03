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
          Les dates sans dossier apparaissent en premier.
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
            md="4"
          >
            <v-text-field
              v-model="search"
              label="Rechercher par slug"
              :prepend-inner-icon="mdiMagnify"
              clearable
              hide-details
              density="comfortable"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
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
          <v-col
            cols="12"
            md="4"
          >
            <v-chip-group
              v-model="timeframe"
              selected-class="bg-primary text-white"
              column
            >
              <v-chip
                value="upcoming"
                label
              >
                À venir
              </v-chip>
              <v-chip
                value="all"
                label
              >
                Toutes dates
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
      <div
        v-for="date in filteredDates"
        :key="date.id"
        class="mb-3"
      >
        <v-card
          rounded="lg"
          class="glass-surface"
          elevation="4"
          :class="{ 'border-warning': !date.departure_id }"
        >
          <v-card-text class="py-3">
            <v-row align="center">
              <!-- Left: voyage info -->
              <v-col
                cols="12"
                md="4"
              >
                <div class="d-flex align-center ga-3">
                  <v-icon
                    :color="date.departure_id ? 'success' : 'warning'"
                    size="22"
                  >
                    {{ mdiAirplaneTakeoff }}
                  </v-icon>
                  <div>
                    <NuxtLink
                      :to="`/booking-management/${date.travel_slug}/${date.id}`"
                      class="text-body-2 font-weight-bold"
                    >
                      {{ date.travel_slug }}
                    </NuxtLink>
                    <div class="text-caption text-medium-emphasis">
                      {{ dayjs(date.departure_date).format('DD MMM YYYY') }}
                      <span v-if="date.return_date"> → {{ dayjs(date.return_date).format('DD MMM YYYY') }}</span>
                    </div>
                  </div>
                </div>
              </v-col>

              <!-- Middle: status + seats -->
              <v-col
                cols="12"
                md="2"
              >
                <v-chip
                  :color="date.published ? 'green-light' : 'warning'"
                  label
                  size="x-small"
                  class="mr-2"
                >
                  {{ date.published ? 'Publiée' : 'Non publiée' }}
                </v-chip>
                <div class="text-caption text-medium-emphasis mt-1">
                  {{ date.booked_seat || 0 }} / {{ date.max_travelers || '?' }} voyageurs
                </div>
              </v-col>

              <!-- Right: departure_id or assign form -->
              <v-col
                cols="12"
                md="6"
              >
                <!-- Has departure deal -->
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

                <!-- No departure deal: inline assign form -->
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
          </v-card-text>
        </v-card>
      </div>

      <div
        v-if="!filteredDates.length"
        class="text-center py-12 text-medium-emphasis"
      >
        Aucune date correspondante.
      </div>
    </template>
  </v-container>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import dayjs from 'dayjs'
import { mdiMagnify, mdiAirplaneTakeoff, mdiArrowRight, mdiDelete, mdiCheckCircle } from '@mdi/js'
import { bookingApi, getApiErrorMessage } from '~/utils/bookingApi'

definePageMeta({
  layout: 'booking',
  middleware: 'booking-management',
})

const loading = ref(false)
const dates = ref([])
const search = ref('')
const filter = ref('all')
const timeframe = ref('upcoming')

// Per-row state
const dealUrls = reactive({})
const assigningId = ref(null)
const removingId = ref(null)
const errors = reactive({})

const fetchDates = async () => {
  loading.value = true
  try {
    const all = await bookingApi.getAllDates()
    // Sort: missing departure_id first, then by departure_date asc
    dates.value = [...all].sort((a, b) => {
      if (!a.departure_id && b.departure_id) return -1
      if (a.departure_id && !b.departure_id) return 1
      return dayjs(a.departure_date).valueOf() - dayjs(b.departure_date).valueOf()
    })
  }
  catch (err) {
    console.error(getApiErrorMessage(err, 'Erreur chargement des dates'))
  }
  finally {
    loading.value = false
  }
}

const filteredDates = computed(() => {
  const today = dayjs().startOf('day')
  return dates.value.filter((d) => {
    if (timeframe.value === 'upcoming' && !dayjs(d.departure_date).isAfter(today)) return false
    if (filter.value === 'missing' && d.departure_id) return false
    if (filter.value === 'assigned' && !d.departure_id) return false
    if (search.value) {
      return d.travel_slug?.toLowerCase().includes(search.value.toLowerCase())
    }
    return true
  })
})

const missingCount = computed(() => dates.value.filter(d => !d.departure_id).length)
const assignedCount = computed(() => dates.value.filter(d => !!d.departure_id).length)

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
.border-warning {
  border-left: 3px solid rgb(var(--v-theme-warning));
}
</style>
