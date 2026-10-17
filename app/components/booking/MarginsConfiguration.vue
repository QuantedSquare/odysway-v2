<template>
  <div>
    <p class="text-body-2 text-medium-emphasis mb-4">
      Les marges se configurent par ann&eacute;e de d&eacute;part. S&eacute;lectionne l'ann&eacute;e pour voir ce qu'il reste &agrave; param&eacute;trer : un voyage pr&ecirc;t pour {{ currentYear }} peut ne rien avoir pour {{ currentYear + 1 }}.
    </p>

    <!-- Year selector -->
    <div class="d-flex align-center ga-3 mb-4 flex-wrap">
      <v-btn-toggle
        v-model="activeYear"
        color="primary"
        density="compact"
        mandatory
        variant="outlined"
      >
        <v-btn
          v-for="y in availableYears"
          :key="y"
          :value="y"
        >
          {{ y }}
        </v-btn>
      </v-btn-toggle>
      <v-progress-circular
        v-if="loading"
        indeterminate
        size="20"
        color="primary"
      />
    </div>

    <!-- Stats -->
    <v-row class="mb-4">
      <v-col
        cols="6"
        md="3"
      >
        <v-card
          rounded="lg"
          class="bo-card bo-stat-card pa-4"
          elevation="0"
          style="border-left-color: rgb(var(--v-theme-error));"
        >
          <div class="text-h5 font-weight-bold text-error">
            {{ counts.unconfigured }}
          </div>
          <div class="text-caption text-medium-emphasis">
            Non configur&eacute;s en {{ activeYear }}
          </div>
        </v-card>
      </v-col>
      <v-col
        cols="6"
        md="3"
      >
        <v-card
          rounded="lg"
          class="bo-card bo-stat-card pa-4"
          elevation="0"
          style="border-left-color: rgb(var(--v-theme-warning));"
        >
          <div class="text-h5 font-weight-bold text-warning">
            {{ counts.partial }}
          </div>
          <div class="text-caption text-medium-emphasis">
            Incomplets
          </div>
        </v-card>
      </v-col>
      <v-col
        cols="6"
        md="3"
      >
        <v-card
          rounded="lg"
          class="bo-card bo-stat-card pa-4"
          elevation="0"
          style="border-left-color: rgb(var(--v-theme-success));"
        >
          <div class="text-h5 font-weight-bold text-success">
            {{ counts.configured }}
          </div>
          <div class="text-caption text-medium-emphasis">
            Configur&eacute;s
          </div>
        </v-card>
      </v-col>
      <v-col
        cols="6"
        md="3"
      >
        <v-card
          rounded="lg"
          class="bo-card bo-stat-card pa-4"
          elevation="0"
          style="border-left-color: rgb(var(--v-theme-primary));"
        >
          <div class="text-h5 font-weight-bold">
            {{ visibleVoyages.length }}
          </div>
          <div class="text-caption text-medium-emphasis">
            Voyages list&eacute;s
            <span v-if="hideWithoutDates && withoutDatesCount"> · {{ withoutDatesCount }} masqu&eacute;s</span>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters -->
    <div class="d-flex align-center ga-3 mb-4 flex-wrap">
      <v-text-field
        v-model="search"
        label="Rechercher par titre ou slug"
        :prepend-inner-icon="mdiMagnify"
        clearable
        hide-details
        density="compact"
        style="max-width: 320px;"
      />
      <v-chip-group
        v-model="filter"
        selected-class="bg-primary text-white"
      >
        <v-chip
          value="all"
          label
          size="small"
        >
          Tous
        </v-chip>
        <v-chip
          value="unconfigured"
          label
          size="small"
        >
          Non configur&eacute;s
        </v-chip>
        <v-chip
          value="partial"
          label
          size="small"
        >
          Incomplets
        </v-chip>
        <v-chip
          value="configured"
          label
          size="small"
        >
          Configur&eacute;s
        </v-chip>
        <v-chip
          value="excluded"
          label
          size="small"
        >
          Exclus
        </v-chip>
      </v-chip-group>
      <v-spacer />
      <v-switch
        v-model="hideWithoutDates"
        :label="`Masquer les voyages sans départ en ${activeYear}`"
        color="primary"
        density="compact"
        hide-details
      />
    </div>

    <!-- List -->
    <div
      v-if="loading && !marginStatus.length"
      class="d-flex justify-center py-12"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        size="48"
      />
    </div>

    <template v-else>
      <v-card
        v-for="voyage in filteredVoyages"
        :key="voyage.slug"
        rounded="lg"
        class="bo-card mb-2"
        elevation="0"
      >
        <div class="d-flex align-center ga-3 pa-3">
          <NuxtLink
            :to="`/booking-management/margins/${voyage.slug}?year=${activeYear}`"
            class="d-flex align-center ga-3 flex-grow-1 text-decoration-none"
            style="color: inherit; min-width: 0;"
          >
            <v-avatar
              size="40"
              rounded="lg"
              color="grey-lighten-3"
            >
              <v-img
                v-if="voyage.image"
                :src="voyage.image"
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
            <div class="flex-grow-1 text-truncate">
              <div class="text-body-1 font-weight-bold text-truncate">
                {{ voyage.title || voyage.slug }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ voyage.slug }} · {{ voyage.dates_total }} d&eacute;part{{ voyage.dates_total > 1 ? 's' : '' }} en {{ activeYear }}
              </div>
            </div>
          </NuxtLink>

          <!-- Status -->
          <v-chip
            :color="STATUS_META[voyage.status].color"
            label
            size="small"
            variant="tonal"
            :prepend-icon="STATUS_META[voyage.status].icon"
          >
            {{ voyage.status_detail || STATUS_META[voyage.status].label }}
          </v-chip>

          <!-- Config mode, editable in place -->
          <v-menu>
            <template #activator="{ props: menuProps }">
              <v-chip
                v-bind="menuProps"
                label
                size="small"
                variant="outlined"
                :append-icon="mdiMenuDown"
              >
                {{ modeLabel(voyage) }}
              </v-chip>
            </template>
            <v-list density="compact">
              <v-list-item
                v-for="item in CONFIG_MODE_ITEMS"
                :key="item.value"
                :active="voyage.config_mode === item.value"
                @click="setMode(voyage, item.value)"
              >
                <v-list-item-title>{{ item.title }}</v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  {{ item.hint }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-menu>

          <NuxtLink
            :to="`/booking-management/margins/${voyage.slug}?year=${activeYear}`"
            class="d-flex align-center"
            style="color: inherit;"
          >
            <v-icon size="16">
              {{ mdiArrowRight }}
            </v-icon>
          </NuxtLink>
        </div>
      </v-card>

      <div
        v-if="!filteredVoyages.length"
        class="text-center py-12 text-medium-emphasis"
      >
        Aucun voyage correspondant.
      </div>
    </template>

    <v-alert
      v-if="error"
      type="error"
      density="compact"
      variant="tonal"
      class="mt-3"
    >
      {{ error }}
    </v-alert>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { mdiMagnify, mdiArrowRight, mdiCheckCircle, mdiImageOff, mdiAlertCircleOutline, mdiAlertOutline, mdiMinusCircleOutline, mdiMenuDown } from '@mdi/js'
import { bookingApi, getApiErrorMessage } from '~/utils/bookingApi'

const props = defineProps({
  voyagesList: { type: Array, default: () => [] },
})

const STATUS_META = {
  configured: { label: 'Configuré', color: 'success', icon: mdiCheckCircle },
  partial: { label: 'Incomplet', color: 'warning', icon: mdiAlertOutline },
  unconfigured: { label: 'Non configuré', color: 'error', icon: mdiAlertCircleOutline },
  excluded: { label: 'Exclu', color: 'grey', icon: mdiMinusCircleOutline },
}

const CONFIG_MODE_ITEMS = [
  { value: 'pax_table', title: 'Tableau PAX', hint: 'Marge par palier de voyageurs' },
  { value: 'per_date', title: 'Marge fixe / date', hint: 'Override saisi départ par départ' },
  { value: 'excluded', title: 'Exclu du suivi', hint: 'Jamais compté comme non configuré' },
]

const currentYear = new Date().getFullYear()

const loading = ref(false)
const error = ref('')
const marginStatus = ref([])
const availableYears = ref([currentYear, currentYear + 1])
const activeYear = ref(currentYear)
const search = ref('')
const filter = ref('all')
const hideWithoutDates = ref(true)

const fetchAll = async () => {
  loading.value = true
  error.value = ''
  try {
    const payload = await bookingApi.getMarginsStatus(activeYear.value)
    marginStatus.value = payload.voyages || []
    if (payload.available_years?.length) availableYears.value = payload.available_years
  }
  catch (err) {
    error.value = getApiErrorMessage(err, 'Erreur chargement des marges')
  }
  finally {
    loading.value = false
  }
}

// Voyages come from Sanity (the authoritative catalogue); the API only adds the
// per-year config status. A voyage the API knows nothing about is simply
// unconfigured with no departure that year.
const voyages = computed(() => {
  const statusBySlug = new Map(marginStatus.value.map(s => [s.voyage_slug, s]))
  return (props.voyagesList || [])
    .filter(v => v?.slug)
    .map((v) => {
      const status = statusBySlug.get(v.slug)
      return {
        slug: v.slug,
        title: v.title,
        image: v.image?.asset?.url || null,
        config_mode: status?.config_mode || 'pax_table',
        season_count: status?.season_count || 0,
        season_labels: status?.season_labels || [],
        dates_total: status?.dates_total || 0,
        dates_with_override: status?.dates_with_override || 0,
        configured_pax_count: status?.configured_pax_count || 0,
        status: status?.status || 'unconfigured',
        status_detail: status?.status_detail || null,
      }
    })
})

// Voyages without a departure that year are noise when planning the next season,
// so they are hidden by default but still counted.
const visibleVoyages = computed(() =>
  voyages.value.filter(v => !hideWithoutDates.value || v.dates_total > 0),
)

const withoutDatesCount = computed(() => voyages.value.filter(v => v.dates_total === 0).length)

const counts = computed(() => ({
  configured: visibleVoyages.value.filter(v => v.status === 'configured').length,
  partial: visibleVoyages.value.filter(v => v.status === 'partial').length,
  unconfigured: visibleVoyages.value.filter(v => v.status === 'unconfigured').length,
  excluded: visibleVoyages.value.filter(v => v.status === 'excluded').length,
}))

const STATUS_ORDER = { unconfigured: 0, partial: 1, configured: 2, excluded: 3 }

const filteredVoyages = computed(() => {
  const query = search.value?.toLowerCase() || ''
  return visibleVoyages.value
    .filter((v) => {
      if (query && !v.slug.toLowerCase().includes(query) && !v.title?.toLowerCase().includes(query)) {
        return false
      }
      if (filter.value && filter.value !== 'all') return v.status === filter.value
      return true
    })
    .sort((a, b) => {
      const order = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
      if (order !== 0) return order
      return (a.title || a.slug).localeCompare(b.title || b.slug, 'fr')
    })
})

function modeLabel(voyage) {
  if (voyage.config_mode === 'per_date') return 'Marge fixe / date'
  if (voyage.config_mode === 'excluded') return 'Exclu du suivi'
  return voyage.season_count > 0 ? `PAX × ${voyage.season_count} saisons` : 'Tableau PAX'
}

async function setMode(voyage, mode) {
  if (voyage.config_mode === mode) return
  try {
    await bookingApi.updateVoyageMarginSettings(voyage.slug, { config_mode: mode })
    await fetchAll()
  }
  catch (err) {
    error.value = getApiErrorMessage(err, 'Erreur lors du changement de mode.')
  }
}

watch(activeYear, fetchAll)
onMounted(fetchAll)
</script>
