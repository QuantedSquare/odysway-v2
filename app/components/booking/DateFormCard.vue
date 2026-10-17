<template>
  <v-card
    rounded="lg"
    elevation="0"
    class="pa-5 bo-card"
  >
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-3">
      <div class="d-flex flex-column">
        <span class="bo-section-title">{{ title }}</span>
        <span class="text-subtitle-1 font-weight-bold">{{ subtitle }}</span>
      </div>
      <div class="d-flex ga-2">
        <slot name="top-actions" />
      </div>
    </div>

    <v-row>
      <v-col
        cols="12"
        md="12"
        class="d-flex flex-column ga-4"
      >
        <v-card
          variant="text"
          class="pa-4 rounded-lg"
        >
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="d-flex align-center ga-3">
              <v-switch
                v-model="localForm.published"
                color="success"
                label="Publiée"
                inset
                density="compact"
              />
              <v-chip
                :color="localForm.published ? 'green-light' : 'warning'"
                size="small"
                :variant="localForm.published ? 'flat' : 'outlined'"
              >
                {{ localForm.published ? 'Visible sur le site' : 'Non publiée' }}
              </v-chip>

              <v-switch
                v-if="allowIndividual"
                v-model="localForm.is_indiv_travel"
                color="blue"
                label="Voyage individuel"
                inset
                density="compact"
              /> <v-chip
                v-if="localForm.is_indiv_travel"
                color="blue"
                size="small"
                variant="flat"
              >
                Voyage individuel
              </v-chip>
            </div>
          </div>
          <slot name="travel" />
        </v-card>

        <v-card
          variant="text"
          class="pa-4  rounded-lg"
        >
          <div class="text-subtitle-2 text-medium-emphasis mb-2">
            Dates & Prix
          </div>
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="localForm.departure_date"
                label="Date de départ"
                type="date"
                density="compact"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="localForm.return_date"
                label="Date de retour"
                type="date"
                density="compact"
              />
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <v-text-field
                v-model="localForm.min_travelers"
                label="Voyageurs min"
                type="number"
                min="0"
                density="compact"
              />
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <v-text-field
                v-model="localForm.max_travelers"
                label="Voyageurs max"
                type="number"
                min="0"
                density="compact"
              />
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <v-text-field
                v-model="localForm.starting_price"
                label="Prix de départ"
                prefix="€"
                type="number"
                min="0"
                density="compact"
              />
            </v-col>
          </v-row>
        </v-card>
        <v-card
          variant="text"
          class="pa-4  rounded-lg "
        >
          <div class="text-subtitle-2 text-medium-emphasis mb-2">
            Statuts & affichage
          </div>
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-sheet
                rounded="lg"
                class="pa-3 d-flex align-center ga-3"
                color="grey-lighten-4"
              >
                <v-avatar
                  :color="statusColor(localForm.status)"
                  size="40"
                  variant="tonal"
                >
                  <v-icon>{{ statusIcon(localForm.status) }}</v-icon>
                </v-avatar>
                <div class="d-flex flex-column">
                  <span class="text-caption text-medium-emphasis">Statut automatique</span>
                  <span class="text-subtitle-1 font-weight-bold">
                    {{ statusLabel(localForm.status) }}
                  </span>
                </div>
              </v-sheet>
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-sheet
                rounded="lg"
                class="pa-3 d-flex align-center ga-3"
                color="grey-lighten-4"
              >
                <v-avatar
                  color="primary"
                  size="40"
                  variant="tonal"
                >
                  <v-icon>{{ mdiAccountGroup }}</v-icon>
                </v-avatar>
                <div class="d-flex flex-column flex-grow-1">
                  <span class="text-caption text-medium-emphasis">Places réservées (automatique)</span>
                  <div class="d-flex align-baseline ga-1">
                    <span class="text-h6 font-weight-bold">{{ localForm.booked_seat ?? 0 }}</span>
                    <span
                      v-if="localForm.max_travelers"
                      class="text-caption text-medium-emphasis"
                    >
                      / {{ localForm.max_travelers }}
                    </span>
                  </div>
                </div>
              </v-sheet>
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-select
                v-model="localForm.displayed_status"
                :items="[{ label: '— Utiliser le statut par défaut —', value: null }, ...statusOptions]"
                item-title="label"
                item-value="value"
                label="Statut affiché (custom)"
                density="compact"
                clearable
              />
            </v-col>

            <v-col
              cols="12"
              md="6"
            >
              <v-select
                v-model="localForm.displayed_booked_seat"
                :items="bookedSeatOptions"
                label="Places réservées (custom)"
                density="compact"
                clearable
              />
            </v-col>
            <v-col
              cols="12"
            >
              <v-select
                v-model="localForm.co_filling"
                :items="bookedSeatOptions"
                label="Co-remplissage"
                density="compact"
                clearable
              />
              <div class="text-caption font-weight-regular">
                Voyageurs d'autres agences sur ce départ. S'ajoute aux places réservées automatiques.
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <v-col
        cols="12"
        class="d-flex flex-column ga-4"
      >
        <v-card
          variant="text"
          class="pa-4  rounded-lg"
        >
          <div class="text-subtitle-2 text-medium-emphasis mb-2">
            Badges & options
          </div>
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-switch
                v-model="localForm.early_bird"
                color="success"
                label="Early Bird"
                inset
                density="compact"
              />
              <div class="text-caption text-medium-emphasis">
                Visible si la date est à +7 mois.
              </div>
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-switch
                v-model="localForm.last_minute"
                color="success"
                label="Last Minute"
                inset
                density="compact"
              />
              <div class="text-caption text-medium-emphasis">
                Visible si la date est à -1 mois.
              </div>
            </v-col>
          </v-row>

          <v-row class="mt-2">
            <v-col
              cols="12"
              md="6"
            >
              <v-switch
                v-model="localForm.include_flight"
                label="Vol inclus"
                inset
                color="success"
                density="compact"
              />
              <TransitionGroup name="slide-fade">
                <v-text-field
                  v-if="localForm.include_flight"
                  v-model="localForm.flight_price"
                  label="Prix du vol"
                  type="number"
                  min="0"
                  prefix="€"
                  density="compact"
                />
              </TransitionGroup>
            </v-col>

            <v-col
              cols="12"
              md="6"
            >
              <v-switch
                v-model="hasCustomBadge"
                color="success"
                label="Badge"
                inset
                density="compact"
              />
              <Transition name="slide-fade">
                <v-text-field
                  v-if="hasCustomBadge"
                  v-model="localForm.badges"
                  label="Texte du badge"
                  density="compact"
                />
              </Transition>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <div class="d-flex justify-end mt-6 ga-3">
      <slot name="actions" />
    </div>
  </v-card>
</template>

<script setup>
import { mdiAccountGroup, mdiCheckCircle, mdiClockOutline, mdiLock, mdiHelpCircle } from '@mdi/js'

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

const statusColor = s => ({
  confirmed: 'green',
  soon_confirmed: 'orange',
  guaranteed: 'red',
}[s] || 'grey')

const statusIcon = s => ({
  confirmed: mdiCheckCircle,
  soon_confirmed: mdiClockOutline,
  guaranteed: mdiLock,
}[s] || mdiHelpCircle)

const statusLabel = s =>
  props.statusOptions.find(o => o.value === s)?.label || s
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s ease-in-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(12px);
  opacity: 0;
}
</style>
