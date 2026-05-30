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
          Marge par voyageur selon le nombre de pax (Pattern A). Cette grille sert à calculer la marge réelle d'un départ une fois le voyage terminé.
        </p>
      </v-col>
    </v-row>

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
                    placeholder="0"
                    style="max-width: 200px;"
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
              Modifications enregistrées.
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
import { ref, computed, onMounted } from 'vue'
import { mdiArrowLeft, mdiDelete, mdiPlus } from '@mdi/js'
import { bookingApi, getApiErrorMessage } from '~/utils/bookingApi'

definePageMeta({
  layout: 'booking',
  middleware: 'booking-management',
})

const route = useRoute()
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

const rows = ref([])
let initialState = ''

const DEFAULT_PAX_RANGE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

function formatEur(amount) {
  if (amount === null || amount === undefined || amount === '') return '—'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)
}

const isDirty = computed(() => JSON.stringify(rows.value) !== initialState)

const fetchMargin = async () => {
  loading.value = true
  saveError.value = ''
  saveSuccess.value = false
  try {
    const data = await bookingApi.getVoyageMargin(slug)
    const existingByPax = new Map(data.map(d => [d.pax, d]))
    // Always show at least PAX 1..10 to make the table easy to fill from the Excel.
    const merged = DEFAULT_PAX_RANGE.map(pax => ({
      pax,
      margin_per_traveler: existingByPax.has(pax) ? existingByPax.get(pax).margin_per_traveler : null,
    }))
    // Include any extra paliers > 10 already configured
    for (const d of data) {
      if (d.pax > 10) merged.push({ pax: d.pax, margin_per_traveler: d.margin_per_traveler })
    }
    merged.sort((a, b) => a.pax - b.pax)
    rows.value = merged
    initialState = JSON.stringify(rows.value)
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
  rows.value.push({ pax: Number(newPax.value), margin_per_traveler: null })
  rows.value.sort((a, b) => a.pax - b.pax)
  newPax.value = null
}

const removeRow = async (pax) => {
  if (!confirm(`Supprimer le palier ${pax} pax ?`)) return
  rows.value = rows.value.filter(r => r.pax !== pax)
  // Push delete immediately if it had a value persisted server-side
  try {
    await bookingApi.deleteVoyageMarginRow(slug, pax)
    await fetchMargin()
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
    // Only send rows with a non-null margin
    const payload = rows.value
      .filter(r => r.margin_per_traveler !== null && r.margin_per_traveler !== '')
      .map(r => ({ pax: r.pax, margin_per_traveler: Number(r.margin_per_traveler) }))
    await bookingApi.updateVoyageMargin(slug, payload)
    await fetchMargin()
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

onMounted(fetchMargin)
</script>
