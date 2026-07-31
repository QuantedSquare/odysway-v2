<template>
  <v-container
    fluid
    class="py-6"
  >
    <v-row class="align-center mb-4">
      <v-col cols="12">
        <NuxtLink
          to="/booking-management/margins"
          class="text-body-2 d-inline-flex align-center ga-1 mb-2"
        >
          <v-icon size="14">
            {{ mdiArrowLeft }}
          </v-icon>
          Retour aux marges
        </NuxtLink>
        <h1 class="text-h5 font-weight-bold mb-1 d-flex align-center ga-3">
          <v-avatar
            v-if="voyageImage"
            size="36"
            rounded="lg"
          >
            <v-img
              :src="voyageImage"
              cover
            />
          </v-avatar>
          {{ voyageTitle || slug }}
        </h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Marge par voyageur selon le nombre de pax, l'ann&eacute;e de d&eacute;part et &eacute;ventuellement la saison. Une case vide h&eacute;rite de la saison la plus proche configur&eacute;e, puis de la colonne D&eacute;faut.
        </p>
      </v-col>
    </v-row>

    <!-- Réglages du voyage : mode de configuration + écart enfant -->
    <v-card
      rounded="lg"
      class="bo-card mb-4"
      elevation="0"
    >
      <v-card-text>
        <div class="d-flex align-start ga-6 flex-wrap">
          <div style="min-width: 280px;">
            <div class="text-body-2 font-weight-bold mb-1">
              Mode de configuration
            </div>
            <v-select
              v-model="settingsForm.config_mode"
              :items="CONFIG_MODE_ITEMS"
              density="compact"
              variant="outlined"
              hide-details
            />
            <div class="text-caption text-medium-emphasis mt-1">
              {{ configModeHint }}
            </div>
          </div>

          <div style="min-width: 280px;">
            <div class="text-body-2 font-weight-bold mb-1">
              &Eacute;cart de marge enfant
            </div>
            <v-text-field
              v-model.number="settingsForm.child_margin_delta"
              type="number"
              suffix="€ / enfant"
              density="compact"
              variant="outlined"
              hide-details
              clearable
              placeholder="0"
            />
            <div class="text-caption text-medium-emphasis mt-1">
              Montant <strong>ajout&eacute;</strong> &agrave; la marge adulte pour chaque enfant : l'achat enfant co&ucirc;te moins cher, la marge est donc sup&eacute;rieure. Vide = m&ecirc;me marge qu'un adulte.
            </div>
          </div>

          <v-spacer />

          <div class="d-flex align-center ga-2">
            <span
              v-if="settingsSaved"
              class="text-caption text-success"
            >Enregistr&eacute;</span>
            <v-btn
              size="small"
              color="primary"
              variant="tonal"
              :loading="settingsSaving"
              :disabled="!settingsDirty"
              @click="saveSettings"
            >
              Enregistrer les r&eacute;glages
            </v-btn>
          </div>
        </div>

        <v-alert
          v-if="settingsError"
          type="error"
          density="compact"
          variant="tonal"
          class="mt-3"
        >
          {{ settingsError }}
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- Saisons récurrentes -->
    <v-expansion-panels
      v-model="seasonsPanel"
      variant="accordion"
      class="mb-4"
    >
      <v-expansion-panel rounded="lg">
        <v-expansion-panel-title>
          <div class="d-flex align-center ga-2">
            <v-icon size="18">
              {{ mdiCalendarRange }}
            </v-icon>
            <span class="text-body-2 font-weight-bold">Saisons</span>
            <v-chip
              v-if="seasons.length"
              size="x-small"
              label
              color="primary"
            >
              {{ seasons.map(s => s.label).join(' · ') }}
            </v-chip>
            <span
              v-else
              class="text-caption text-medium-emphasis"
            >Aucune — un seul tarif toute l'ann&eacute;e</span>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <p class="text-body-2 text-medium-emphasis mb-3">
            Les p&eacute;riodes sont <strong>r&eacute;currentes</strong> : d&eacute;finies une fois en jour/mois, elles valent pour toutes les ann&eacute;es. Seuls les montants sont saisis ann&eacute;e par ann&eacute;e. Une saison peut enjamber le 31/12 (ex. 01/10 &rarr; 30/04). Les p&eacute;riodes ne doivent pas se chevaucher.
          </p>

          <div
            v-for="(season, index) in seasonsForm"
            :key="index"
            class="d-flex align-center ga-2 mb-2 flex-wrap"
          >
            <v-text-field
              v-model="season.label"
              label="Nom"
              density="compact"
              variant="outlined"
              hide-details
              style="max-width: 200px;"
            />
            <span class="text-caption text-medium-emphasis">du</span>
            <v-text-field
              v-model.number="season.start_day"
              type="number"
              label="Jour"
              density="compact"
              variant="outlined"
              hide-details
              min="1"
              max="31"
              style="max-width: 90px;"
            />
            <v-select
              v-model="season.start_month"
              :items="MONTH_ITEMS"
              label="Mois"
              density="compact"
              variant="outlined"
              hide-details
              style="max-width: 150px;"
            />
            <span class="text-caption text-medium-emphasis">au</span>
            <v-text-field
              v-model.number="season.end_day"
              type="number"
              label="Jour"
              density="compact"
              variant="outlined"
              hide-details
              min="1"
              max="31"
              style="max-width: 90px;"
            />
            <v-select
              v-model="season.end_month"
              :items="MONTH_ITEMS"
              label="Mois"
              density="compact"
              variant="outlined"
              hide-details
              style="max-width: 150px;"
            />
            <v-btn
              icon
              size="x-small"
              color="error"
              variant="text"
              @click="seasonsForm.splice(index, 1)"
            >
              <v-icon size="16">
                {{ mdiDelete }}
              </v-icon>
            </v-btn>
          </div>

          <div class="d-flex align-center ga-2 mt-3">
            <v-btn
              size="small"
              variant="tonal"
              :prepend-icon="mdiPlus"
              @click="addSeason"
            >
              Ajouter une saison
            </v-btn>
            <v-spacer />
            <v-btn
              size="small"
              color="primary"
              :loading="seasonsSaving"
              :disabled="!seasonsDirty"
              @click="saveSeasons"
            >
              Enregistrer les saisons
            </v-btn>
          </div>

          <v-alert
            v-if="seasonsError"
            type="error"
            density="compact"
            variant="tonal"
            class="mt-3"
          >
            {{ seasonsError }}
          </v-alert>
          <v-alert
            v-if="seasonsForm.length"
            type="info"
            density="compact"
            variant="tonal"
            class="mt-3"
          >
            Supprimer une saison supprime aussi les montants saisis pour cette saison, toutes ann&eacute;es confondues.
          </v-alert>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- Year tabs -->
    <div class="d-flex align-center ga-2 mb-3 flex-wrap">
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
          Saison {{ y }}
        </v-btn>
      </v-btn-toggle>
      <v-btn
        size="small"
        variant="text"
        color="primary"
        :prepend-icon="mdiPlus"
        @click="addPreviousYearTab"
      >
        Saison {{ previousYearSuggestion }}
      </v-btn>
      <v-btn
        size="small"
        variant="text"
        color="primary"
        :prepend-icon="mdiPlus"
        @click="addNextYearTab"
      >
        Saison {{ nextYearSuggestion }}
      </v-btn>
      <v-spacer />
      <div class="text-caption text-medium-emphasis">
        Saison = ann&eacute;e calendaire de la date de d&eacute;part
      </div>
    </div>

    <v-card
      rounded="lg"
      class="bo-card"
      elevation="0"
    >
      <v-card-text>
        <div
          v-if="loading"
          class="d-flex justify-center py-8"
        >
          <v-progress-circular
            indeterminate
            color="primary"
          />
        </div>

        <template v-else>
          <v-alert
            v-if="settings.config_mode !== 'pax_table'"
            type="info"
            density="compact"
            variant="tonal"
            class="mb-3"
          >
            <template v-if="settings.config_mode === 'per_date'">
              Ce voyage est en mode <strong>marge fixe par date</strong> : la marge se saisit d&eacute;part par d&eacute;part depuis la fiche date. Ce tableau reste utilisable comme filet si un d&eacute;part n'a pas d'override.
            </template>
            <template v-else>
              Ce voyage est <strong>exclu du suivi des marges</strong> : il n'appara&icirc;t plus dans les voyages &agrave; configurer.
            </template>
          </v-alert>

          <v-alert
            v-if="hasFallbackCells"
            type="info"
            density="compact"
            variant="tonal"
            class="mb-3"
          >
            Les cases vides h&eacute;ritent automatiquement (saison la plus proche configur&eacute;e, puis colonne D&eacute;faut). Saisis une valeur pour surcharger.
          </v-alert>

          <div class="table-scroll">
            <v-table density="comfortable">
              <thead>
                <tr>
                  <th>PAX</th>
                  <th
                    v-for="col in columns"
                    :key="col.key"
                  >
                    {{ col.label }}
                    <div
                      v-if="col.hint"
                      class="text-caption text-medium-emphasis font-weight-regular"
                    >
                      {{ col.hint }}
                    </div>
                  </th>
                  <th class="text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in rows"
                  :key="row.pax"
                >
                  <td class="font-weight-bold">
                    {{ row.pax }}
                  </td>
                  <td
                    v-for="col in columns"
                    :key="col.key"
                  >
                    <v-text-field
                      v-model.number="row.values[col.key]"
                      type="number"
                      density="compact"
                      hide-details
                      variant="outlined"
                      :placeholder="cellPlaceholder(row.pax, col)"
                      style="min-width: 170px;"
                    />
                  </td>
                  <td class="text-right">
                    <v-btn
                      icon
                      size="x-small"
                      color="error"
                      variant="text"
                      :disabled="!hasAnyValue(row)"
                      @click="removeRow(row.pax)"
                    >
                      <v-icon size="16">
                        {{ mdiDelete }}
                      </v-icon>
                    </v-btn>
                  </td>
                </tr>
                <tr>
                  <td>
                    <v-text-field
                      v-model.number="newPax"
                      type="number"
                      density="compact"
                      hide-details
                      variant="outlined"
                      placeholder="Ex: 11"
                      min="1"
                      style="max-width: 100px;"
                    />
                  </td>
                  <td :colspan="columns.length + 1">
                    <v-btn
                      size="small"
                      color="primary"
                      variant="tonal"
                      :prepend-icon="mdiPlus"
                      :disabled="!newPax || rows.some(r => r.pax === newPax)"
                      @click="addRow"
                    >
                      Ajouter ce palier pax
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>

          <div class="d-flex align-center justify-end ga-2 mt-4">
            <v-alert
              v-if="saveError"
              type="error"
              density="compact"
              variant="tonal"
              class="flex-grow-1"
            >
              {{ saveError }}
            </v-alert>
            <v-alert
              v-else-if="saveSuccess"
              type="success"
              density="compact"
              variant="tonal"
              class="flex-grow-1"
            >
              Modifications enregistr&eacute;es pour la saison {{ activeYear }}.
            </v-alert>
            <v-btn
              color="primary"
              :loading="saving"
              :disabled="!isDirty"
              @click="save"
            >
              Enregistrer
            </v-btn>
          </div>
        </template>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { mdiArrowLeft, mdiDelete, mdiPlus, mdiCalendarRange } from '@mdi/js'
