<template>
  <v-container>
    <v-row justify="center">
      <v-col
        cols="12"
        md="8"
      >
        <v-card>
          <v-card-title>Ajouter une date de voyage</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="onSave">
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
                v-model="form.max_travelers"
                label="Voyageurs max"
                type="number"
              />
              <v-text-field
                v-model="form.min_travelers"
                label="Voyageurs min"
                type="number"
              />
              <v-switch
                v-model="form.include_flight"
                label="Inclut vol"
              />
              <v-text-field
                v-model="form.flight_price"
                label="Prix du vol"
                type="number"
              />
              <v-text-field
                v-model="form.badges"
                label="Badges (séparés par virgule)"
              />
              <v-text-field
                v-model="form.starting_price"
                label="Prix de départ"
                type="number"
              />
              <v-btn
                type="submit"
                color="primary"
                class="mt-4"
                :loading="saving"
                :disabled="saving"
              >
                Valider
              </v-btn>
              <v-btn
                class="mt-4 ml-2"
                @click="onCancel"
              >
                Annuler
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
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

definePageMeta({
  layout: 'booking',
  middleware: 'booking-management',
})
const router = useRouter()
const route = useRoute()
const slugFromQuery = route.query.slug

const form = ref({
  travel_slug: slugFromQuery || '',
  displayed_status: '',
  departure_date: '',
  return_date: '',
  max_travelers: '',
  min_travelers: '',
  include_flight: false,
  flight_price: '',
  badges: '',
  starting_price: '',
})

const statuses = ref([
  { value: 'available', label: 'Disponible' },
  { value: 'unavailable', label: 'Indisponible' },
  { value: 'sold_out', label: 'Complet' },
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
  console.log('travelesList', travelesList.value)
  travelesMap.value = Object.fromEntries(list.map(t => [t.slug, t]))
}

const onTravelSelect = (slug) => {
  const travel = travelesMap.value[slug]
  if (travel) {
    form.value.min_travelers = travel.minTravelersToConfirm || ''
    form.value.max_travelers = travel.maxTravelers || ''
  }
}

const onSave = async () => {
  saveError.value = ''
  saveSuccess.value = false
  saving.value = true
  try {
    const payload = { ...form.value }
    if (typeof payload.badges === 'string') {
      payload.badges = payload.badges.split(',').map(b => b.trim()).filter(Boolean)
    }
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

onMounted(fetchTravels)
if (slugFromQuery) onTravelSelect(slugFromQuery)
</script>
