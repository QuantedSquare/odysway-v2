<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12">
        <v-card>
          <v-card-title>Créer un voyage personnalisé</v-card-title>
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
              (Doit exister sur active campaign)
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
                Voyage personnalisé créé !
              </v-alert>
              <v-btn
                type="submit"
                color="primary"
                class="mt-4"
                :loading="saving"
                :disabled="saving"
              >
                Créer
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
import { useRouter } from 'vue-router'

definePageMeta({ layout: 'booking', middleware: 'booking-management' })
const router = useRouter()
const saving = ref(false)
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
    console.log('===========payload in add-custom-travel.vue===========', payload)
    const res = await fetch('/api/v1/booking/custom-travel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (res.ok && data.success) {
      saveSuccess.value = true
      setTimeout(() => router.push('/booking-management/custom-travels'), 1000)
    }
    else {
      saveError.value = data.error || 'Erreur lors de la création.'
    }
  }
  catch {
    saveError.value = 'Erreur lors de la création.'
  }
  finally {
    saving.value = false
  }
}

const onCancel = () => {
  router.push('/booking-management/custom-travels')
}

onMounted(fetchDestinations)
</script>