import { bookingApi, getApiErrorMessage } from '~/utils/bookingApi'
import { formatEur } from '~/utils/formatNumber'

definePageMeta({
  layout: 'booking',
  middleware: 'booking-management',
})

const route = useRoute()
const router = useRouter()
const slug = route.params.slug

const sanity = useSanity()
const voyageQuery = groq`*[_type == "voyage" && slug.current == $slug][0]{
  title,
  image { asset -> { url } }
}`
const { data: voyageData } = await useAsyncData(`voyage-${slug}`, () =>
  sanity.fetch(voyageQuery, { slug }),
)

const voyageTitle = computed(() => voyageData.value?.title)
const voyageImage = computed(() => voyageData.value?.image?.asset?.url)

const MONTH_ITEMS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
].map((title, i) => ({ title, value: i + 1 }))

const CONFIG_MODE_ITEMS = [
  { title: 'Tableau PAX', value: 'pax_table' },
  { title: 'Marge fixe par date', value: 'per_date' },
  { title: 'Exclu du suivi', value: 'excluded' },
]

const CONFIG_MODE_HINTS = {
  pax_table: 'La marge vient du tableau ci-dessous (pax × année × saison).',
  per_date: 'La marge est saisie date par date (override). Le voyage n\'est plus compté comme non configuré tant que ses départs ont leur override.',
  excluded: 'Le voyage sort des listes de configuration et du ratio « avec config marge ».',
}

