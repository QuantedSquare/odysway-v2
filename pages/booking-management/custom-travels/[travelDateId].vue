<template>
  <v-container>
    <v-row
      v-if="loading"
      justify="center"
      align="center"
      style="min-height: 400px;"
    >
      <v-col
        cols="12"
        class="text-center"
      >
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        />
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col
        cols="12"
        md="8"
      >
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
                Retour
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <v-card class="mb-4">
          <v-card-title>Voyageurs</v-card-title>
          <v-card-text>
            <ul>
              <li
                v-for="traveler in bookedTravelers"
                :key="traveler.id"
                class="d-flex flex-column"
                style="list-style: none; margin-bottom: 8px;"
              >
                <div class="d-flex">
                  <NuxtLink
                    :to="`https://odysway90522.activehosted.com/app/deals/${traveler.deal_id}`"
                    target="_blank"
                    style="display: flex; align-items: center; color: inherit;"
                  >
                    <span style="font-weight: 500;">{{ traveler.name?.trim() ? traveler.name : traveler.email }}</span>
                  </NuxtLink>
                  <span>&nbsp;|&nbsp;Voyageurs:</span>
                  <v-badge
                    v-if="traveler.booked_places > 0"
                    :content="traveler.booked_places"
                    color="primary"
                    inline
                    class="ml-2"
                    style="margin-left: 8px;"
                  />
                  <v-spacer />
                  <v-btn
                    icon
                    color="primary"
                    size="x-small"
                    class="mx-2"
                    @click="openPaymentDialog(traveler)"
                  >
                    <v-icon>{{ mdiLinkEdit }}</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    color="error"
                    size="x-small"
                    @click="deleteTraveler(traveler.id)"
                  >
                    <v-icon>{{ mdiDelete }}</v-icon>
                  </v-btn>
                </div>
                <div v-if="traveler.is_option">
                  <v-chip
                    inline
                    color="red"
                    label
                    size="small"
                  >
                    Option, expire le {{ formatDate(traveler.expiracy_date) }}
                  </v-chip>
                </div>
                <div class="text-caption">
                  <div>
                    <span><b>Prix payé:</b> {{ formatNumber(traveler.alreadyPaid) }} €</span>
                    <span><b>Reste à payer:</b> {{ formatNumber(traveler.restToPay) }} €</span>
                  </div>
                  <div>
                    <span><b>Prix total:</b> {{ formatNumber(traveler.price) }} €</span>
                  </div>
                </div>
              </li>
            </ul>
            <v-divider class="my-2" />
            <div class="mt-2 d-flex flex-column">
              <span>Valeur totale: {{ formatNumber(totalValue) }} €</span>
              <span>Total payé: {{ formatNumber(totalPaid) }} €</span>
              <span>Total restant: {{ formatNumber(totalRestToPay) }} €</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <!-- Payment Link Dialog -->
    <v-dialog
      v-model="paymentDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title>Générer un lien de paiement</v-card-title>
        <v-card-text>
          <div v-if="selectedTraveler">
            <div><b>Voyageur:</b> {{ selectedTraveler.name || selectedTraveler.email }}</div>
            <v-select
              v-model="paymentType"
              :items="paymentTypes"
              label="Type de paiement"
              item-title="label"
              item-value="value"
            />
            <v-text-field
              v-if="paymentType === 'custom'"
              v-model="customAmount"
              label="Montant personnalisé (€)"
              type="number"
            />
            <v-divider class="my-2" />
            <div v-if="generatedLink">
              <b>Lien généré :</b>
              <v-text-field
                v-model="generatedLink"
                readonly
                append-icon="mdi-content-copy"
                @click:append="copyLink"
              />
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            @click="generateLink"
          >
            Générer
          </v-btn>
          <v-btn
            text
            @click="closePaymentDialog"
          >
            Fermer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mdiDelete, mdiLinkEdit } from '@mdi/js'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const travelDateId = route.params.travelDateId
const saving = ref(false)
const deleting = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)
const loading = ref(true)
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
const bookedTravelers = ref([])

// Payment dialog state
const paymentDialog = ref(false)
const selectedTraveler = ref(null)
const paymentType = ref('full')
const customAmount = ref('')
const generatedLink = ref('')
const paymentTypes = [
  { value: 'full', label: 'Faire payer entièrement' },
  { value: 'deposit', label: 'Paiement de l\'acompte' },
  { value: 'custom', label: 'Paiement custom' },
  { value: 'balance', label: 'Paiement du solde' },
]

const fetchDestinations = async () => {
  destinationsList.value = await queryCollection('destinations').select('slug', 'titre', 'iso', 'chapka', 'regions').all()
}

