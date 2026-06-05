<template>
  <v-card
    rounded="lg"
    elevation="0"
    class="bo-card"
  >
    <v-card-title class="pb-0 d-flex align-center ga-2">
      <v-icon
        size="18"
        color="secondary"
      >
        {{ mdiCurrencyEur }}
      </v-icon>
      Marges du départ
      <v-spacer />
      <v-btn
        icon
        size="x-small"
        variant="text"
        :loading="loading"
        @click="fetchMargin"
      >
        <v-icon size="16">
          {{ mdiRefresh }}
        </v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text>
      <div
        v-if="loading && !breakdown"
        class="d-flex justify-center py-4"
      >
        <v-progress-circular
          indeterminate
          size="24"
          color="primary"
        />
      </div>

      <template v-else-if="breakdown">
        <!-- Marge estimée -->
        <div class="d-flex align-center justify-space-between py-2">
          <div>
            <div class="text-body-2 font-weight-bold">
              Marge estimée
            </div>
            <div class="text-caption text-medium-emphasis">
              Somme des marges AC des deals
            </div>
          </div>
          <div class="text-body-1 font-weight-bold">
            {{ formatEur(breakdown.estimated) }}
          </div>
        </div>

        <v-divider class="my-2" />

        <!-- Marge réelle -->
        <div class="d-flex align-center justify-space-between py-2">
          <div>
            <div class="text-body-2 font-weight-bold d-flex align-center ga-1">
              Marge réelle
              <v-chip
                v-if="breakdown.is_finished"
                color="success"
                label
                size="x-small"
              >
                Calculée
              </v-chip>
              <v-chip
                v-else
                color="info"
                label
                size="x-small"
              >
                Prévisionnelle
              </v-chip>
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ realMarginExplanation }}
            </div>
          </div>
          <div
            class="text-body-1 font-weight-bold"
            :class="breakdown.real === null ? 'text-medium-emphasis' : ''"
          >
            {{ breakdown.real !== null ? formatEur(breakdown.real) : '—' }}
          </div>
        </div>

        <v-divider class="my-2" />

        <!-- KPI Cross-check : CA − Total factures -->
        <div class="d-flex align-center justify-space-between py-2">
          <div>
            <div class="text-body-2 font-weight-bold d-flex align-center ga-1">
              CA − Factures
              <v-tooltip location="top">
                <template #activator="{ props: tipProps }">
                  <v-icon
                    v-bind="tipProps"
                    size="14"
                    color="grey"
                  >
                    {{ mdiInformationOutline }}
                  </v-icon>
                </template>
                CA = somme des `total_value` des deals payés (CA facturé, pas encaissé).<br>
                Factures = somme des montants saisis dans la section Factures.<br>
                Différence à comparer avec la marge réelle pour vérifier la cohérence.
              </v-tooltip>
              <v-chip
                v-if="crossCheckColor === 'success'"
                color="success"
                label
                size="x-small"
                variant="tonal"
              >
                Cohérent
              </v-chip>
              <v-chip
                v-else-if="crossCheckColor === 'warning'"
                color="warning"
                label
                size="x-small"
                variant="tonal"
              >
                Écart {{ formatPct(crossCheckRatio) }}
              </v-chip>
            </div>
            <div class="text-caption text-medium-emphasis">
              CA: {{ formatEur(breakdown.ca) }} · Factures: {{ formatEur(breakdown.total_invoices) }}
            </div>
          </div>
          <div
            class="text-body-1 font-weight-bold"
            :style="`color: ${crossCheckColor === 'warning' ? 'rgb(var(--v-theme-warning))' : 'inherit'};`"
          >
            {{ formatEur(crossCheckValue) }}
          </div>
        </div>

        <!-- Détail repliable -->
        <v-expansion-panels
          variant="accordion"
          class="mt-2"
        >
          <v-expansion-panel>
            <v-expansion-panel-title class="text-caption">
              Détail du calcul de la marge réelle
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="text-body-2">
                <div class="d-flex justify-space-between py-1">
                  <span class="text-medium-emphasis">Voyageurs réels</span>
                  <span>{{ breakdown.real_pax }}<span
                    v-if="breakdown.real_traveler_count_override !== null"
                    class="text-caption text-warning ml-1"
                  >(override)</span></span>
                </div>
                <div class="d-flex justify-space-between py-1">
                  <span class="text-medium-emphasis">Marge / voyageur (base)</span>
                  <span>
                    {{ formatEur(breakdown.base_margin_per_pax) }}
                    <span
                      v-if="breakdown.base_margin_source"
                      class="text-caption text-medium-emphasis ml-1"
                    >({{ baseMarginSourceLabel }})</span>
                  </span>
                </div>
                <div class="d-flex justify-space-between py-1">
                  <span class="text-medium-emphasis">+ Base × pax</span>
                  <span>{{ formatEur((breakdown.base_margin_per_pax || 0) * breakdown.real_pax) }}</span>
                </div>
                <div class="d-flex justify-space-between py-1">
                  <span class="text-medium-emphasis">+ Marges add. (vol + assurance + extra)</span>
                  <span>{{ formatEur(breakdown.additional_margins) }}</span>
                </div>
                <div
                  v-if="breakdown.promo_deductions > 0"
                  class="d-flex justify-space-between py-1"
                >
                  <span class="text-medium-emphasis">− Réductions appliquées</span>
                  <span>− {{ formatEur(breakdown.promo_deductions) }}</span>
                </div>
                <v-divider class="my-1" />
                <div class="d-flex justify-space-between py-1 font-weight-bold">
                  <span>= Marge réelle</span>
                  <span>{{ breakdown.real !== null ? formatEur(breakdown.real) : '—' }}</span>
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-alert
          v-if="breakdown.base_margin_per_pax === null"
          type="warning"
          density="compact"
          variant="tonal"
          class="mt-2"
        >
          Pas de marge configurée pour {{ breakdown.real_pax }} pax.
          <NuxtLink
            :to="`/booking-management/margins/${slug}`"
            class="text-warning"
          >
            Configurer le tableau →
          </NuxtLink>
        </v-alert>

        <v-divider class="my-3" />

        <v-btn
          size="small"
          variant="tonal"
          block
          @click="overrideOpen = true"
        >
          {{ hasOverride ? 'Modifier l\'override' : 'Override pour cette date' }}
        </v-btn>
      </template>
    </v-card-text>

    <!-- Override dialog -->
    <v-dialog
      v-model="overrideOpen"
      max-width="480"
    >
      <v-card rounded="lg">
        <v-card-title>Override de marge pour cette date</v-card-title>
        <v-card-text>
          <p class="text-body-2 text-medium-emphasis mb-3">
            Ces valeurs prennent la priorité sur le tableau de marge du voyage. Laissez vide pour utiliser les valeurs par défaut.
          </p>
          <v-text-field
            v-model.number="overrideForm.margin_override_per_traveler"
            label="Marge par voyageur (€) — override"
            type="number"
            density="compact"
            variant="outlined"
            hide-details="auto"
            class="mb-3"
            clearable
          />
          <v-text-field
            v-model.number="overrideForm.real_traveler_count_override"
            label="Nombre de voyageurs réels — override"
            type="number"
            density="compact"
            variant="outlined"
            hide-details="auto"
            placeholder="Par défaut : calculé automatiquement"
            clearable
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="overrideOpen = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="primary"
            :loading="overrideSaving"
            @click="saveOverride"
          >
            Enregistrer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { mdiCurrencyEur, mdiRefresh, mdiInformationOutline } from '@mdi/js'
