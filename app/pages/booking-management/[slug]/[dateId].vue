<template>
  <v-container
    fluid
    class="py-6 glass-page"
  >
    <v-row
      v-if="loading"
      justify="center"
      align="center"
      style="min-height: 400px;"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
      />
    </v-row>

    <template v-else>
      <v-row class="align-center mb-4">
        <v-col
          cols="12"
          md="8"
        >
          <div class="d-flex align-center ga-3">
            <div>
              <p class="text-overline text-primary mb-1">
                Back-office dates
              </p>
              <h1 class="text-h5 text-md-h4 font-weight-bold mb-1">
                {{ voyageTitle || form.travel_slug }} — {{ dayjs(form.departure_date).format('DD MMM YYYY') }}
              </h1>
              <p class="text-body-2 text-medium-emphasis">
                Ajustez les informations, gérez les voyageurs et générez les liens de paiement.
              </p>
              <p
                v-if="form.updated_at"
                class="text-caption text-medium-emphasis"
              >
                Dernière mise à jour : {{ dayjs(form.updated_at).format('DD/MM/YYYY HH:mm') }}
                <span v-if="form.last_editor"> — {{ form.last_editor }}</span>
              </p>
            </div>
            <v-chip
              :color="form.published ? 'green-light' : 'warning'"
              label
              size="small"
            >
              {{ form.published ? 'Publiée' : 'Non publiée' }}
            </v-chip>
          </div>
        </v-col>
        <v-col
          cols="12"
          md="4"
          class="d-flex justify-end ga-2"
        >
          <v-btn
            variant="text"
            @click="onCancel"
          >
            Retour
          </v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            @click="onSave"
          >
            Enregistrer
          </v-btn>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-alert
            v-if="saveSuccess"
            type="success"
            variant="tonal"
            border="start"
            class="mb-2"
          >
            Modifications enregistrées.
          </v-alert>
          <v-alert
            v-if="saveError"
            type="error"
            variant="tonal"
            border="start"
            class="mb-2"
          >
            {{ saveError }}
          </v-alert>
        </v-col>
      </v-row>

      <v-row>
        <v-col
          cols="12"
          md="8"
        >
          <v-form @submit.prevent="onSave">
            <DateFormCard
              v-model="form"
              :status-options="statuses"
              :allow-individual="!isCustomTravel"
              title="Paramètres de la date"
              subtitle="Informations publiques et opérationnelles"
              :readonly-booked-seat="true"
            >
              <template #top-actions>
                <v-chip
                  v-if="form.is_indiv_travel"
                  color="blue"
                  size="small"
                  label
                >
                  Voyage individuel
                </v-chip>
              </template>
              <template #travel>
                <v-text-field
                  :model-value="form.travel_slug"
                  label="Slug du voyage"
                  readonly
                  density="comfortable"
                  class="flex-1"
                />
              </template>
              <template #actions>
                <v-btn
                  variant="text"
                  @click="onCancel"
                >
                  Annuler
                </v-btn>
                <v-btn
                  color="primary"
                  type="submit"
                  :loading="saving"
                >
                  Sauvegarder
                </v-btn>
              </template>
            </DateFormCard>
          </v-form>

          <v-card
            class="mt-4 glass-surface"
            rounded="lg"
            elevation="6"
          >
            <v-card-text>
              <div class="d-flex align-center justify-space-between mb-3">
                <div class="d-flex align-center ga-2">
                  <v-chip
                    color="primary"
                    label
                    size="small"
                  >
                    Funnel
                  </v-chip>
                  <v-select
                    v-model="funnelLinkType"
                    :items="funnelLinkTypes"
                    item-title="label"
                    item-value="value"
                    hide-details
                    density="compact"
                    style="max-width: 200px;"
                  />
                </div>
                <v-btn
                  size="small"
                  variant="tonal"
                  color="primary"
                  @click="copyFunnelLink"
                >
                  Copier
                </v-btn>
              </div>
              <v-text-field
                :model-value="funnelLink"
                readonly
                label="Lien funnel"
                density="comfortable"
              />
            </v-card-text>
          </v-card>

          <v-card
            class="mt-4 glass-surface"
            rounded="lg"
            elevation="6"
          >
            <v-card-text>
              <div class="d-flex align-center justify-space-between mb-2">
                <div>
                  <div class="text-subtitle-1 font-weight-bold">
                    Prévisualisation
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Affichage site public
                  </div>
                </div>
                <v-chip
                  :color="form.published && !form.is_indiv_travel ? 'green-light' : 'warning'"
                  size="small"
                >
                  {{ form.is_indiv_travel ? 'Individuel' : form.published ? 'Publiée' : 'Non publiée' }}
                </v-chip>
              </div>
              <DatesPricesItem :date="previewDate" />
            </v-card-text>
          </v-card>
        </v-col>

        <v-col
          cols="12"
          md="4"
          class="d-flex flex-column ga-4"
        >
          <v-card
            rounded="lg"
            class="pa-4 glass-surface"
            variant="outlined"
            elevation="6"
          >
            <div class="d-flex justify-space-between align-center mb-3">
              <div class="d-flex flex-column">
                <span class="text-subtitle-1 font-weight-bold">Vue d'ensemble</span>
                <span class="text-caption text-medium-emphasis">Capacité & paiements</span>
              </div>
              <v-chip
                label
                size="small"
              >
                {{ form.booked_seat || 0 }} / {{ form.max_travelers || '?' }}
              </v-chip>
            </div>
            <v-row>
              <v-col cols="6">
                <div class="text-caption text-medium-emphasis">
                  Total payé
                </div>
                <div class="text-h6 font-weight-bold">
                  {{ formatNumber(totalPaid) }} €
                </div>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-medium-emphasis">
                  Reste à encaisser
                </div>
                <div class="text-h6 font-weight-bold">
                  {{ formatNumber(totalRestToPay) }} €
                </div>
              </v-col>
            </v-row>
            <div class="text-caption text-medium-emphasis">
              Valeur totale: {{ formatNumber(totalValue) }} €
            </div>
          </v-card>

          <v-card
            rounded="lg"
            variant="outlined"
            class="glass-surface"
            elevation="6"
          >
            <v-card-title class="pb-0">
              Voyageurs
            </v-card-title>
            <v-card-text>
              <div
                v-for="traveler in bookedTravelers"
                :key="traveler.id"
                class="py-2 d-flex flex-column"
              >
                <div class="d-flex align-center">
                  <NuxtLink
                    :to="`https://odysway90522.activehosted.com/app/deals/${traveler.deal_id}`"
                    target="_blank"
                    class="text-body-2 font-weight-medium d-flex align-center ga-2"
                  >
                    <span>{{ traveler.name?.trim() ? traveler.name : traveler.email }}</span>
                    <v-badge
                      v-if="traveler.booked_places > 0"
                      :content="traveler.booked_places"
                      color="primary"
                      inline
                      size="small"
                    />
                    <v-icon size="x-small">{{ mdiArrowRight }}</v-icon>
                  </NuxtLink>
                  <v-spacer />
                  <v-btn
                    icon
                    size="x-small"
                    color="primary"
                    variant="text"
                    @click="openPaymentDialog(traveler)"
                  >
                    <v-icon>{{ mdiLinkEdit }}</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    size="x-small"
                    color="error"
                    variant="text"
                    @click="deleteTraveler(traveler.id)"
                  >
                    <v-icon>{{ mdiDelete }}</v-icon>
                  </v-btn>
                </div>
                <div
                  v-if="traveler.is_option"
                  class="mt-1"
                >
                  <v-chip
                    color="red"
                    label
                    size="x-small"
                  >
                    Option jusqu'au {{ dayjs(traveler.expiracy_date).format('DD/MM/YYYY') }}
                  </v-chip>
                </div>
                <div class="text-caption text-medium-emphasis">
                  Prix payé: {{ formatNumber(traveler.alreadyPaid) }} € | Reste: {{ formatNumber(traveler.restToPay) }} € | Total: {{ formatNumber(traveler.price) }} €
                </div>
              </div>

              <v-divider class="my-3" />

              <v-expansion-panels>
                <v-expansion-panel>
                  <v-expansion-panel-title>Assigner un deal AC</v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-form @submit.prevent="onAssignDeal">
                      <v-text-field
                        v-model="dealUrl"
                        label="URL du deal AC"
                        required
                        density="comfortable"
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
                        <div v-if="assignDealError.includes('/booking-management/')">
                          <NuxtLink
                            :to="assignDealError"
                            class="text-white"
                          >
                            Deal déjà assigné à cette date
                            <v-icon>{{ mdiArrowRight }}</v-icon>
                          </NuxtLink>
                        </div>
                        <div v-else>
                          {{ assignDealError }}
                        </div>
                      </v-alert>
                    </v-form>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card-text>
          </v-card>

          <v-card
            v-if="prospectTravelers.length"
            rounded="lg"
            variant="outlined"
            class="glass-surface"
            elevation="6"
          >
            <v-card-title class="pb-0">
              Prospects en attente
            </v-card-title>
            <v-card-text>
              <div
                v-for="traveler in prospectTravelers"
                :key="traveler.id"
                class="py-2 d-flex align-center"
              >
                <NuxtLink
                  :to="`https://odysway90522.activehosted.com/app/deals/${traveler.deal_id}`"
                  target="_blank"
                  class="d-flex align-center ga-2 text-body-2"
                >
                  <span>{{ traveler.email || 'DEAL AC SUPPRIMÉ' }}</span>
                  <v-badge
                    :icon="mdiInformationOutline"
                    inline
                    color="red"
                    text-color="white"
                    size="small"
                  />
                  <v-icon size="x-small">{{ mdiArrowRight }}</v-icon>
                </NuxtLink>
                <v-spacer />
                <v-btn
                  v-if="traveler.email"
                  icon
                  size="x-small"
                  color="primary"
                  variant="text"
                  @click="openPaymentDialog(traveler)"
                >
                  <v-icon>{{ mdiLinkEdit }}</v-icon>
                </v-btn>
                <v-btn
                  icon
                  size="x-small"
                  color="error"
                  variant="text"
                  @click="deleteTraveler(traveler.id)"
                >
                  <v-icon>{{ mdiDelete }}</v-icon>
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Payment Link Dialog -->
      <v-dialog
        v-model="paymentDialog"
        max-width="420"
      >
        <v-card>
          <v-card-title>Générer un lien de paiement</v-card-title>
          <v-card-text>
            <div v-if="selectedTraveler">
              <div class="text-body-2 mb-2">
                <b>Voyageur:</b> {{ selectedTraveler.name || selectedTraveler.email }}
              </div>
              <v-select
                v-model="paymentType"
                :items="paymentTypes"
                label="Type de paiement"
                item-title="label"
                item-value="value"
                density="comfortable"
              />
              <v-text-field
                v-if="paymentType === 'custom'"
                v-model="customAmount"
                label="Montant personnalisé (€)"
                type="number"
                density="comfortable"
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
    </template>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mdiArrowRight, mdiDelete, mdiLinkEdit, mdiInformationOutline } from '@mdi/js'