const fetchTravel = async () => {
  const res = await fetch(`/api/v1/booking/custom-travel`)
  const data = await res.json()
  const travel = data.find(t => t.id === travelDateId)
  if (!travel) return
  // Pre-fill form
  console.log('===========travel in fetchTravel===========', travel)
  form.value.title = travel.booked_dates[0]?.deal?.title || ''
  form.value.description = travel.booked_dates[0]?.deal?.description || ''
  form.value.email = travel.user_email || (travel.booked_dates[0]?.deal?.contact?.email) || ''
  form.value.departure_date = travel.departure_date || ''
  form.value.return_date = travel.return_date || ''
  form.value.destination = travel.booked_dates[0]?.deal?.country.split(',')
  form.value.starting_price = travel.starting_price / 100 || ''
  form.value.include_flight = travel.include_flight || false
  form.value.flight_price = travel.flight_price / 100 || ''
  form.value.extension_price = travel.booked_dates[0]?.deal?.extension_price / 100 || ''
  form.value.reduction_price = travel.booked_dates[0]?.deal?.reduction_price / 100 || ''
  // Booked travelers
  bookedTravelers.value = (travel.booked_dates || []).map((row) => {
    const deal = row.deal || {}
    return {
      ...row,
      name: deal.contact?.fullName || deal.contact?.email || '',
      email: deal.contact?.email || '',
      alreadyPaid: deal.customFields?.alreadyPaid || 0,
      restToPay: deal.customFields?.restToPay || 0,
      price: deal.deal?.value || 0,
      booked_places: row.booked_places || 0,
      is_option: row.is_option,
      expiracy_date: row.expiracy_date,
      id: row.id,
    }
  })
  loading.value = false
}

const onSave = async () => {
  saveError.value = ''
  saveSuccess.value = false
  saving.value = true
  const required = ['title', 'email', 'departure_date', 'return_date', 'destination', 'starting_price']
  for (const field of required) {
    if (!form.value[field] || (Array.isArray(form.value[field]) && form.value[field].length === 0)) {
      saveError.value = `Champ obligatoire manquant: ${field}`
      saving.value = false
      return
    }
  }
  const payload = {
    ...form.value,
    destination: Array.isArray(form.value.destination) ? form.value.destination : [form.value.destination],
    starting_price: Number(form.value.starting_price) * 100,
    flight_price: form.value.flight_price ? Number(form.value.flight_price) * 100 : undefined,
    extension_price: form.value.extension_price ? Number(form.value.extension_price) * 100 : undefined,
    reduction_price: form.value.reduction_price ? Number(form.value.reduction_price) * 100 : undefined,
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
    const res = await fetch(`/api/v1/booking/custom-travel/${travelDateId}`, { method: 'DELETE' })
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

const deleteTraveler = async (id) => {
  if (!confirm('Supprimer ce voyageur ?')) return
  await fetch(`/api/v1/booking/booked_date/${id}`, { method: 'DELETE' })
  await fetchTravel()
}

const formatNumber = (n) => {
  if (!n && n !== 0) return '-'
  return Number(n).toLocaleString('fr-FR', { maximumFractionDigits: 2 })
}
const formatDate = d => d ? dayjs(d).format('DD/MM/YYYY') : ''

const totalPaid = computed(() => bookedTravelers.value.reduce((acc, t) => acc + (Number(t.alreadyPaid) || 0), 0))
const totalRestToPay = computed(() => bookedTravelers.value.reduce((acc, t) => acc + (Number(t.restToPay) || 0), 0))
const totalValue = computed(() => bookedTravelers.value.reduce((acc, t) => acc + (Number(t.price) || 0), 0))

const openPaymentDialog = (traveler) => {
  selectedTraveler.value = traveler
  paymentType.value = 'full'
  customAmount.value = ''
  generatedLink.value = ''
  paymentDialog.value = true
}
const closePaymentDialog = () => {
  paymentDialog.value = false
  selectedTraveler.value = null
  generatedLink.value = ''
}
const generateLink = () => {
  if (!selectedTraveler.value) return
  let amountParam = ''
  if (paymentType.value === 'custom') {
    if (!customAmount.value) return
    amountParam = `&amount=${customAmount.value}`
  }
  const typeParam = `&type=${paymentType.value}`
  generatedLink.value = `${config.public.siteURL}/checkout?&booked_id=${selectedTraveler.value.id}${amountParam}${typeParam}`
}
const copyLink = () => {
  if (generatedLink.value) {
    navigator.clipboard.writeText(generatedLink.value)
  }
}

onMounted(async () => {
  await fetchDestinations()
  await fetchTravel()
})
</script>
