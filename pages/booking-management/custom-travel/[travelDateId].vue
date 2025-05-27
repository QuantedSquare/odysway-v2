<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12">
        <v-card>
          <v-card-title>Modifier le voyage personnalisé</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="onSave">
              <v-text-field
                v-model="form.title"
                label="Titre"
                required
              />
              <v-text-field
                v-model="form.description"
                label="Description"
              />
              <v-text-field
                v-model="form.email"
                label="Email utilisateur"
                required
                type="email"
              />
              <v-text-field
                v-model="form.departure_date"
                label="Date de départ"
                type="date"
                required
              />
              <v-text-field
                v-model="form.return_date"
                label="Date de retour"
                type="date"
                required
              />
              <v-autocomplete
                v-model="form.destination"
                :items="destinationsList"
                item-title="titre"
                :return-object="true"
                label="Destinations"
                multiple
                chips
                required
              />
              <v-text-field
                v-model="form.starting_price"
                label="Prix de départ (€) / voyageur"
                type="number"
                required
              />
              <v-switch
                v-model="form.include_flight"
                label="Vol inclus ?"
              />
              <v-text-field
                v-if="form.include_flight"
                v-model="form.flight_price"
                label="Prix du vol (€)"
                type="number"
              />
              <v-text-field
                v-model="form.extension_price"
                label="Prix extension (€)"
                type="number"
              />
              <v-text-field
                v-model="form.reduction_price"
                label="Prix réduction (€)"
                type="number"
              />
              <v-alert
                v-if="saveError"
                type="error"
                class="mt-2"
              >
                {{ saveError }}
              </v-alert>
              <v-alert
                v-if="saveSuccess"
                type="success"
                class="mt-2"
              >
                Voyage personnalisé mis à jour !
              </v-alert>
              <v-btn
                type="submit"
                color="primary"
                class="mt-4"
                :loading="saving"
                :disabled="saving"
              >
                Enregistrer
              </v-btn>
              <v-btn
                class="mt-4 ml-2"
                color="error"
                :loading="deleting"
                @click="onDelete"
              >
                Supprimer
              </v-btn>
              <v-btn
                class="mt-4 ml-2"
                @click="onCancel"
              >
                Annuler
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const travelDateId = route.params.travelDateId
const saving = ref(false)
const deleting = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)
const destinationsList = ref([])
const form = ref({
  title: '',
  description: '',
  email: '',
  departure_date: '',
  return_date: '',
  destination: [],
  starting_price: '',
  include_flight: false,
  flight_price: '',
  extension_price: '',
  reduction_price: '',
})

const fetchDestinations = async () => {
  destinationsList.value = await queryCollection('destinations').select('slug', 'titre', 'iso', 'chapka', 'regions').all()
}

const fetchTravel = async () => {
  const res = await fetch(`/api/v1/booking/custom-travel`)
  const data = await res.json()
  const travel = data.find(t => t.id === travelDateId)
  if (!travel) return
  // Pre-fill form
  form.value.title = travel.title || ''
  form.value.description = travel.description || ''
  form.value.email = travel.user_email || (travel.booked_dates[0]?.deal?.contact?.email) || ''
  form.value.departure_date = travel.departure_date || ''
  form.value.return_date = travel.return_date || ''
  // Find destination objects from slugs or titles
  form.value.destination = destinationsList.value.filter(dest => (travel.destination || []).includes(dest.titre) || (travel.destination || []).includes(dest.slug))
  form.value.starting_price = travel.starting_price || ''
  form.value.include_flight = travel.include_flight || false
  form.value.flight_price = travel.flight_price || ''
  form.value.extension_price = travel.extension_price || ''
  form.value.reduction_price = travel.reduction_price || ''
}

const onSave = async () => {
  saveError.value = ''
  saveSuccess.value = false
  saving.value = true
  // Validate required fields
  const required = ['title', 'email', 'departure_date', 'return_date', 'destination', 'starting_price']
  for (const field of required) {
    if (!form.value[field] || (Array.isArray(form.value[field]) && form.value[field].length === 0)) {
      saveError.value = `Champ obligatoire manquant: ${field}`
      saving.value = false
      return
    }
  }
  // Prepare payload
  const payload = {
    ...form.value,
    destination: Array.isArray(form.value.destination)
      ? form.value.destination
      : [form.value.destination],
    starting_price: Number(form.value.starting_price),
    flight_price: form.value.flight_price ? Number(form.value.flight_price) : undefined,
    extension_price: form.value.extension_price ? Number(form.value.extension_price) : undefined,
    reduction_price: form.value.reduction_price ? Number(form.value.reduction_price) : undefined,
  }
  try {
    const res = await fetch(`/api/v1/booking/custom-travel/${travelDateId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (res.ok && data.success) {
      saveSuccess.value = true
      setTimeout(() => router.push('/booking-management/custom-travels'), 1000)
    }
    else {
      saveError.value = data.error || 'Erreur lors de la mise à jour.'
    }
  }
  catch {
    saveError.value = 'Erreur lors de la mise à jour.'
  }
  finally {
    saving.value = false
  }
}

const onDelete = async () => {
  if (!confirm('Supprimer ce voyage personnalisé ?')) return
  deleting.value = true
  try {
    const res = await fetch(`/api/v1/booking/custom-travel/${travelDateId}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      router.push('/booking-management/custom-travels')
    }
    else {
      saveError.value = 'Erreur lors de la suppression.'
    }
  }
  finally {
    deleting.value = false
  }
}

const onCancel = () => {
  router.push('/booking-management/custom-travels')
}

onMounted(async () => {
  await fetchDestinations()
  await fetchTravel()
})
</script>
