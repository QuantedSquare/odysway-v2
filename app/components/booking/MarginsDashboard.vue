<template>
  <div>
    <!-- Loading -->
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
      <!-- Toolbar: date window + filters + refresh -->
      <div class="d-flex align-center ga-3 flex-wrap mb-4">
        <v-text-field
          v-model="dateFrom"
          label="Depuis"
          type="date"
          density="compact"
          variant="outlined"
          hide-details
          style="max-width: 170px;"
        />
        <v-text-field
          v-model="dateTo"
          label="Jusqu'au"
          type="date"
          density="compact"
          variant="outlined"
          hide-details
          style="max-width: 170px;"
        />
        <v-btn
          variant="tonal"
          size="small"
          :loading="loading"
          @click="fetchDashboard"
        >
          Appliquer
        </v-btn>

        <v-spacer />

        <v-text-field
          v-model="search"
          label="Rechercher voyage"
          :prepend-inner-icon="mdiMagnify"
          clearable
          hide-details
          density="compact"
          style="max-width: 260px;"
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
            value="configured"
            label
            size="small"
          >
            Avec config marge
          </v-chip>
        </v-chip-group>
      </div>

      <!-- KPI cards -->
      <v-row class="mb-4">
        <v-col
          cols="6"
          md="4"
        >
          <v-card
            rounded="lg"
            class="bo-card bo-stat-card pa-4"
            elevation="0"
            style="border-left-color: rgb(var(--v-theme-primary));"
          >
            <div class="text-caption text-medium-emphasis">
              Marge estimée totale
            </div>
            <div class="text-h5 font-weight-bold">
              {{ formatEur(globals.total_estimated) }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              {{ globals.total_dates_count }} départs
            </div>
          </v-card>
        </v-col>
        <v-col
          cols="6"
          md="4"
        >
          <v-card
            rounded="lg"
            class="bo-card bo-stat-card pa-4"
            elevation="0"
            style="border-left-color: rgb(var(--v-theme-info));"
          >
            <div class="text-caption text-medium-emphasis">
              Voyages terminés
            </div>
            <div class="text-h5 font-weight-bold">
              {{ globals.finished_count }} / {{ globals.total_dates_count }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              {{ formatPct(globals.total_dates_count ? globals.finished_count / globals.total_dates_count : 0) }} retours faits
            </div>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <v-card
            rounded="lg"
            class="bo-card bo-stat-card pa-4"
            elevation="0"
            style="border-left-color: rgb(var(--v-theme-success));"
          >
            <div class="text-caption text-medium-emphasis">
              Voyages avec config marge
            </div>
            <div class="text-h5 font-weight-bold">
              {{ voyages.filter(v => v.has_pax_config).length }} / {{ voyages.length }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              Marge réelle calculable sur ces voyages
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Voyages table with expandable date rows (lazy loaded) -->
      <v-card
        rounded="lg"
        class="bo-card"
        elevation="0"
      >
        <v-table density="compact">
          <thead>
            <tr>
              <th
                class="cursor-pointer"
                @click="sortBy('title')"
              >
                Voyage <SortIndicator
                  :column="'title'"
                  :sort="sort"
                />
              </th>
              <th
                class="text-right cursor-pointer"
                @click="sortBy('finished')"
              >
                Départs <SortIndicator
                  :column="'finished'"
                  :sort="sort"
                />
              </th>
              <th
                class="text-right cursor-pointer"
                @click="sortBy('estimated')"
              >
                Marge estimée <SortIndicator
                  :column="'estimated'"
                  :sort="sort"
                />
              </th>
              <th class="text-right">
                Config
              </th>
              <th />
            </tr>
          </thead>
          <tbody>
            <template
              v-for="voyage in filteredSortedVoyages"
              :key="voyage.voyage_slug"
            >
              <tr
                class="cursor-pointer"
                @click="toggleExpand(voyage.voyage_slug)"
              >
                <td>
                  <div class="d-flex align-center ga-2">
                    <v-avatar
                      v-if="voyage.image"
                      size="28"
                      rounded="lg"
                    >
                      <v-img
                        :src="voyage.image"
                        cover
                      />
                    </v-avatar>
                    <v-avatar
                      v-else
                      size="28"
                      rounded="lg"
                      color="grey-lighten-3"
                    >
                      <v-icon size="14">
                        {{ mdiImageOff }}
                      </v-icon>
                    </v-avatar>
                    <div>
                      <div class="text-body-2 font-weight-medium">
                        {{ voyage.title || voyage.voyage_slug }}
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        {{ voyage.voyage_slug }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="text-right">
                  {{ voyage.totals.finished_count }} / {{ voyage.totals.total_count }}
                </td>
                <td class="text-right font-weight-medium">
                  {{ formatEur(voyage.totals.estimated) }}
                </td>
                <td class="text-right">
                  <v-chip
                    v-if="voyage.has_pax_config"
                    color="success"
                    label
                    size="x-small"
                    :prepend-icon="mdiCheckCircle"
                  >
                    Tableau PAX
                  </v-chip>
                  <v-chip
                    v-else-if="voyage.totals.configured_dates_count > 0"
                    color="info"
                    label
                    size="x-small"
                  >
                    {{ voyage.totals.configured_dates_count }} override
                  </v-chip>
                  <span
                    v-else
                    class="text-medium-emphasis"
                  >—</span>
                </td>
                <td class="text-right">
                  <v-icon size="18">
                    {{ expanded.has(voyage.voyage_slug) ? mdiChevronUp : mdiChevronDown }}
                  </v-icon>
                </td>
              </tr>

              <tr
                v-if="expanded.has(voyage.voyage_slug)"
                class="bg-surface-variant"
              >
                <td
                  colspan="5"
                  class="pa-0"
                >
                  <div
                    v-if="detailLoading[voyage.voyage_slug]"
                    class="d-flex justify-center py-4"
                  >
                    <v-progress-circular
                      indeterminate
                      size="24"
                      color="primary"
                    />
                  </div>
                  <v-table
                    v-else-if="detail[voyage.voyage_slug]"
                    density="compact"
                  >
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th class="text-right">
                          Pax
                        </th>
                        <th class="text-right">
                          Marge estimée
                        </th>
                        <th class="text-right">
                          Marge réelle
                        </th>
                        <th class="text-right">
                          Écart
                        </th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="date in detail[voyage.voyage_slug].dates"
                        :key="date.id"
                      >
                        <td>
                          <NuxtLink
                            :to="`/booking-management/${voyage.voyage_slug}/${date.id}`"
                            class="text-body-2 d-flex align-center ga-1"
                          >
                            {{ dayjs(date.departure_date).format('DD MMM YYYY') }}
                            <v-icon size="12">
                              {{ mdiArrowRight }}
                            </v-icon>
                          </NuxtLink>
                          <v-chip
                            v-if="date.is_finished"
                            color="success"
                            label
                            size="x-small"
                            class="mt-1"
                          >
                            Terminé
                          </v-chip>
                          <v-chip
                            v-else
                            color="info"
                            label
                            size="x-small"
                            class="mt-1"
                          >
                            À venir
                          </v-chip>
                        </td>
                        <td class="text-right">
                          <v-tooltip
                            location="top"
                            :disabled="date.booked_seat === date.real_pax"
                          >
                            <template #activator="{ props: tipProps }">
                              <span v-bind="tipProps">
                                {{ date.booked_seat || 0 }}<span
                                  v-if="date.max_travelers"
                                  class="text-medium-emphasis"
                                > / {{ date.max_travelers }}</span>
                              </span>
                            </template>
                            {{ date.real_pax }} pax payants utilisés pour le calcul de marge
                          </v-tooltip>
                        </td>
                        <td class="text-right">
                          {{ formatEur(date.estimated) }}
                        </td>
                        <td
                          class="text-right"
                          :class="date.real == null ? 'text-medium-emphasis' : ''"
                        >
                          <span v-if="date.real != null">{{ formatEur(date.real) }}</span>
                          <v-tooltip
                            v-else
                            location="top"
                          >
                            <template #activator="{ props: tipProps }">
                              <span v-bind="tipProps">—</span>
                            </template>
                            {{ date.has_config ? 'En cours de calcul' : 'Pas de marge configurée pour ce nombre de pax' }}
                          </v-tooltip>
                        </td>
                        <td class="text-right">
                          <span
                            v-if="date.variance != null"
                            :style="`color:${varianceColor(date.variance)};`"
                            class="font-weight-medium"
                          >
                            {{ formatEurSigned(date.variance) }}
                          </span>
                          <span
                            v-else
                            class="text-medium-emphasis"
                          >—</span>
                        </td>
                        <td class="text-right">
                          <v-chip
                            v-if="date.source === 'override'"
                            color="warning"
                            size="x-small"
                            label
                            variant="tonal"
                          >
                            override
                          </v-chip>
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                  <v-alert
                    v-if="detailError[voyage.voyage_slug]"
                    type="error"
                    density="compact"
                    variant="tonal"
                    class="ma-3"
                  >
                    {{ detailError[voyage.voyage_slug] }}
                  </v-alert>
                </td>
              </tr>
            </template>
          </tbody>
        </v-table>

        <div
          v-if="!filteredSortedVoyages.length"
          class="text-center py-8 text-medium-emphasis"
        >
          Aucun voyage correspondant.
        </div>
      </v-card>

      <div
        v-if="orphanCount > 0"
        class="text-caption text-medium-emphasis mt-3"
      >
        {{ orphanCount }} slug{{ orphanCount > 1 ? 's' : '' }} pr&eacute;sent{{ orphanCount > 1 ? 's' : '' }} dans <code>travel_dates</code> mais absent{{ orphanCount > 1 ? 's' : '' }} de Sanity (voyages supprim&eacute;s du CMS) — exclu{{ orphanCount > 1 ? 's' : '' }} du dashboard.
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, h } from 'vue'
import dayjs from 'dayjs'
import { mdiMagnify, mdiArrowRight, mdiChevronUp, mdiChevronDown, mdiImageOff, mdiCheckCircle } from '@mdi/js'
import { bookingApi, getApiErrorMessage } from '~/utils/bookingApi'

const props = defineProps({
  voyagesList: { type: Array, default: () => [] },
})

// Inline component for sort arrows
const SortIndicator = (compProps) => {
  const active = compProps.sort.col === compProps.column
  if (!active) return h('span', { class: 'text-medium-emphasis', style: 'opacity:0.3' }, ' ⇅')
  return h('span', null, compProps.sort.dir === 'asc' ? ' ↑' : ' ↓')
}

const loading = ref(true)
const data = ref({ voyages: [], globals: emptyGlobals() })
const dateFrom = ref(dayjs().subtract(12, 'month').format('YYYY-MM-DD'))
const dateTo = ref(dayjs().add(18, 'month').format('YYYY-MM-DD'))
const search = ref('')
const filter = ref('all')
const expanded = ref(new Set())
const sort = ref({ col: 'estimated', dir: 'desc' })

// Lazy-loaded per-voyage detail (keyed by slug)
const detail = reactive({})
const detailLoading = reactive({})
const detailError = reactive({})

function emptyGlobals() {
  return { total_estimated: 0, finished_count: 0, total_dates_count: 0 }
}

function formatEur(amount) {
  if (amount === null || amount === undefined || amount === '' || Number.isNaN(amount)) return '0 €'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)
}
function formatEurSigned(amount) {
  if (amount === null || amount === undefined) return '—'
  const formatted = formatEur(Math.abs(amount))
  return amount > 0 ? `+${formatted}` : amount < 0 ? `−${formatted}` : formatted
}
function formatPct(ratio) {
  if (ratio === null || ratio === undefined || Number.isNaN(ratio)) return '—'
  return new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 }).format(ratio)
}
function varianceColor(v) {
  if (v == null) return 'rgb(var(--v-theme-grey))'
  if (v > 0) return 'rgb(var(--v-theme-success))'
  if (v < 0) return 'rgb(var(--v-theme-error))'
  return 'rgb(var(--v-theme-grey))'
}