import { bookingApi, getApiErrorMessage } from '~/utils/bookingApi'
import { formatEur } from '~/utils/formatNumber'

const props = defineProps({
  slug: { type: String, required: true },
  dateId: { type: String, required: true },
})

const breakdown = ref(null)
const loading = ref(true)
const overrideOpen = ref(false)
const overrideSaving = ref(false)
const overrideForm = reactive({
  margin_override_per_traveler: null,
  real_traveler_count_override: null,
})

function formatPct(ratio) {
  if (ratio === null || ratio === undefined || Number.isNaN(ratio)) return '—'
  return new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 0 }).format(Math.abs(ratio))
}

const hasOverride = computed(() => {
  return breakdown.value && (
    breakdown.value.margin_override_per_traveler !== null
    || breakdown.value.real_traveler_count_override !== null
  )
})

const realMarginExplanation = computed(() => {
  if (!breakdown.value) return ''
  if (breakdown.value.base_margin_per_pax === null) return 'Tableau de marge non configuré'
  return `(${formatEur(breakdown.value.base_margin_per_pax)} × ${breakdown.value.real_pax}) + add. − promo`
})

const baseMarginSourceLabel = computed(() => {
  if (!breakdown.value) return ''
  if (breakdown.value.base_margin_source === 'override') return 'override date'
  if (breakdown.value.base_margin_source === 'pax') {
    return breakdown.value.base_margin_source_year
      ? `tableau pax — saison ${breakdown.value.base_margin_source_year}`
      : 'tableau pax'
  }
  return ''
})

const crossCheckValue = computed(() => {
  if (!breakdown.value) return 0
  return Number(breakdown.value.ca || 0) - Number(breakdown.value.total_invoices || 0)
})

// Compare CA-Factures to Marge réelle: relative gap vs the real margin.
const crossCheckRatio = computed(() => {
  if (!breakdown.value || breakdown.value.real == null || breakdown.value.real === 0) return null
  return (crossCheckValue.value - breakdown.value.real) / breakdown.value.real
})

const crossCheckColor = computed(() => {
  if (!breakdown.value || breakdown.value.real == null) return null
  if (crossCheckRatio.value == null) return null
  // ±10% tolerance: within → "Cohérent" chip (green), outside → "Écart" chip (yellow).
  return Math.abs(crossCheckRatio.value) <= 0.1 ? 'success' : 'warning'
})

async function fetchMargin() {
  loading.value = true
  try {
    breakdown.value = await bookingApi.getDateMargin(props.slug, props.dateId)
    overrideForm.margin_override_per_traveler = breakdown.value.margin_override_per_traveler
    overrideForm.real_traveler_count_override = breakdown.value.real_traveler_count_override
  }
  catch (err) {
    console.error('DateMarginCard fetch error:', getApiErrorMessage(err))
  }
  finally {
    loading.value = false
  }
}

async function saveOverride() {
  overrideSaving.value = true
  try {
    await bookingApi.updateMarginOverride(props.slug, props.dateId, {
      margin_override_per_traveler: overrideForm.margin_override_per_traveler,
      real_traveler_count_override: overrideForm.real_traveler_count_override,
    })
    overrideOpen.value = false
    await fetchMargin()
  }
  catch (err) {
    alert(getApiErrorMessage(err, 'Erreur lors de l\'enregistrement.'))
  }
  finally {
    overrideSaving.value = false
  }
}

defineExpose({ refresh: fetchMargin })

watch(() => props.dateId, fetchMargin)
onMounted(fetchMargin)
</script>
