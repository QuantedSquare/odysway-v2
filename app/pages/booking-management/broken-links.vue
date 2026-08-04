<template>
  <v-container
    fluid
    class="py-6"
  >
    <v-row class="align-center mb-2">
      <v-col cols="12">
        <h1 class="text-h5 font-weight-bold mb-1">
          Liens de paiement cassés
        </h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Deals ActiveCampaign qui n'ont plus aucune réservation en base : leur lien de paiement
          renvoie une page d'erreur au client. Réparer recrée la ligne et réécrit un lien signé,
          qui ne pourra plus mourir.
        </p>
      </v-col>
    </v-row>

    <!-- Indicateurs -->
    <v-row
      dense
      class="mb-2"
    >
      <v-col
        v-for="kpi in kpis"
        :key="kpi.label"
        cols="6"
        md="3"
      >
        <v-card
          rounded="lg"
          class="bo-card"
          elevation="0"
        >
          <v-card-text class="pa-4">
            <div class="text-caption text-medium-emphasis">
              {{ kpi.label }}
            </div>
            <div
              class="text-h6 font-weight-bold"
              :class="kpi.color ? `text-${kpi.color}` : ''"
            >
              {{ kpi.value }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filtres -->
    <v-card
      rounded="lg"
      class="mb-4 bo-card"
      elevation="0"
    >
      <v-card-text class="pa-3">
        <v-row
          dense
          align="center"
        >
          <v-col
            cols="12"
            md="4"
          >
            <v-text-field
              v-model="search"
              label="Rechercher (deal, voyage, commercial)"
              :prepend-inner-icon="mdiMagnify"
              density="compact"
              clearable
              hide-details
            />
          </v-col>
          <v-col
            cols="12"
            md="3"
          >
            <v-select
              v-model="priorityFilter"
              :items="priorityItems"
              label="Priorité"
              density="compact"
              hide-details
            />
          </v-col>
          <v-col
            cols="12"
            md="5"
            class="d-flex ga-2 flex-wrap"
          >
            <v-checkbox
              v-model="futureOnly"
              label="Départs à venir"
              density="compact"
              hide-details
              @update:model-value="load()"
            />
            <v-spacer />
            <v-btn
              variant="outlined"
              size="small"
              :prepend-icon="mdiRefresh"
              :loading="loading"
              @click="load()"
            >
              Actualiser
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              size="small"
              :prepend-icon="mdiAutoFix"
              :disabled="!autoRepairableRows.length || bulkRunning"
              :loading="bulkRunning"
              @click="repairAll()"
            >
              Réparer les {{ autoRepairableRows.length }} certains
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      density="compact"
      class="mb-4"
      :icon="mdiAlertCircleOutline"
    >
      {{ errorMessage }}
    </v-alert>

    <v-alert
      v-if="bulkSummary"
      type="info"
      variant="tonal"
      density="compact"
      class="mb-4"
    >
      {{ bulkSummary }}
    </v-alert>

    <v-skeleton-loader
      v-if="loading && !rows.length"
      type="table"
    />

    <v-card
      v-else
      rounded="lg"
      class="bo-card"
      elevation="0"
    >
      <v-data-table
        :headers="headers"
        :items="filteredRows"
        :items-per-page="25"
        density="compact"
        item-value="dealId"
        class="bo-table"
      >
        <template #[`item.deal`]="{ item }">
          <div class="d-flex flex-column py-1">
            <a
              :href="`https://odysway90522.activehosted.com/app/deals/${item.dealId}`"
              target="_blank"
              rel="noopener"
              class="text-body-2 font-weight-medium text-decoration-none"
            >
              {{ item.title || 'Deal sans titre' }}
            </a>
            <span class="text-caption text-medium-emphasis">
              #{{ item.dealId }} · {{ item.pipelineTitle }} · {{ item.status }}
              <template v-if="item.seller">· {{ item.seller }}</template>
            </span>
          </div>
        </template>

        <template #[`item.departureDate`]="{ item }">
          <div class="d-flex flex-column">
            <span class="text-body-2">{{ formatDate(item.departureDate) }}</span>
            <span class="text-caption text-medium-emphasis">{{ item.slug || '—' }}</span>
          </div>
        </template>

        <template #[`item.money`]="{ item }">
          <div class="d-flex flex-column">
            <span class="text-body-2">{{ formatEuro(item.restToPay) }}</span>
            <span class="text-caption text-medium-emphasis">
              payé {{ formatEuro(item.totalPaid) }}
            </span>
          </div>
        </template>

        <template #[`item.priority`]="{ item }">
          <v-chip
            size="x-small"
            :color="priorityColor(item.priority)"
            variant="tonal"
          >
            {{ priorityLabel(item.priority) }}
          </v-chip>
        </template>

        <template #[`item.resolution`]="{ item }">
          <div class="d-flex flex-column py-1">
            <v-chip
              size="x-small"
              :color="sourceColor(item.resolution.source)"
              variant="tonal"
              class="align-self-start"
            >
              {{ sourceLabel(item.resolution.source) }}
            </v-chip>
            <span
              v-if="item.resolution.deletedBy"
              class="text-caption text-medium-emphasis mt-1"
            >
              supprimé par {{ item.resolution.deletedBy }} le {{ formatDate(item.resolution.deletedAt) }}
            </span>
            <span
              v-else-if="item.resolution.candidates.length"
              class="text-caption text-medium-emphasis mt-1"
            >
              {{ item.resolution.candidates.length }} date(s) candidate(s)
            </span>
          </div>
        </template>

        <template #[`item.actions`]="{ item }">
          <div class="d-flex ga-1 justify-end">
            <v-chip
              v-if="results[item.dealId]?.ok"
              size="x-small"
              color="success"
              variant="tonal"
            >
              Réparé
            </v-chip>
            <template v-else>
              <v-btn
                size="x-small"
                variant="text"
                :loading="repairing === item.dealId"
                :disabled="!item.resolution.travelDateId || bulkRunning"
                @click="repair(item)"
              >
                Réparer
              </v-btn>
              <v-btn
                size="x-small"
                variant="text"
                :disabled="bulkRunning"
                @click="openDatePicker(item)"
              >
                Choisir la date…
              </v-btn>
            </template>
          </div>
          <div
            v-if="results[item.dealId]?.error"
            class="text-caption text-error text-right"
          >
            {{ results[item.dealId].error }}
          </div>
        </template>

        <template #no-data>
          <div class="pa-6 text-center text-medium-emphasis">
            Aucun lien cassé pour ces filtres.
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Choix manuel de la date -->
    <v-dialog
      v-model="pickerOpen"
      max-width="640"
    >
      <v-card rounded="lg">
        <v-card-title class="text-subtitle-1 font-weight-bold">
          Rattacher le deal #{{ pickerItem?.dealId }}
        </v-card-title>
        <v-card-text>
          <p class="text-body-2 text-medium-emphasis mb-3">
            Départ annoncé sur le deal : <strong>{{ formatDate(pickerItem?.departureDate) }}</strong>
            ({{ pickerItem?.slug || 'voyage inconnu' }})
          </p>
          <v-progress-linear
            v-if="pickerLoading"
            indeterminate
            class="mb-3"
          />
          <v-alert
            v-else-if="!pickerDates.length"
            type="warning"
            variant="tonal"
            density="compact"
          >
            Aucune date de départ trouvée pour ce voyage.
          </v-alert>
          <v-radio-group
            v-else
            v-model="pickerSelection"
            hide-details
          >
            <v-radio
              v-for="date in pickerDates"
              :key="date.id"
              :value="date.id"
            >
              <template #label>
                <span class="text-body-2">
                  {{ formatDate(date.departure_date) }} → {{ formatDate(date.return_date) }}
                  <span class="text-caption text-medium-emphasis">
                    · {{ date.booked_seat }}/{{ date.max_travelers }} places
                    <template v-if="!date.published">· non publiée</template>
                  </span>
                </span>
              </template>
            </v-radio>
          </v-radio-group>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="pickerOpen = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :disabled="!pickerSelection"
            :loading="repairing === pickerItem?.dealId"
            @click="repair(pickerItem, pickerSelection)"
          >
            Réparer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { mdiMagnify, mdiRefresh, mdiAlertCircleOutline, mdiAutoFix } from '@mdi/js'
import { bookingApi, getApiErrorMessage } from '~/utils/bookingApi'

definePageMeta({
  layout: 'booking',
  middleware: 'booking-management',
})

useSeoMeta({
  title: 'Liens de paiement cassés — Backoffice',
  robots: 'noindex, nofollow',
})

const loading = ref(false)
const errorMessage = ref('')
const rows = ref([])
const counts = ref({})
const moneyAtStake = ref(0)
const futureOnly = ref(true)

const search = ref('')
const priorityFilter = ref('all')

const repairing = ref(null)
const results = ref({})
const bulkRunning = ref(false)
const bulkSummary = ref('')

const pickerOpen = ref(false)
const pickerItem = ref(null)
const pickerDates = ref([])
const pickerSelection = ref(null)
const pickerLoading = ref(false)

const headers = [
  { title: 'Deal', key: 'deal', sortable: false },
  { title: 'Départ', key: 'departureDate', sortable: true },
  { title: 'Reste à payer', key: 'money', sortable: false },
  { title: 'Priorité', key: 'priority', sortable: true, width: 110 },
  { title: 'Date retrouvée', key: 'resolution', sortable: false },
  { title: '', key: 'actions', sortable: false, align: 'end', width: 210 },
]

const priorityItems = [
  { title: 'Toutes', value: 'all' },
  { title: 'Critiques (acompte déjà versé)', value: 'critical' },
  { title: 'Importantes (deal ouvert)', value: 'high' },
  { title: 'Faibles', value: 'low' },
]

const load = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const data = await bookingApi.getBrokenLinks({ futureOnly: futureOnly.value ? 'true' : 'false' })
    rows.value = data.rows || []
    counts.value = data.counts || {}
    moneyAtStake.value = data.moneyAtStake || 0
  }
  catch (err) {
    errorMessage.value = getApiErrorMessage(err, 'Impossible de charger les liens cassés.')
  }
  finally {
    loading.value = false
  }
}