const DEFAULT_COLUMN_KEY = 'default'
const DEFAULT_PAX_RANGE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const loading = ref(false)
const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)
const newPax = ref(null)

// All margin rows for this voyage across all years and seasons, fetched once.
const allRows = ref([])
const seasons = ref([])
const settings = ref({ config_mode: 'pax_table', child_margin_delta: null })

const currentYear = new Date().getFullYear()
const activeYear = ref(Number(route.query.year) || currentYear)
const extraYearTabs = ref([])

const rows = ref([])
let initialState = ''

// --- Settings form ---------------------------------------------------------

const settingsForm = reactive({ config_mode: 'pax_table', child_margin_delta: null })
const settingsSaving = ref(false)
const settingsSaved = ref(false)
const settingsError = ref('')

const configModeHint = computed(() => CONFIG_MODE_HINTS[settingsForm.config_mode] || '')

const settingsDirty = computed(() =>
  settingsForm.config_mode !== settings.value.config_mode
  || normalizeAmount(settingsForm.child_margin_delta) !== normalizeAmount(settings.value.child_margin_delta),
)

async function saveSettings() {
  settingsSaving.value = true
  settingsError.value = ''
  try {
    settings.value = await bookingApi.updateVoyageMarginSettings(slug, {
      config_mode: settingsForm.config_mode,
      child_margin_delta: normalizeAmount(settingsForm.child_margin_delta),
    })
    settingsSaved.value = true
    setTimeout(() => { settingsSaved.value = false }, 3000)
  }
  catch (err) {
    settingsError.value = getApiErrorMessage(err, 'Erreur lors de l\'enregistrement des réglages.')
  }
  finally {
    settingsSaving.value = false
  }
}

