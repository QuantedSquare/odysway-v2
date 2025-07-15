<template>
  <v-container fluid>
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
          <v-card-title>Détails de la date</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="onSave">
              <v-row class="d-flex align-center justify-space-between">
                <v-col cols="6">
                  <v-switch
                    v-model="form.published"
                    color="green-light"
                    label="Publiée"
                  />
                </v-col>
                <v-col
                  cols="12"
                  md="6"
                  class="d-flex align-center"
                >
                  <div class="d-flex flex-column align-start justify-center text-caption">
                    <v-switch
                      v-model="form.is_indiv_travel"
                      color="green-light"
                      label="Voyage Individuel"
                    />

                    <!-- Les voyages individuels ne sont pas publiés par défaut -->
                  </div>
                </v-col>
              </v-row>
              <v-text-field
                v-model="form.travel_slug"
                label="Slug du voyage"
                readonly
              />
              <v-text-field
                v-model="form.id"
                :model-value="`${config.public.siteURL}/checkout?date_id=${form.id}`"
                label="Lien funnel"
                readonly
              >
                <template #append-inner>
                  <v-btn
                    icon
                    color="primary"
                    size="x-small"
                    @click="copyId"
                  >
                    <v-icon>
                      {{ mdiLinkEdit }}
                    </v-icon>
                  </v-btn>
                </template>
              </v-text-field>
              <v-select
                v-model="form.status"
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
              <v-text-field
                v-model="form.booked_seat"
                label="Places réservées (Non modifiable)"
                type="number"
                readonly
              />
              <v-divider class="my-2" />
              <v-row>
                <v-col cols="6">
                  <span class="text-info text-caption"> Le badge EarlyBird ne sera visible que si la date de départ est supérieure à 7 mois</span>
                  <v-switch
                    v-model="form.early_bird"
                    color="green-light"
                    label="Early Bird disponible pour cette date"
                  />
                </v-col>
                <v-col cols="6">
                  <span class="text-info text-caption"> Le badge LastMinute ne sera visible que si la date de départ est inférieure à 1 mois</span>
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
              <v-divider />
              <v-row>
                <v-col cols="12">
                  <v-switch
                    v-model="form.custom_display"
                    color="green-light"
                    label="Affichage custom de la section date"
                  />
                </v-col>
                <v-col
                  cols="12"
                  class="pa-8"
                >
                  <Transition name="slide-fade">
                    <div v-if="form.custom_display">
                      <v-card
                        class="pa-6 mb-4"
                        color="#f5f7fa"
                        elevation="2"
                        style="border: 1px solid #d1e3f8;"
                      >
                        <div
                          class="text-h6 font-weight-bold mb-4"
                          style="color: #1976d2;"
                        >
                          Affichage personnalisé (section date)
                        </div>
                        <v-row dense>
                          <v-col
                            cols="12"
                            md="6"
                          >
                            <v-select
                              v-model="form.displayed_status"
                              label="Statut affiché (custom)"
                              :items="statuses"
                              item-title="label"
                              item-value="value"
                              class="mb-2"
                            />
                          </v-col>
                          <v-col
                            cols="12"
                            md="6"
                          >
                            <v-text-field
                              v-model="form.displayed_starting_price"
                              label="Prix de départ (custom)"
                              type="number"
                              class="mb-2"
                            />
                          </v-col>
                          <v-col
                            cols="12"
                            md="6"
                          >
                            <v-text-field
                              v-model="form.displayed_min_travelers"
                              label="Voyageurs min (custom)"
                              type="number"
                              class="mb-2"
                            />
                          </v-col>
                          <v-col
                            cols="12"
                            md="6"
                          >
                            <v-text-field
                              v-model="form.displayed_max_travelers"
                              label="Voyageurs max (custom)"
                              type="number"
                              class="mb-2"
                            />
                          </v-col>
                          <v-col
                            cols="12"
                            md="6"
                          >
                            <v-text-field
                              v-model="form.displayed_booked_seat"
                              label="Places réservées (custom)"
                              type="number"
                              class="mb-2"
                            />
                          </v-col>
                          <v-col
                            cols="12"
                            md="6"
                          >
                            <v-text-field
                              v-model="form.displayed_badges"
                              label="Badge (custom)"
                              class="mb-2"
                            />
                          </v-col>
                          <v-col
                            cols="12"
                            md="6"
                          >
                            <v-switch
                              v-model="form.displayed_include_flight"
                              color="green-light"
                              label="Vol inclus (custom)"
                              class="mb-2"
                            />
                          </v-col>
                          <v-col
                            cols="12"
                            md="6"
                          >
                            <v-switch
                              v-model="form.displayed_last_minute"
                              color="green-light"
                              label="Last minute (custom)"
                              class="mb-2"
                            />
                          </v-col>
                          <v-col
                            cols="12"
                            md="6"
                          >
                            <v-switch
                              v-model="form.displayed_early_bird"
                              color="green-light"
                              label="Early bird (custom)"
                              class="mb-2"
                            />
                          </v-col>
                        </v-row>
                      </v-card>
                    </div>
                  </Transition>
                </v-col>
              </v-row>
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
          <v-card-title>Voyageurs réservés</v-card-title>
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
                    <span style="font-weight: 500;">
                      {{ traveler.name?.trim() ? traveler.name : traveler.email }}
                    </span>
                    <span>
                      &nbsp;|&nbsp;Voyageurs:
                    </span>
                    <v-badge
                      v-if="traveler.booked_places > 0"
                      :content="traveler.booked_places"
                      color="primary"
                      inline
                      class="ml-2"
                      style="margin-left: 8px;"
                    />

                    <v-icon>
                      {{ mdiArrowRight }}
                    </v-icon>
                  </NuxtLink>
                  <v-spacer />

                  <v-btn
                    icon
                    color="primary"
                    size="x-small"
                    class="mx-2"
                    @click="openPaymentDialog(traveler)"
                  >
                    <v-icon>
                      {{ mdiLinkEdit }}
                    </v-icon>
                  </v-btn>
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
                </div>
                <div v-if="traveler.is_option">
                  <v-chip
                    inline
                    color="red"
                    label
                    size="small"
                  >
                    Option, expire le {{ dayjs(traveler.expiracy_date).format('DD/MM/YYYY') }}
                  </v-chip>
                </div>
                <div class="text-caption">
                  <div>
                    <span>
                      <b>Prix payé:</b> {{ formatNumber(traveler.alreadyPaid) }} €
                    </span>
                    <span>
                      <b>Reste à payer:</b> {{ formatNumber(traveler.restToPay) }} €
                    </span>
                  </div>
                  <div>
                    <span>
                      <b>Prix total:</b> {{ formatNumber(traveler.price) }} €
                    </span>
                  </div>
                </div>
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
            <div class="mt-2 d-flex flex-column">
              <span>Valeur totale: {{ formatNumber(totalValue) }} €</span>
              <span>Total payé: {{ formatNumber(totalPaid) }} €</span>
              <span>Total restant: {{ formatNumber(totalRestToPay) }} €</span>
            </div>
          </v-card-text>
        </v-card>
        <v-card
          v-if="prospectTravelers.length > 0"
          class="mb-4 pa-2"
        >
          <v-card-title class="text-body-1">
            Voyageurs/Prospects en attente
          </v-card-title>
          <v-card-text>
            <ul>
              <li
                v-for="traveler in prospectTravelers"
                :key="traveler.id"
                class="d-flex justify-space-between"
                style="list-style: none; margin-bottom: 8px;"
              >
                <NuxtLink
                  :to="`https://odysway90522.activehosted.com/app/deals/${traveler.deal_id}`"
                  target="_blank"
                  style="display: flex; align-items: center; color: inherit;"
                >
                  <span style="font-weight: 500;">
                    {{ traveler.email || 'DEAL AC SUPPRIMÉ' }}
                  </span>
                  <span>
                    &nbsp;|&nbsp;Voyageurs: {{ traveler.nbTravelers }}
                  </span>

                  <v-tooltip
                    text="Pas de paiement effectué sur cette date"
                  >
                    <template #activator="{ props }">
                      <v-badge
                        v-bind="props"
                        :icon="mdiInformationOutline"
                        inline
                        text-color="white"
                        color="red"
                      />
                    </template>
                  </v-tooltip>

                  <v-icon>
                    {{ mdiArrowRight }}
                  </v-icon>
                </NuxtLink>
                <v-spacer />
                <v-btn
                  v-if="traveler.email"
                  icon
                  color="primary"
                  size="x-small"
                  class="mx-2"
                  @click="openPaymentDialog(traveler)"
                >
                  <v-icon>
                    {{ mdiLinkEdit }}
                  </v-icon>
                </v-btn>
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
          </v-card-text>
        </v-card>
      </v-col>
      <v-divider class="my-4" />
      <h2>
        Prévisualisation
      </h2>
      <v-col cols="12">
        <v-chip
          v-if="form.published && !form.is_indiv_travel"
          color="green-light"
          class="pb-1"
        >
          Publié
        </v-chip>
        <v-chip
          v-else-if="!form.published && !form.is_indiv_travel"
          color="red"
          class="pb-1"
        >
          Non publié
        </v-chip>
        <v-chip
          v-else-if="form.is_indiv_travel"
          color="blue"
          class="pb-1"
        >
          Voyage Individuel, la date n'apparaîtra pas sur le site
        </v-chip>
      </v-col>
      <v-col
        v-if="form"
        cols="12"
        class="mb-16"
      >
        <DatesPricesItem :date="Object.assign(form, { lastMinutePrice: voyagePricing.lastMinuteReduction, earlyBirdPrice: voyagePricing.earlyBirdReduction })" />
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
    <v-snackbar
      v-model="snackbar"
      location="top"
      timeout="2000"
      color="primary"
    >
      Le lien a été copié
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mdiArrowRight, mdiDelete, mdiLinkEdit, mdiInformationOutline } from '@mdi/js'
import dayjs from 'dayjs'

