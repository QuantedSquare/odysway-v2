<template>
  <div>
    <BoPageHeader
      title="Dossiers de départ"
      subtitle="Assignez un deal ActiveCampaign (pipeline Gestions Départs) à chaque date de voyage."
      :crumbs="[{ title: 'Backoffice', to: '/booking-management' }, { title: 'Gestion départs' }]"
    >
      <template #actions>
        <v-btn
          :loading="loading"
          @click="fetchDates"
        >
          Rafraîchir
        </v-btn>
      </template>
    </BoPageHeader>

    <div class="bo-well">
      <section class="bo-stats">
        <div class="bo-stat">
          <div class="bo-stat__k">
            Sans dossier
          </div>
          <div
            class="bo-stat__v"
            :style="missingCount ? 'color: var(--bo-warn);' : ''"
          >
            {{ missingCount }}
          </div>
          <div class="bo-stat__n">
            dates à traiter
          </div>
        </div>
        <div class="bo-stat">
          <div class="bo-stat__k">
            Avec dossier
          </div>
          <div class="bo-stat__v">
            {{ assignedCount }}
          </div>
          <div class="bo-stat__n">
            dossiers liés
          </div>
        </div>
        <div class="bo-stat">
          <div class="bo-stat__k">
            Total dates
          </div>
          <div class="bo-stat__v">
            {{ dates.length }}
          </div>
          <div class="bo-stat__n">
            départs à venir
          </div>
        </div>
      </section>

      <div class="bo-row">
        <v-text-field
          v-model="search"
          :prepend-inner-icon="mdiMagnify"
          placeholder="Rechercher un titre ou un slug…"
          aria-label="Rechercher un voyage"
          clearable
          style="max-width: 320px;"
        />
        <v-btn-toggle
          v-model="filter"
          mandatory
          class="bo-seg"
          density="compact"
        >
          <v-btn value="all">
            Toutes
          </v-btn>
          <v-btn value="missing">
            Sans dossier <span class="bo-seg__n">{{ missingCount }}</span>
          </v-btn>
          <v-btn value="assigned">
            Avec dossier <span class="bo-seg__n">{{ assignedCount }}</span>
          </v-btn>
        </v-btn-toggle>
      </div>

      <div
        v-if="loading"
        class="d-flex justify-center py-12"
      >
        <v-progress-circular
          indeterminate
          color="primary"
          size="40"
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
            class="mb-3 bo-card"
            elevation="0"
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
                  <span
                    v-if="group.missingCount > 0"
                    class="bo-tag bo-tag--warn"
                  >
                    <span class="bo-dot" />{{ group.missingCount }} sans dossier
                  </span>
                  <span
                    v-if="group.assignedCount > 0"
                    class="bo-tag bo-tag--ok"
                  >
                    {{ group.assignedCount }} assigné{{ group.assignedCount > 1 ? 's' : '' }}
                  </span>
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
                      class="bo-num font-weight-bold d-flex align-center ga-1"
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
                    <span
                      class="bo-tag"
                      :class="date.published ? 'bo-tag--ok' : 'bo-tag--warn'"
                    >
                      <span class="bo-dot" />{{ date.published ? 'Publiée' : 'Brouillon' }}
                    </span>
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
                      <span class="bo-tag bo-tag--ok">
                        <span class="bo-dot" />Dossier #{{ date.departure_id }}
                      </span>
                      <v-btn
                        :href="`https://odysway90522.activehosted.com/app/deals/${date.departure_id}`"
                        target="_blank"
                        variant="text"
                      >
                        Ouvrir ↗
                      </v-btn>
                      <v-btn
                        :icon="mdiDelete"
                        variant="text"
                        density="comfortable"
                        color="error"
                        aria-label="Détacher le dossier de départ"
                        :loading="removingId === date.id"
                        @click="onRemove(date)"
                      />
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
          class="bo-card bo-empty"
        >
          Aucun voyage correspondant.
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import dayjs from 'dayjs'
import { mdiMagnify, mdiArrowRight, mdiDelete, mdiImageOff } from '@mdi/js'
import BoPageHeader from '~/components/booking/BoPageHeader.vue'
import { bookingApi, getApiErrorMessage } from '~/utils/bookingApi'

definePageMeta({
  layout: 'booking',
  middleware: 'booking-management',
})

const { confirmAction, toast } = useBoDialogs()

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
      return dayjs(a.departure_date).valueOf() - dayjs(b.departure_date).valueOf()
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
  const ok = await confirmAction({
    title: 'Détacher le dossier de départ ?',
    message: `Le deal AC #${date.departure_id} ne sera plus lié au départ du ${dayjs(date.departure_date).format('DD/MM/YYYY')}.`,
    confirmLabel: 'Détacher',
    tone: 'danger',
  })
  if (!ok) return

  removingId.value = date.id
  try {
    await bookingApi.removeDepartureDeal(date.travel_slug, date.id)
    toast('Dossier de départ détaché.', 'ok')
    await fetchDates()
  }
  catch (err) {
    toast(getApiErrorMessage(err, 'Erreur lors de la suppression'), 'crit')
  }
  finally {
    removingId.value = null
  }
}

onMounted(fetchDates)
</script>

<style scoped>
.date-row {
  border-bottom: 1px solid var(--bo-line-soft);
}

.date-row:last-child {
  border-bottom: none;
}

/* Une date sans dossier de départ est la seule chose à traiter ici. */
.border-warning {
  box-shadow: inset 3px 0 0 var(--bo-warn);
}
</style>