import dayjs from 'dayjs'
import DateFormCard from '~/components/booking/DateFormCard.vue'
import { BOOKING_STATUSES } from '~/utils/bookingStatuses'
import { bookingApi, getApiErrorMessage } from '~/utils/bookingApi'

definePageMeta({
  layout: 'booking',
  middleware: 'booking-management',
})
const route = useRoute()
const router = useRouter()
const slug = route.params.slug
const dateId = route.params.dateId
const config = useRuntimeConfig()
const form = ref({})
const bookedTravelers = ref([])
const prospectTravelers = ref([])
const loading = ref(true)
const sanity = useSanity()
const snackbar = ref(false)
const voyageQuery = groq`*[_type == "voyage" && slug.current == $slug][0]{
  title,
  pricing,
  availabilityTypes
}`
const { data: voyagePricing } = await useAsyncData('voyagePricing', () =>
  sanity.fetch(voyageQuery, { slug }),
)
const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)
const statuses = BOOKING_STATUSES
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

const funnelLinkType = ref('deposit')
const funnelLinkTypes = [
  { value: 'deposit', label: 'Acompte' },
  // { value: 'full', label: 'Total' },
]
const funnelLink = computed(() => {
  if (!form.value.id) return ''
  return `${config.public.siteURL}/checkout?date_id=${form.value.id}&type=${funnelLinkType.value}${funnelLinkType.value === 'deposit' ? `&step=1&voyage=${form.value.travel_slug}` : ''}`
})

