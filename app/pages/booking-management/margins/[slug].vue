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
          Marge par voyageur selon le nombre de pax (Pattern A) et par année. Une date sans marge configurée pour son année hérite automatiquement de l'année la plus proche (pass&eacute;e ou future, l'ann&eacute;e ant&eacute;rieure gagne en cas d'&eacute;galit&eacute;).
        </p>
      </v-col>
    </v-row>

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
        Saison = année calendaire de la date de départ
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
            v-if="hasFallbackRows"
            type="info"
            density="compact"
            variant="tonal"
            class="mb-3"
          >
            Les paliers vides pour {{ activeYear }} héritent automatiquement de l'année la plus proche configurée (pass&eacute;e ou future). Saisis une valeur pour override la saison.
          </v-alert>

          <v-table density="comfortable">
            <thead>
              <tr>
                <th>PAX</th>
                <th>Marge par voyageur (€)</th>
                <th>Marge totale (€)</th>
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
                <td>
                  <v-text-field
                    v-model.number="row.margin_per_traveler"
                    type="number"
                    density="compact"
                    hide-details
                    variant="outlined"
                    :placeholder="row.fallback_value !== null ? `Hérité ${row.fallback_year}: ${row.fallback_value} €` : '0'"
                    style="max-width: 240px;"
                  />
                </td>
                <td class="text-medium-emphasis">
                  {{ row.margin_per_traveler ? formatEur(Number(row.margin_per_traveler) * row.pax) : '—' }}
                </td>
                <td class="text-right">
                  <v-btn
                    icon
                    size="x-small"
                    color="error"
                    variant="text"
                    :disabled="row.margin_per_traveler === null"
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
                <td colspan="3">
                  <v-btn
                    size="small"
                    color="primary"
                    variant="tonal"
                    :prepend-icon="mdiPlus"
                    :disabled="!newPax || rows.find(r => r.pax === newPax)"
                    @click="addRow"
                  >
                    Ajouter ce palier pax
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>

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
              Modifications enregistrées pour la saison {{ activeYear }}.
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
import { ref, computed, watch, onMounted } from 'vue'
import { mdiArrowLeft, mdiDelete, mdiPlus } from '@mdi/js'
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

const loading = ref(false)
const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)
const newPax = ref(null)

const DEFAULT_PAX_RANGE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// All margin rows for this voyage across all years, fetched once.
const allRows = ref([])
const currentYear = new Date().getFullYear()
const activeYear = ref(Number(route.query.year) || currentYear)
const extraYearTabs = ref([])

const rows = ref([])
let initialState = ''

const isDirty = computed(() => JSON.stringify(rows.value) !== initialState)
const hasFallbackRows = computed(() => rows.value.some(r => r.fallback_value !== null && r.margin_per_traveler === null))

// Years available as tabs: years actually configured + current + any extras added by user.
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

// Picks the nearest year for the given pax (excluding activeYear itself).
// Matches the server-side rule in margins.js::pickNearestYearCandidate
// (nearest distance, prefer older year on equal distance).
function pickFallbackForPax(pax) {
  const candidates = allRows.value.filter(r =>
    r.pax === pax && r.year !== activeYear.value && r.margin_per_traveler != null,
  )
  if (!candidates.length) return null
  return [...candidates].sort((a, b) => {
    const da = Math.abs(a.year - activeYear.value)
    const db = Math.abs(b.year - activeYear.value)
    if (da !== db) return da - db
    return a.year - b.year
  })[0]
}

// Rebuild visible `rows` whenever activeYear or allRows changes.
function rebuildRows() {
  const byPax = new Map(
    allRows.value
      .filter(r => r.year === activeYear.value)
      .map(r => [r.pax, r.margin_per_traveler]),
  )

  // Build the merged view: pax 1..10 + any palier > 10 configured in any year.
  // Set dedup on extraPax handles cross-year duplicates (same palier in 2026 and 2027).
  const extraPax = [...new Set(allRows.value.filter(r => r.pax > 10).map(r => r.pax))]
  const paxRange = [...DEFAULT_PAX_RANGE, ...extraPax].sort((a, b) => a - b)

  rows.value = paxRange.map((pax) => {
    const fallback = pickFallbackForPax(pax)
    return {
      pax,
      margin_per_traveler: byPax.has(pax) ? byPax.get(pax) : null,
      fallback_value: fallback ? Number(fallback.margin_per_traveler) : null,
      fallback_year: fallback?.year ?? null,
    }
  })
  initialState = JSON.stringify(rows.value)
}

const fetchAll = async () => {
  loading.value = true
  saveError.value = ''
  saveSuccess.value = false
  try {
    allRows.value = await bookingApi.getVoyageMargin(slug)
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
  if (rows.value.find(r => r.pax === newPax.value)) return
  rows.value.push({
    pax: Number(newPax.value),
    margin_per_traveler: null,
    fallback_value: null,
    fallback_year: null,
  })
  rows.value.sort((a, b) => a.pax - b.pax)
  newPax.value = null
}

const removeRow = async (pax) => {
  if (!confirm(`Supprimer le palier ${pax} pax pour la saison ${activeYear.value} ?`)) return
  try {
    await bookingApi.deleteVoyageMarginRow(slug, pax, activeYear.value)
    await fetchAll()
  }
  catch (err) {
    saveError.value = getApiErrorMessage(err, 'Erreur lors de la suppression.')
  }
}

const save = async () => {
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  try {
    const payload = rows.value
      .filter(r => r.margin_per_traveler !== null && r.margin_per_traveler !== '')
      .map(r => ({ pax: r.pax, margin_per_traveler: Number(r.margin_per_traveler) }))
    await bookingApi.updateVoyageMargin(slug, activeYear.value, payload)
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

// Sync URL ?year= when tab changes, and rebuild visible rows.
watch(activeYear, (y) => {
  router.replace({ query: { ...route.query, year: String(y) } })
  rebuildRows()
})

onMounted(fetchAll)
</script>
