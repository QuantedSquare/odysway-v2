<template>
  <v-container>
    <v-row>
      <v-col
        cols="12"
        md="8"
      >
        <v-card>
          <v-card-title>Détails de la date</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="onSave">
              <v-switch
                v-model="form.published"
                label="Publié"
              />
              <v-text-field
                v-model="form.travel_slug"
                label="Slug du voyage"
                readonly
              />
              <v-text-field
                v-model="form.id"
                label="ID (readonly)"
                readonly
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
                v-model="form.max_travelers"
                label="Voyageurs max"
                type="number"
              />
              <v-text-field
                v-model="form.min_travelers"
                label="Voyageurs min"
                type="number"
              />
              <v-text-field
                v-model="form.booked_seat"
                label="Places réservées"
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
              <v-alert
                v-if="saveSuccess"
                type="success"
                class="mt-4"
              >
                Modifications enregistrées !
              </v-alert>
              <v-alert
                v-if="saveError"
                type="error"
                class="mt-4"
              >
                {{ saveError }}
              </v-alert>
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
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <v-card class="mb-4">
          <v-card-title>Voyageurs réservés</v-card-title>
          <v-card-text>
            <ul>
              <li
                v-for="traveler in bookedTravelers"
                :key="traveler.id"
                class="d-flex"
                style="list-style: none; margin-bottom: 8px;"
              >
                <NuxtLink
                  :to="`https://odysway90522.activehosted.com/app/deals/${traveler.deal_id}`"
                  target="_blank"
                  style="display: flex; align-items: center; color: inherit;"
                >
                  <span style="font-weight: 500;">
                    {{ traveler.name?.trim() ? traveler.name : traveler.email }}
                  </span>
                  <span>
                    &nbsp;|&nbsp;Voyageurs:
                  </span>
                  <v-badge
                    :content="traveler.booked_places"
                    color="primary"
                    inline
                    class="ml-2"
                    style="margin-left: 8px;"
                  />
                  <v-badge
                    v-if="traveler.is_option"
                    color="blue"
                    class="ml-2"
                    style="margin-left: 8px;"
                    label
                  >
                    Option, expire le {{ traveler.expiracy_date }}
                  </v-badge>
                  <v-icon>
                    {{ mdiArrowRight }}
                  </v-icon>
                </NuxtLink>
                <v-spacer />
                <v-btn
                  icon
                  color="error"
                  size="x-small"

                  @click="deleteTraveler(traveler.id)"
                >
                  <v-icon>
                    {{ mdiDelete }}
                  </v-icon>
                </v-btn>
              </li>
            </ul>
            <v-divider class="my-2" />
            <v-expansion-panels>
              <v-expansion-panel>
                <v-expansion-panel-title>Assigner un deal AC</v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-form @submit.prevent="onAssignDeal">
                    <v-text-field
                      v-model="dealUrl"
                      label="URL du deal AC"
                      required
                    />
                    <v-btn
                      type="submit"
                      color="primary"
                      :loading="assigningDeal"
                      :disabled="assigningDeal"
                    >
                      Assigner
                    </v-btn>
                    <v-alert
                      v-if="assignDealSuccess"
                      type="success"
                      class="mt-2"
                    >
                      Deal assigné !
                    </v-alert>
                    <v-alert
                      v-if="assignDealError"
                      type="error"
                      class="mt-2"
                    >
                      {{ assignDealError }}
                    </v-alert>
                  </v-form>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
            <div class="mt-2">
              Total value: {{ totalValue }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mdiArrowRight, mdiDelete } from '@mdi/js'

definePageMeta({
  layout: 'booking',
  middleware: 'booking-management',
})
const route = useRoute()
const router = useRouter()
const slug = route.params.slug
const dateId = route.params.dateId

const form = ref({})
const bookedTravelers = ref([])
const totalValue = ref(0)
const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)
const statuses = ref([
  { value: 'confirmed', label: 'Confirmé' },
  { value: 'guaranteed', label: 'Garanti' },
  { value: 'soon_confirmed', label: 'Bientôt confirmé' },
])
const dealUrl = ref('')
const assigningDeal = ref(false)
const assignDealError = ref('')
const assignDealSuccess = ref(false)

const fetchDetails = async () => {
  // Fetch travel_date details
  const res = await fetch(`/api/v1/booking/${slug}/date/${dateId}`)
  const data = await res.json()
  form.value = { ...data, badges: (data.badges || []).join(',') }

  // Fetch booked travelers
  const res2 = await fetch(`/api/v1/booking/${slug}/date/${dateId}/booked`)
  const data2 = await res2.json()
  bookedTravelers.value = data2

  console.log('=======bookedTravelers RETRIEVED=======', bookedTravelers.value)
}

const onSave = async () => {
  saveError.value = ''
  saveSuccess.value = false
  saving.value = true
  try {
    const res = await fetch(`/api/v1/booking/${slug}/date/${dateId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value),
    })
    const data = await res.json()
    if (res.ok && !data.error) {
      saveSuccess.value = true
      await fetchDetails()
    }
    else {
      saveError.value = data.error || 'Erreur lors de la sauvegarde.'
    }
  }
  catch {
    saveError.value = 'Erreur lors de la sauvegarde.'
  }
  finally {
    saving.value = false
  }
}

const onCancel = () => {
  router.back()
}

const onAssignDeal = async () => {
  assignDealError.value = ''
  assignDealSuccess.value = false
  assigningDeal.value = true
  try {
    // Extract dealId from URL
    const match = dealUrl.value.match(/deals\/(\d+)$/)
    if (!match) {
      assignDealError.value = 'URL invalide.'
      assigningDeal.value = false
      return
    }
    const dealId = match[1]
    const res = await fetch(`/api/v1/booking/${slug}/date/${dateId}/assign-deal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dealId }),
    })
    const data = await res.json()
    if (res.ok && !data.error) {
      assignDealSuccess.value = true
      dealUrl.value = ''
      await fetchDetails()
    }
    else {
      assignDealError.value = data.error || 'Erreur lors de l\'assignation.'
    }
  }
  catch {
    assignDealError.value = 'Erreur lors de l\'assignation.'
  }
  finally {
    assigningDeal.value = false
  }
}

const deleteTraveler = async (id) => {
  if (!confirm('Supprimer ce voyageur ?')) return
  await fetch(`/api/v1/booking/${slug}/date/${dateId}/booked/${id}`, {
    method: 'DELETE',
  })
  await fetchDetails()
}

onMounted(fetchDetails)
</script>