const voyageTitle = computed(() => voyagePricing.value?.title)
const isCustomTravel = computed(() => voyagePricing.value?.availabilityTypes?.includes('custom'))

const previewDate = computed(() => ({
  ...form.value,
  lastMinutePrice: voyagePricing.value?.pricing?.lastMinuteReduction || 0,
  earlyBirdPrice: voyagePricing.value?.pricing?.earlyBirdReduction || 0,
}))

const fetchDetails = async () => {
  try {
    const [date, travelers] = await Promise.all([
      bookingApi.getDateById(dateId),
      bookingApi.getBooked(slug, dateId),
    ])
    form.value = { ...date, index: 0, badges: date.badges || date.displayed_badges }
    bookedTravelers.value = (travelers || []).filter(traveler => traveler.booked_places > 0)
    prospectTravelers.value = (travelers || []).filter(traveler => traveler.booked_places === 0)
  }
  finally {
    loading.value = false
  }
}

const onSave = async () => {
  saveError.value = ''
  saveSuccess.value = false
  saving.value = true
  try {
    await bookingApi.updateDate(slug, dateId, form.value)
    saveSuccess.value = true
    await fetchDetails()
  }
  catch (err) {
    saveError.value = getApiErrorMessage(err, 'Erreur lors de la sauvegarde.')
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
    const match = dealUrl.value.match(/deals\/(\d+)$/)
    if (!match) {
      assignDealError.value = 'URL invalide.'
      assigningDeal.value = false
      return
    }
    const dealId = match[1]
    await bookingApi.assignDeal(slug, dateId, { dealId })
    assignDealSuccess.value = true
    dealUrl.value = ''
    await fetchDetails()
  }
  catch (err) {
    const redirectTo = err?.data?.data?.redirectTo || err?.data?.redirectTo
    if (redirectTo) {
      assignDealError.value = redirectTo
    }
    else {
      assignDealError.value = getApiErrorMessage(err, 'Erreur lors de l\'assignation.')
    }
  }
  finally {
    assigningDeal.value = false
  }
}

const deleteTraveler = async (id) => {
  if (!confirm('Supprimer ce voyageur ?')) return
  await bookingApi.deleteBooked(slug, dateId, id)
  await fetchDetails()
}

function openPaymentDialog(traveler) {
  selectedTraveler.value = traveler
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

function copyFunnelLink() {
  if (funnelLink.value) {
    navigator.clipboard.writeText(funnelLink.value)
    snackbar.value = true
  }
}

const totalPaid = computed(() => bookedTravelers.value.reduce((acc, traveler) => acc + traveler.alreadyPaid, 0))
const totalRestToPay = computed(() => bookedTravelers.value.reduce((acc, traveler) => acc + traveler.restToPay, 0))
const totalValue = computed(() => bookedTravelers.value.reduce((acc, traveler) => acc + traveler.price, 0))

onMounted(fetchDetails)
</script>
