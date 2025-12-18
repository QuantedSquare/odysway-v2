<template>
  <v-card
    rounded="lg"
    elevation="4"
    class="pa-4 glass-surface"
  >
    <v-card-title class="d-flex align-center justify-space-between pb-2">
      <div class="d-flex flex-column">
        <span class="text-overline text-primary">{{ title }}</span>
        <span class="text-h6 font-weight-bold">{{ subtitle }}</span>
      </div>
      <div class="d-flex ga-2">
        <slot name="top-actions" />
      </div>
    </v-card-title>
    <v-divider class="mb-4" />
    <v-card-text class="pt-0">
      <v-row>
        <v-col
          cols="12"
          md="6"
          class="d-flex flex-column ga-3"
        >
          <div class="d-flex flex-column ga-2">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center ga-2">
                <v-switch
                  v-model="localForm.published"
                  color="primary"
                  label="Publiée"
                  inset
                  density="compact"
                />
                <v-chip
                  v-if="localForm.published"
                  color="green-light"
                  size="small"
                  variant="flat"
                >
                  Visible sur le site
                </v-chip>
                <v-chip
                  v-else
                  color="warning"
                  size="small"
                  variant="outlined"
                >
                  Non publiée
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

            <div class="d-flex align-center ga-3">
              <v-switch
                v-if="allowIndividual"
                v-model="localForm.is_indiv_travel"
                color="green-light"
                label="Voyage individuel"
                inset
                density="compact"
                :hint="'La date n\'apparaîtra pas sur le site public.'"
                persistent-hint
              />
              <slot name="travel" />
            </div>
          </div>

          <v-text-field
            v-model="localForm.status"
            label="Statut (lecture seule)"
            density="comfortable"
            readonly
          />
          <v-select
            v-model="localForm.displayed_status"
            :items="statusOptions"
            item-title="label"
            item-value="value"
            label="Statut affiché (override)"
            density="comfortable"
            clearable
          />

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
          </v-row>

          <v-row>
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
                v-model="localForm.booked_seat"
                label="Places réservées"
                type="number"
                min="0"
                density="comfortable"
                readonly
              />
            </v-col>
          </v-row>

          <v-text-field
            v-model="localForm.starting_price"
            label="Prix de départ"
            prefix="€"
            type="number"
            min="0"
            density="comfortable"
          />
        </v-col>

        <v-col
          cols="12"
          md="6"
          class="d-flex flex-column ga-4"
        >
          <v-card
            variant="text"
            class="pa-4 glass-subtle"
          >
            <v-card-title class="text-subtitle-1 font-weight-bold px-0">
              Badges & options
            </v-card-title>
            <v-card-text class="px-0">
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
                    Visible si la date de départ est à +7 mois.
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
                    Visible si la date est à moins d’un mois.
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
                </v-col>
                <v-col
                  cols="12"
                  md="6"
                >
                  <Transition name="slide-fade">
                    <v-text-field
                      v-if="localForm.include_flight"
                      v-model="localForm.flight_price"
                      label="Prix du vol"
                      type="number"
                      min="0"
                      prefix="€"
                      density="comfortable"
                    />
                  </Transition>
                </v-col>
              </v-row>

              <v-row class="mt-2">
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-switch
                    v-model="hasCustomBadge"
                    color="green-light"
                    label="Événement personnalisé"
                    inset
                    density="compact"
                  />
                </v-col>
                <v-col
                  cols="12"
                  md="6"
                >
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
            </v-card-text>
          </v-card>

          <v-divider />

          <v-card
            variant="text"
            class="pa-4 glass-subtle"
          >
            <v-card-title class="text-subtitle-1 font-weight-bold px-0">
              Affichage substitut
            </v-card-title>
            <v-card-text class="px-0">
              <v-row class="text-primary">
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-select
                    v-model="localForm.displayed_status"
                    :items="statusOptions"
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
                    v-model="localForm.displayed_booked_seat"
                    label="Places réservées (override)"
                    type="number"
                    min="0"
                    density="comfortable"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <div class="d-flex justify-end mt-6 ga-3">
        <slot name="actions" />
      </div>
    </v-card-text>
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

watch(
  () => props.modelValue,
  (val) => {
    localForm.value = clone(val)
    hasCustomBadge.value = !!val?.badges
  },
  { deep: true },
)

watch(
  localForm,
  val => emit('update:modelValue', val),
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
