<template>
  <v-container>
    <v-row justify="center">
      <v-col
        cols="12"
      >
        <v-card>
          <v-card-title>Ajouter une date de voyage</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="onSave">
              <v-switch
                v-model="form.published"
                color="green-light"
                label="Publié"
              />
              <v-switch
                v-model="form.is_indiv_travel"
                color="green-light"
                label="Voyage Individuel"
              />
              <v-autocomplete
                v-model="form.travel_slug"
                :items="travelesList"
                item-title="title"
                item-value="slug"
                label="Voyage"
                required
                @update:model-value="onTravelSelect"
              />
              <v-select
                v-model="form.displayed_status"
                label="Statut affiché"
                :items="statuses"
                item-title="label"
                item-value="value"
              />
              <v-text-field
                v-model="form.departure_date"
                label="Date de départ"
                type="date"
              />
              <v-text-field
                v-model="form.return_date"
                label="Date de retour"
                type="date"
              />
              <v-text-field
                v-model="form.starting_price"
                label="Prix de départ"
                type="number"
              />
              <v-text-field
                v-model="form.max_travelers"
                label="Voyageurs max"
                type="number"
              />
              <v-text-field
                v-model="form.min_travelers"
                label="Voyageurs min"
                type="number"
              />
              <v-divider class="my-2" />
              <v-row>
                <v-col cols="6">
                  <v-switch
                    v-model="form.early_bird"
                    color="green-light"
                    label="Early Bird disponible pour cette date"
                  />
                </v-col>
                <v-col cols="6">
                  <v-switch
                    v-model="form.last_minute"
                    color="green-light"
                    label="Last minute disponible pour cette date"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="6">
                  <v-switch
                    v-model="includeCustomEvent"
                    color="green-light"
                    label="Événement personnalisé (optionnel)"
                  />
                </v-col>
                <v-col cols="6">
                  <Transition name="slide-fade">
                    <v-text-field
                      v-if="includeCustomEvent"
                      v-model="form.badges"
                      label="Texte du badge"
                    />
                  </Transition>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="6">
                  <v-switch
                    v-model="form.include_flight"
                    color="green-light"
                    label="Vol inclus (optionnel)"
                  />
                </v-col>
                <v-col cols="5">
                  <Transition name="slide-fade">
                    <v-text-field
                      v-if="form.include_flight"
                      v-model="form.flight_price"
                      label="Prix du vol"
                      type="number"
                    />
                  </Transition>
                </v-col>
              </v-row>
              <v-btn
                type="submit"
                color="primary"
                class="mt-4"
                :loading="saving"
                :disabled="!form.travel_slug"
              >
                Valider
              </v-btn>
              <v-btn
                class="mt-4 ml-2"
                @click="onCancel"
              >
                Retour
              </v-btn>
              <v-alert
                v-if="saveSuccess"
                type="success"
                class="mt-4"
              >
                Date ajoutée !
              </v-alert>
              <v-alert
                v-if="saveError"
                type="error"
                class="mt-4"
              >
                {{ saveError }}
              </v-alert>
            </v-form>
          </v-card-text>
        </v-card>
        <v-divider class="my-4" />
        <h2>Prévisualisation</h2>
        <v-col cols="12">
          <v-chip
            v-if="form.published"
            color="green-light"
          >
            Publié
          </v-chip>
          <v-chip
            v-else
            color="red"
          >
            Non publié
          </v-chip>
        </v-col>
        <v-col
          v-if="form"
          cols="12"
          class="mb-16"
        >
          <DatesPricesItem :date="form" />
        </v-col>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import dayjs from 'dayjs'

definePageMeta({
  layout: 'booking',
  middleware: 'booking-management',
})
const router = useRouter()
const route = useRoute()
const slugFromQuery = route.query.slug

const includeCustomEvent = ref(false)
const form = ref({
  index: 0,
  travel_slug: slugFromQuery || '',
  published: false,
  is_indiv_travel: false,
  displayed_status: 'soon_confirmed',
  departure_date: dayjs().format('YYYY-MM-DD'),
  return_date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
  starting_price: 0,
  max_travelers: 6,
  min_travelers: 1,
  early_bird: false,
  last_minute: false,
  include_flight: false,
  booked_seat: 0,
  flight_price: 0,
  badges: '',
})

const statuses = ref([
  { value: 'soon_confirmed', label: 'Bientôt confirmé' },
  { value: 'confirmed', label: 'Confirmé' },
  { value: 'guaranteed', label: 'Garanti (Complet)' },
])
const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)
const travelesList = ref([])
const travelesMap = ref({})

const fetchTravels = async () => {
  // Nuxt Studio queryCollection
  const list = await queryCollection('voyages').select().all()
  travelesList.value = list
  travelesMap.value = Object.fromEntries(list.map(t => [t.slug, t]))
}

const onTravelSelect = (slug) => {
  const travel = travelesMap.value[slug]
  if (travel) {
    form.value.min_travelers = travel.minTravelersToConfirm || ''
    form.value.max_travelers = travel.maxTravelers || ''
  }
}

watch(includeCustomEvent, (newVal) => {
  if (!newVal) {
    form.value.badges = ''
  }
})

const onSave = async () => {
  saveError.value = ''
  saveSuccess.value = false
  saving.value = true
  try {
    const payload = { ...form.value }
    delete payload.index
    const res = await fetch('/api/v1/booking/add-date', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (res.ok && !data.error) {
      saveSuccess.value = true
      setTimeout(() => router.push(`/booking-management/${form.value.travel_slug}`), 1000)
    }
    else {
      saveError.value = data.error || 'Erreur lors de l\'ajout.'
    }
  }
  catch {
    saveError.value = 'Erreur lors de l\'ajout.'
  }
  finally {
    saving.value = false
  }
}

const onCancel = () => {
  router.back()
}
watch(form.value, (newVal) => {
  console.log('newVal', newVal.is_indiv_travel)
  if (newVal.is_indiv_travel) {
    form.value.published = false
  }
})

onMounted(fetchTravels)
if (slugFromQuery) onTravelSelect(slugFromQuery)
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
  transform: translateY(100px);
  opacity: 0;
}
</style>