const filteredRows = computed(() => {
  const query = search.value?.toLowerCase().trim()
  return rows.value.filter((row) => {
    if (priorityFilter.value !== 'all' && row.priority !== priorityFilter.value) return false
    if (!query) return true
    return [row.title, row.slug, row.seller, row.dealId]
      .some(value => String(value ?? '').toLowerCase().includes(query))
  })
})

// Seules les lignes dont la date est certaine (journal d'activité ou date de
// départ identique) partent en réparation de masse.
const autoRepairableRows = computed(() =>
  filteredRows.value.filter(row => row.resolution.autoRepairable && !results.value[row.dealId]?.ok),
)

const kpis = computed(() => [
  { label: 'Liens cassés', value: rows.value.length },
  { label: 'Acompte déjà versé', value: counts.value.critical ?? 0, color: 'error' },
  { label: 'Date retrouvée avec certitude', value: counts.value.autoRepairable ?? 0, color: 'success' },
  { label: 'Solde bloqué (acompte versé)', value: formatEuro(moneyAtStake.value), color: 'error' },
])

const repair = async (item, travelDateId = null) => {
  if (!item) return
  repairing.value = item.dealId
  results.value = { ...results.value, [item.dealId]: {} }
  try {
    const res = await bookingApi.repairBrokenLink({
      dealId: item.dealId,
      travelDateId: travelDateId || item.resolution.travelDateId,
    })
    results.value = { ...results.value, [item.dealId]: { ok: true, ...res } }
    pickerOpen.value = false
    return true
  }
  catch (err) {
    results.value = {
      ...results.value,
      [item.dealId]: { ok: false, error: getApiErrorMessage(err, 'Réparation impossible.') },
    }
    return false
  }
  finally {
    repairing.value = null
  }
}