async function fetchDashboard() {
  loading.value = true
  // Invalidate the lazy-loaded detail cache when the window changes.
  for (const k of Object.keys(detail)) delete detail[k]
  try {
    data.value = await bookingApi.getMarginsDashboard({ from: dateFrom.value, to: dateTo.value })
  }
  catch (err) {
    console.error(getApiErrorMessage(err, 'Erreur chargement dashboard'))
  }
  finally {
    loading.value = false
  }
}

async function fetchVoyageDetail(slug) {
  if (detail[slug] || detailLoading[slug]) return
  detailLoading[slug] = true
  detailError[slug] = ''
  try {
    detail[slug] = await bookingApi.getMarginsDashboardVoyage(slug, { from: dateFrom.value, to: dateTo.value })
  }
  catch (err) {
    detailError[slug] = getApiErrorMessage(err, 'Erreur chargement détail.')
  }
  finally {
    detailLoading[slug] = false
  }
}

const globals = computed(() => data.value.globals || emptyGlobals())

const titleBySlug = computed(() => {
  const map = new Map()
  for (const v of props.voyagesList || []) {
    if (v?.slug) map.set(v.slug, { title: v.title, image: v.image?.asset?.url || null })
  }
  return map
})

// Drop orphan slugs (present in travel_dates but missing from Sanity — e.g. voyages
// deleted from the CMS without cleaning up the dates table). Keeps the dashboard
// count consistent with the Configuration tab and the public site.
const voyages = computed(() => {
  return (data.value.voyages || [])
    .filter(v => titleBySlug.value.has(v.voyage_slug))
    .map((v) => {
      const meta = titleBySlug.value.get(v.voyage_slug)
      return { ...v, title: meta.title, image: meta.image }
    })
})