definePageMeta({
  layout: 'booking',
  middleware: 'booking-management',
})
const route = useRoute()
const router = useRouter()
const slug = route.params.slug
const snackbar = ref(false)
const dateId = route.params.dateId
const config = useRuntimeConfig()
console.log('=======config=======', config.public.siteURL)
const includeCustomEvent = ref(false)
const form = ref({})
const bookedTravelers = ref([])
const prospectTravelers = ref([])
const loading = ref(true)
const { pricing: voyagePricing } = await queryCollection('voyages').where('slug', '=', slug).select('pricing').first()
console.log('=======voyagePricing=======', voyagePricing)

const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)
const statuses = ref([
  { value: 'soon_confirmed', label: 'Bientôt confirmé' },
  { value: 'confirmed', label: 'Confirmé' },
  { value: 'guaranteed', label: 'Garanti (Complet)' },
])
const dealUrl = ref('')
const assigningDeal = ref(false)
const assignDealError = ref('')
const assignDealSuccess = ref(false)

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

const fetchDetails = async () => {
  // Fetch travel_date details
  const res = await fetch(`/api/v1/booking/date/${dateId}`)
  const data = await res.json()
  form.value = { ...data, index: 0 }
  console.log('=======form RETRIEVED=======', form.value)
  // Fetch booked travelers
  const res2 = await fetch(`/api/v1/booking/${slug}/date/${dateId}/booked`)
  const data2 = await res2.json()
  includeCustomEvent.value = data.badges.length > 0
  console.log('=======data2=======', data2)
  bookedTravelers.value = data2.filter(traveler => traveler.booked_places > 0)
  prospectTravelers.value = data2.filter(traveler => traveler.booked_places === 0)
  loading.value = false
  console.log('=======bookedTravelers RETRIEVED=======', bookedTravelers.value)
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
    console.log('=======form.value=======', form.value)
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

const copyId = () => {
  navigator.clipboard.writeText(`${config.public.siteURL}/checkout?date_id=${form.value.id}`)
  snackbar.value = true
}

function openPaymentDialog(traveler) {
  selectedTraveler.value = traveler
  console.log('selectedTraveler', selectedTraveler.value)
  paymentType.value = 'full'
  customAmount.value = ''
  generatedLink.value = ''
  paymentDialog.value = true
}
function closePaymentDialog() {
  paymentDialog.value = false
  selectedTraveler.value = null
  generatedLink.value = ''
}
function generateLink() {
  if (!selectedTraveler.value) return
  let amountParam = ''
  if (paymentType.value === 'custom') {
    if (!customAmount.value) return
    amountParam = `&amount=${customAmount.value}`
  }
  else {
    amountParam = ''
  }
  let typeParam = `&type=${paymentType.value}`
  if (paymentType.value === 'full') typeParam = '&type=full'
  if (paymentType.value === 'deposit') typeParam = '&type=deposit'
  if (paymentType.value === 'balance') typeParam = '&type=balance'
  if (paymentType.value === 'custom') typeParam = '&type=custom'
  generatedLink.value = `${config.public.siteURL}/checkout?&booked_id=${selectedTraveler.value.id}${amountParam}${typeParam}`
}
function copyLink() {
  if (generatedLink.value) {
    navigator.clipboard.writeText(generatedLink.value)
  }
}

const totalPaid = computed(() => {
  return bookedTravelers.value.reduce((acc, traveler) => acc + traveler.alreadyPaid, 0)
})
const totalRestToPay = computed(() => {
  return bookedTravelers.value.reduce((acc, traveler) => acc + traveler.restToPay, 0)
})
const totalValue = computed(() => {
  return bookedTravelers.value.reduce((acc, traveler) => acc + traveler.price, 0)
})

onMounted(fetchDetails)
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