// --- Seasons form ----------------------------------------------------------

const seasonsPanel = ref(undefined)
const seasonsForm = ref([])
const seasonsSaving = ref(false)
const seasonsError = ref('')

const seasonsDirty = computed(() => JSON.stringify(seasonsForm.value) !== seasonsInitial)
let seasonsInitial = '[]'

function resetSeasonsForm() {
  seasonsForm.value = seasons.value.map(s => ({
    id: s.id,
    label: s.label,
    start_day: s.start_day,
    start_month: s.start_month,
    end_day: s.end_day,
    end_month: s.end_month,
  }))
  seasonsInitial = JSON.stringify(seasonsForm.value)
}

function addSeason() {
  seasonsForm.value.push({
    id: null,
    label: seasonsForm.value.length ? 'Basse saison' : 'Haute saison',
    start_day: 1,
    start_month: 1,
    end_day: 31,
    end_month: 12,
  })
}

async function saveSeasons() {
  seasonsSaving.value = true
  seasonsError.value = ''
  try {
    await bookingApi.updateVoyageMarginSeasons(
      slug,
      seasonsForm.value.map((s, index) => ({ ...s, sort_order: index })),
    )
    await fetchAll()
  }
  catch (err) {
    seasonsError.value = getApiErrorMessage(err, 'Erreur lors de l\'enregistrement des saisons.')
  }
  finally {
    seasonsSaving.value = false
  }
}