const orphanCount = computed(() =>
  (data.value.voyages || []).filter(v => !titleBySlug.value.has(v.voyage_slug)).length,
)

const filteredSortedVoyages = computed(() => {
  const query = search.value?.toLowerCase() || ''
  let list = voyages.value.filter((v) => {
    if (query && !v.voyage_slug.toLowerCase().includes(query) && !v.title?.toLowerCase().includes(query)) {
      return false
    }
    if (filter.value === 'configured' && !v.has_pax_config && !v.totals.configured_dates_count) return false
    return true
  })

  const { col, dir } = sort.value
  list = [...list].sort((a, b) => {
    let av, bv
    if (col === 'title') { av = a.title || a.voyage_slug; bv = b.title || b.voyage_slug; return dir === 'asc' ? av.localeCompare(bv, 'fr') : bv.localeCompare(av, 'fr') }
    if (col === 'finished') { av = a.totals.finished_count; bv = b.totals.finished_count }
    else if (col === 'estimated') { av = a.totals.estimated; bv = b.totals.estimated }
    else return 0
    return dir === 'asc' ? av - bv : bv - av
  })

  return list
})

function toggleExpand(slug) {
  const next = new Set(expanded.value)
  if (next.has(slug)) {
    next.delete(slug)
  }
  else {
    next.add(slug)
    fetchVoyageDetail(slug)
  }
  expanded.value = next
}

function sortBy(col) {
  if (sort.value.col === col) {
    sort.value = { col, dir: sort.value.dir === 'asc' ? 'desc' : 'asc' }
  }
  else {
    sort.value = { col, dir: col === 'title' ? 'asc' : 'desc' }
  }
}

onMounted(fetchDashboard)
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }
</style>
