<template>
  <v-card
    rounded="xl"
    elevation="6"
    class="pa-6 glass-surface"
  >
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-3">
      <div class="d-flex flex-column">
        <span class="text-overline text-primary">{{ title }}</span>
        <span class="text-h6 font-weight-bold">{{ subtitle }}</span>
      </div>
      <div class="d-flex ga-2">
        <slot name="top-actions" />
      </div>
    </div>

    <v-row class="">
      <v-col
        cols="12"
        md="7"
        class="d-flex flex-column ga-4"
      >
        <v-card
          variant="text"
          class="pa-4 glass-subtle rounded-lg"
        >
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="d-flex align-center ga-3">
              <v-switch
                v-model="localForm.published"
                color="primary"
                label="Publiée"
                inset
                density="comfortable"
              />
              <v-chip
                :color="localForm.published ? 'green-light' : 'warning'"
                size="small"
                :variant="localForm.published ? 'flat' : 'outlined'"
              >
                {{ localForm.published ? 'Visible sur le site' : 'Non publiée' }}
              </v-chip>
            </div>
            <v-chip
              v-if="localForm.is_indiv_travel"
              color="blue"
              size="small"
              variant="flat"
            >
              Voyage individuel
            </v-chip>
          </div>

          <div class="d-flex align-center ga-3 flex-wrap">
            <v-switch
              v-if="allowIndividual"
              v-model="localForm.is_indiv_travel"
              color="green-light"
              label="Voyage individuel"
              inset
              density="comfortable"
            />
            <slot name="travel" />
          </div>
        </v-card>

        <v-card
          variant="text"
          class="pa-4 glass-subtle rounded-lg"
        >
          <div class="text-subtitle-2 text-medium-emphasis mb-2">
            Statuts & affichage
          </div>
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-select
                v-model="localForm.status"
                :items="statusOptions"
                item-title="label"
                item-value="value"
                label="Statut (lecture seule)"
                density="comfortable"
                readonly
              />
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
                label="Statut affiché (override)"
                density="comfortable"
                clearable
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="localForm.booked_seat"
                label="Places réservées (lecture seule)"
                type="number"
                min="0"
                density="comfortable"
                readonly
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="localForm.displayed_booked_seat"
                label="Places réservées (override)"
                type="number"
                min="0"
                density="comfortable"
              />
            </v-col>
          </v-row>
        </v-card>

        <v-card
          variant="text"
          class="pa-4 glass-subtle rounded-lg"
        >
          <div class="text-subtitle-2 text-medium-emphasis mb-2">
            Dates & capacité
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
                density="comfortable"
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
                density="comfortable"
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
                density="comfortable"
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
                density="comfortable"
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
                density="comfortable"
              />
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <v-col
        cols="12"
        md="5"
        class="d-flex flex-column ga-4"
      >
        <v-card
          variant="text"
          class="pa-4 glass-subtle rounded-lg"
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
                color="green-light"
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
                color="green-light"
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
                  density="comfortable"
                />
              </TransitionGroup>
            </v-col>

            <v-col
              cols="12"
              md="6"
            >
              <v-switch
                v-model="hasCustomBadge"
                color="green-light"
                label="Badge"
                inset
                density="compact"
              />
              <Transition name="slide-fade">
                <v-text-field
                  v-if="hasCustomBadge"
                  v-model="localForm.badges"
                  label="Texte du badge"
                  density="comfortable"
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
const hasCustomBadge = ref(!!localForm.value.badges)
const syncingFromProp = ref(false)

watch(
  () => props.modelValue,
  (val) => {
    syncingFromProp.value = true
    localForm.value = clone(val)
    hasCustomBadge.value = !!val?.badges
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
    emit('update:modelValue', val)
  },
  { deep: true },
)

watch(hasCustomBadge, (enabled) => {
  if (!enabled) {
    localForm.value.badges = ''
  }
})
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