// --- Margin table ----------------------------------------------------------

function normalizeAmount(value) {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isNaN(n) ? null : n
}

// One column per season, plus the season-less "Défaut" column that acts as the
// fallback for any season left blank.
const columns = computed(() => [
  { key: DEFAULT_COLUMN_KEY, id: null, label: 'Défaut', hint: seasons.value.length ? 'toutes saisons' : null },
  ...seasons.value.map(s => ({
    key: s.id,
    id: s.id,
    label: s.label,
    hint: `${s.start_day}/${s.start_month} → ${s.end_day}/${s.end_month}`,
  })),
])

const availableYears = computed(() => {
  const set = new Set([currentYear, ...allRows.value.map(r => r.year), ...extraYearTabs.value])
  return Array.from(set).sort((a, b) => a - b)
})

const nextYearSuggestion = computed(() => Math.max(...availableYears.value) + 1)
const previousYearSuggestion = computed(() => Math.min(...availableYears.value) - 1)

function addYearTab(y) {
  if (!extraYearTabs.value.includes(y)) extraYearTabs.value.push(y)
  activeYear.value = y
}
const addNextYearTab = () => addYearTab(nextYearSuggestion.value)
const addPreviousYearTab = () => addYearTab(previousYearSuggestion.value)

// Matches the server rule in margins.js::pickNearestYearCandidate
// (nearest distance, prefer the older year on equal distance).
function pickNearestYear(candidates) {
  if (!candidates.length) return null
  return [...candidates].sort((a, b) => {
    const da = Math.abs(a.year - activeYear.value)
    const db = Math.abs(b.year - activeYear.value)
    if (da !== db) return da - db
    return a.year - b.year
  })[0]
}

function rowsFor(pax, seasonId, { excludeActiveYear = false } = {}) {
  return allRows.value.filter(r =>
    r.pax === pax
    && (seasonId ? r.season_id === seasonId : !r.season_id)
    && r.margin_per_traveler !== null && r.margin_per_traveler !== undefined
    && (!excludeActiveYear || r.year !== activeYear.value),
  )
}

/**
 * What a blank cell will actually resolve to, mirroring resolveBaseFromRows:
 * 1. the same season in the nearest other year
 * 2. the Défaut column for this year
 * 3. the Défaut column in the nearest other year
 */
function cellFallback(pax, col) {
  if (col.id) {
    const sameSeason = pickNearestYear(rowsFor(pax, col.id, { excludeActiveYear: true }))
    if (sameSeason) return { value: Number(sameSeason.margin_per_traveler), label: `Hérité ${sameSeason.year}` }

    const defaultThisYear = rowsFor(pax, null).find(r => r.year === activeYear.value)
    if (defaultThisYear) return { value: Number(defaultThisYear.margin_per_traveler), label: 'Défaut' }

    const defaultOtherYear = pickNearestYear(rowsFor(pax, null, { excludeActiveYear: true }))
    if (defaultOtherYear) return { value: Number(defaultOtherYear.margin_per_traveler), label: `Défaut ${defaultOtherYear.year}` }
    return null
  }

  const nearest = pickNearestYear(rowsFor(pax, null, { excludeActiveYear: true }))
  return nearest ? { value: Number(nearest.margin_per_traveler), label: `Hérité ${nearest.year}` } : null
}

function cellPlaceholder(pax, col) {
  const fallback = cellFallback(pax, col)
  return fallback ? `${fallback.label} : ${formatEur(fallback.value)}` : '0'
}

const hasFallbackCells = computed(() =>
  rows.value.some(row =>
    columns.value.some(col => row.values[col.key] === null && cellFallback(row.pax, col)),
  ),
)

const hasAnyValue = row => columns.value.some(col => normalizeAmount(row.values[col.key]) !== null)

