<template>
  <section class="bo-card">
    <div class="bo-card__head">
      <h2 class="bo-card__title">
        {{ subtitle || title }}
      </h2>
      <slot name="top-actions" />
      <v-spacer />
      <v-switch
        v-model="localForm.published"
        label="Publiée sur le site"
        hide-details
      />
    </div>

    <div class="bo-card__body">
      <!-- Nature de la date -->
      <div class="bo-section">
        <div class="bo-row mb-3">
          <span
            class="bo-tag"
            :class="localForm.published ? 'bo-tag--ok' : 'bo-tag--warn'"
          >
            <span class="bo-dot" />
            {{ localForm.published ? 'Visible sur le site' : 'Non publiée' }}
          </span>
          <template v-if="allowIndividual">
            <v-switch
              v-model="localForm.is_indiv_travel"
              label="Voyage individuel"
              hide-details
            />
            <span
              v-if="localForm.is_indiv_travel"
              class="bo-tag bo-tag--info"
            >Individuel</span>
          </template>
        </div>
        <slot name="travel" />
      </div>

      <!-- Calendrier -->
      <div class="bo-section">
        <p class="bo-eyebrow">
          Calendrier
        </p>
        <div class="bo-grid-2">
          <v-text-field
            v-model="localForm.departure_date"
            label="Date de départ"
            type="date"
          />
          <div>
            <v-text-field
              v-model="localForm.return_date"
              label="Date de retour"
              type="date"
            />
            <p
              v-if="nightsCount !== null"
              class="bo-hint mt-1 mb-0"
            >
              {{ nightsCount }} nuit{{ nightsCount > 1 ? 's' : '' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Capacité -->
      <div class="bo-section">
        <p class="bo-eyebrow">
          Capacité
        </p>
        <div class="bo-grid-3">
          <v-text-field
            v-model="localForm.min_travelers"
            label="Voyageurs min."
            type="number"
            min="0"
          />
          <v-text-field
            v-model="localForm.max_travelers"
            label="Voyageurs max."
            type="number"
            min="0"
          />
          <div>
            <v-text-field
              :model-value="localForm.booked_seat ?? 0"
              label="Places réservées"
              type="number"
              :readonly="readonlyBookedSeat"
              @update:model-value="value => { if (!readonlyBookedSeat) localForm.booked_seat = value }"
            />
            <p class="bo-hint mt-1 mb-0">
              Calculé depuis les réservations
            </p>
          </div>
        </div>
      </div>

      <!-- Tarification -->
      <div class="bo-section">
        <p class="bo-eyebrow">
          Tarification
        </p>
        <div class="bo-grid-3">
          <v-text-field
            v-model="localForm.starting_price"
            label="Prix à partir de"
            type="number"
            min="0"
            suffix="€"
          />
          <v-text-field
            v-if="localForm.include_flight"
            v-model="localForm.flight_price"
            label="Prix du vol"
            type="number"
            min="0"
            suffix="€"
          />
          <div>
            <div class="bo-readonly-field">
              <span class="bo-readonly-field__k">Statut automatique</span>
              <span class="bo-readonly-field__v">{{ statusLabel(localForm.status) }}</span>
            </div>
          </div>
        </div>

        <div class="bo-switches mt-4">
          <div>
            <v-switch
              v-model="localForm.include_flight"
              label="Vol inclus"
              hide-details
            />
          </div>
          <div>
            <v-switch
              v-model="localForm.early_bird"
              label="Early bird"
              hide-details
            />
            <p class="bo-hint mb-0">
              Visible si la date est à +7 mois
            </p>
          </div>
          <div>
            <v-switch
              v-model="localForm.last_minute"
              label="Last minute"
              hide-details
            />
            <p class="bo-hint mb-0">
              Visible si la date est à -1 mois
            </p>
          </div>
          <div>
            <v-switch
              v-model="hasCustomBadge"
              label="Badge personnalisé"
              hide-details
            />
          </div>
        </div>

        <Transition name="bo-slide-fade">
          <v-text-field
            v-if="hasCustomBadge"
            v-model="localForm.badges"
            label="Texte du badge"
            class="mt-3"
            style="max-width: 320px;"
          />
        </Transition>
      </div>

      <!--
        Ce que voit le client peut différer de la réalité opérationnelle.
        C'est le piège n°1 de cet écran : le bloc est isolé pour qu'on ne
        modifie jamais une valeur affichée en croyant toucher la vraie.
      -->
      <div class="bo-section">
        <div class="bo-override">
          <p class="bo-eyebrow">
            Valeurs affichées au client
          </p>
          <div class="bo-grid-3">
            <v-select
              v-model="localForm.displayed_status"
              :items="[{ label: '— Statut automatique —', value: null }, ...statusOptions]"
              item-title="label"
              item-value="value"
              label="Statut affiché"
              clearable
            />
            <v-select
              v-model="localForm.displayed_booked_seat"
              :items="bookedSeatOptions"
              label="Places réservées affichées"
              clearable
            />
            <v-select
              v-model="localForm.co_filling"
              :items="bookedSeatOptions"
              label="Co-remplissage"
              clearable
            />
          </div>
          <p class="bo-hint mt-2 mb-0">
            {{ overrideSummary }}
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="$slots.actions"
      class="bo-card__foot"
    >
      <slot name="actions" />
    </div>
  </section>
</template>

<script setup>
import dayjs from 'dayjs'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  statusOptions: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: 'Date de voyage',
  },
  subtitle: {
    type: String,
    default: 'Configuration',
  },
  allowIndividual: {
    type: Boolean,
    default: true,
  },
  readonlyBookedSeat: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const clone = value => JSON.parse(JSON.stringify(value || {}))

const localForm = ref(clone(props.modelValue))
const hasCustomBadge = ref(!!localForm.value.badges || !!localForm.value.displayed_badges)
const syncingFromProp = ref(false)

// Generate options for booked seats (0 to 20)
const bookedSeatOptions = Array.from({ length: 21 }, (_, i) => i)

watch(
  () => props.modelValue,
  (val) => {
    syncingFromProp.value = true
    localForm.value = clone(val)
    hasCustomBadge.value = !!val?.badges
    localForm.value.displayed_badges = val?.displayed_badges || val?.badges
    nextTick(() => {
      syncingFromProp.value = false
    })
  },
  { deep: true },
)

watch(
  localForm,
  (val) => {
    if (syncingFromProp.value) return
    if (val.displayed_booked_seat === null || val.displayed_booked_seat === undefined) {
      val.displayed_booked_seat = 0
    }
    if (val.co_filling === null || val.co_filling === undefined) {
      val.co_filling = 0
    }
    emit('update:modelValue', val)
  },
  { deep: true },
)

watch(
  () => localForm.value.displayed_booked_seat,
  (newValue) => {
    if ((newValue === null || newValue === undefined) && !syncingFromProp.value) {
      localForm.value.displayed_booked_seat = 0
    }
  },
)

watch(
  () => localForm.value.co_filling,
  (newValue) => {
    if ((newValue === null || newValue === undefined) && !syncingFromProp.value) {
      localForm.value.co_filling = 0
    }
  },
)

watch(hasCustomBadge, (enabled) => {
  if (!enabled) {
    localForm.value.badges = ''
  }
})

const statusLabel = s =>
  props.statusOptions.find(o => o.value === s)?.label || s || '—'

const nightsCount = computed(() => {
  const { departure_date: dep, return_date: ret } = localForm.value
  if (!dep || !ret) return null
  const nights = dayjs(ret).diff(dayjs(dep), 'day')
  return nights >= 0 ? nights : null
})

// Dire en clair ce que le site affichera, pour qu'on n'ait pas à le déduire.
const overrideSummary = computed(() => {
  const real = localForm.value.booked_seat ?? 0
  const shown = (localForm.value.displayed_booked_seat || 0) + (localForm.value.co_filling || 0)
  const max = localForm.value.max_travelers || '?'
  const realStatus = statusLabel(localForm.value.status)
  const shownStatus = localForm.value.displayed_status
    ? statusLabel(localForm.value.displayed_status)
    : realStatus

  if (!shown && !localForm.value.displayed_status) {
    return `Le site affiche les valeurs réelles : ${real}/${max} places · ${realStatus}.`
  }
  return `Le site affiche ${shown || real}/${max} places · ${shownStatus}, alors que la réalité est ${real}/${max} · ${realStatus}.`
})
</script>

<style scoped>
.bo-card__foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 14px;
  border-top: 1px solid var(--bo-line-soft);
}

.bo-switches {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

/* Même famille visuelle que les champs voisins, sinon il flotte hors grille. */
.bo-readonly-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 9px;
  height: 32px;
  justify-content: center;
  background: var(--bo-field);
  border: 1px solid var(--bo-field-line);
  border-radius: var(--bo-radius);
}

.bo-readonly-field__k {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--bo-ink-3);
}

.bo-readonly-field__v {
  font-size: 12.5px;
  font-weight: 500;
}

.bo-slide-fade-enter-active,
.bo-slide-fade-leave-active {
  transition: all 0.2s ease-out;
}

.bo-slide-fade-enter-from,
.bo-slide-fade-leave-to {
  transform: translateY(8px);
  opacity: 0;
}
</style>