// Séquentiel volontairement : chaque réparation écrit dans AC et recalcule les
// places de sa date, en parallèle on multiplierait les courses de sièges.
const repairAll = async () => {
  const targets = [...autoRepairableRows.value]
  if (!targets.length) return
  bulkRunning.value = true
  bulkSummary.value = ''
  let ok = 0
  let failed = 0
  for (const item of targets) {
    const success = await repair(item)
    if (success) ok++
    else failed++
    bulkSummary.value = `Réparation en cours… ${ok + failed}/${targets.length}`
  }
  bulkRunning.value = false
  bulkSummary.value = `${ok} lien(s) réparé(s)${failed ? `, ${failed} en échec` : ''}.`
}

const openDatePicker = async (item) => {
  pickerItem.value = item
  pickerSelection.value = item.resolution.travelDateId || null
  pickerDates.value = []
  pickerOpen.value = true

  if (!item.slug) return
  pickerLoading.value = true
  try {
    const dates = await bookingApi.getDatesBySlug(item.slug)
    pickerDates.value = (dates || [])
      .filter(date => !date.deleted)
      .sort((a, b) => new Date(a.departure_date) - new Date(b.departure_date))
  }
  catch (err) {
    errorMessage.value = getApiErrorMessage(err, 'Impossible de charger les dates de ce voyage.')
  }
  finally {
    pickerLoading.value = false
  }
}

const SOURCE_LABELS = {
  activity_log: 'Journal BMS',
  exact_date: 'Date identique',
  near_date: 'Date proche (±2j)',
  ambiguous: 'Plusieurs dates',
  none: 'Introuvable',
}
const SOURCE_COLORS = {
  activity_log: 'success',
  exact_date: 'success',
  near_date: 'warning',
  ambiguous: 'warning',
  none: 'grey',
}
const sourceLabel = source => SOURCE_LABELS[source] || source
const sourceColor = source => SOURCE_COLORS[source] || 'grey'

const PRIORITY_LABELS = { critical: 'Critique', high: 'Important', low: 'Faible' }
const PRIORITY_COLORS = { critical: 'error', high: 'warning', low: 'grey' }
const priorityLabel = priority => PRIORITY_LABELS[priority] || priority
const priorityColor = priority => PRIORITY_COLORS[priority] || 'grey'

const formatEuro = value =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
    .format(Number(value) || 0)

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('fr-FR')
}

onMounted(load)
</script>

<style scoped>
.bo-table :deep(td) {
  vertical-align: top;
}
</style>