const isDirty = computed(() => JSON.stringify(rows.value) !== initialState)

// Rebuild the visible grid whenever the year, the rows or the seasons change.
function rebuildRows() {
  const byKey = new Map(
    allRows.value
      .filter(r => r.year === activeYear.value)
      .map(r => [`${r.pax}:${r.season_id || DEFAULT_COLUMN_KEY}`, r.margin_per_traveler]),
  )

  // pax 1..10 + any tier > 10 configured in any year/season. The Set dedups
  // the same tier appearing in several years.
  const extraPax = [...new Set(allRows.value.filter(r => r.pax > 10).map(r => r.pax))]
  const paxRange = [...DEFAULT_PAX_RANGE, ...extraPax].sort((a, b) => a - b)

  rows.value = paxRange.map(pax => ({
    pax,
    values: Object.fromEntries(
      columns.value.map(col => [col.key, byKey.has(`${pax}:${col.key}`) ? byKey.get(`${pax}:${col.key}`) : null]),
    ),
  }))
  initialState = JSON.stringify(rows.value)
}

const fetchAll = async () => {
  loading.value = true
  saveError.value = ''
  saveSuccess.value = false
  try {
    const payload = await bookingApi.getVoyageMargin(slug)
    allRows.value = payload.rows || []
    seasons.value = payload.seasons || []
    settings.value = payload.settings || { config_mode: 'pax_table', child_margin_delta: null }
    settingsForm.config_mode = settings.value.config_mode
    settingsForm.child_margin_delta = settings.value.child_margin_delta
    resetSeasonsForm()
    rebuildRows()
  }
  catch (err) {
    saveError.value = getApiErrorMessage(err, 'Erreur de chargement.')
  }
  finally {
    loading.value = false
  }
}

const addRow = () => {
  if (!newPax.value) return
  if (rows.value.some(r => r.pax === newPax.value)) return
  rows.value.push({
    pax: Number(newPax.value),
    values: Object.fromEntries(columns.value.map(col => [col.key, null])),
  })
  rows.value.sort((a, b) => a.pax - b.pax)
  newPax.value = null
}

const removeRow = async (pax) => {
  if (!confirm(`Supprimer le palier ${pax} pax pour la saison ${activeYear.value} (toutes les colonnes) ?`)) return
  try {
    await bookingApi.deleteVoyageMarginRow(slug, pax, activeYear.value)
    await fetchAll()
  }
  catch (err) {
    saveError.value = getApiErrorMessage(err, 'Erreur lors de la suppression.')
  }
}

// Only the cells that actually changed are written: filled/updated cells are
// upserted per column, cleared cells are deleted so blanking a value really
// removes it instead of silently keeping the old amount.
const save = async () => {
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  try {
    const before = new Map(JSON.parse(initialState).map(r => [r.pax, r.values]))

    for (const col of columns.value) {
      const upserts = []
      const deletions = []

      for (const row of rows.value) {
        const next = normalizeAmount(row.values[col.key])
        const previous = normalizeAmount(before.get(row.pax)?.[col.key])
        if (next === previous) continue
        if (next === null) deletions.push(row.pax)
        else upserts.push({ pax: row.pax, margin_per_traveler: next })
      }

      if (upserts.length) await bookingApi.updateVoyageMargin(slug, activeYear.value, upserts, col.id)
      for (const pax of deletions) {
        await bookingApi.deleteVoyageMarginCell(slug, pax, activeYear.value, col.id)
      }
    }

    await fetchAll()
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  }
  catch (err) {
    saveError.value = getApiErrorMessage(err, 'Erreur lors de l\'enregistrement.')
  }
  finally {
    saving.value = false
  }
}

// Sync URL ?year= when the tab changes, and rebuild the visible grid.
watch(activeYear, (y) => {
  router.replace({ query: { ...route.query, year: String(y) } })
  rebuildRows()
})

onMounted(fetchAll)
</script>

<style scoped>
.table-scroll {
  overflow-x: auto;
}
</style>
