<template>
  <v-container
    fluid
    class="py-6"
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
        size="48"
      />
    </v-row>

    <template v-else>
      <!-- Header -->
      <v-row class="align-center mb-4">
        <v-col
          cols="12"
          md="8"
        >
          <div class="d-flex align-center ga-3">
            <div>
              <h1 class="text-h5 font-weight-bold mb-1">
                {{ voyageTitle || form.travel_slug }} — {{ dayjs(form.departure_date).format('DD MMM YYYY') }}
              </h1>
              <p class="text-body-2 text-medium-emphasis mb-0">
                Ajustez les informations, gérez les voyageurs et générez les liens de paiement.
              </p>
            </div>
            <v-chip
              :color="form.published ? 'success' : 'warning'"
              label
              size="x-small"
              variant="tonal"
            >
              {{ form.published ? 'Publiee' : 'Non publiee' }}
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
            size="small"
            @click="onCancel"
          >
            Retour
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            size="small"
            :loading="saving"
            @click="onSave"
          >
            Enregistrer
          </v-btn>
        </v-col>
        <v-col cols="12">
          <BookingDateActivityLog
            :slug="slug"
            :date-id="dateId"
            :fallback-updated-at="form.updated_at"
            :fallback-last-editor="form.last_editor"
          />
        </v-col>
      </v-row>

      <!-- Alerts -->
      <v-alert
        v-if="saveSuccess"
        type="success"
        variant="tonal"
        border="start"
        class="mb-3"
        density="compact"
      >
        Modifications enregistrées.
      </v-alert>
      <v-alert
        v-if="saveError"
        type="error"
        variant="tonal"
        border="start"
        class="mb-3"
        density="compact"
      >
        {{ saveError }}
      </v-alert>

      <!-- Departure deal banner -->
      <v-alert
        v-if="form.departure_id"
        type="success"
        variant="tonal"
        border="start"
        class="mb-4"
        density="compact"
      >
        <div class="d-flex align-center ga-3 flex-wrap">
          <v-icon size="20">
            {{ mdiAirplaneTakeoff }}
          </v-icon>
          <div class="flex-grow-1">
            <span class="font-weight-bold">Dossier de depart</span>
            <span class="text-caption ml-2">AC #{{ form.departure_id }}</span>
          </div>
          <v-btn
            :href="`https://odysway90522.activehosted.com/app/deals/${form.departure_id}`"
            target="_blank"
            color="success"
            variant="tonal"
            size="x-small"
            :append-icon="mdiArrowRight"
          >
            Voir
          </v-btn>
          <v-btn
            icon
            size="x-small"
            color="error"
            variant="text"
            :loading="removingDepartureDeal"
            @click="onRemoveDepartureDeal"
          >
            <v-icon size="16">
              {{ mdiDelete }}
            </v-icon>
          </v-btn>
        </div>
      </v-alert>

      <v-alert
        v-if="!form.departure_id"
        type="warning"
        variant="tonal"
        border="start"
        class="mb-4"
        density="compact"
      >
        <v-expansion-panels
          variant="accordion"
        >
          <v-expansion-panel
            elevation="0"
            bg-color="transparent"
          >
            <v-expansion-panel-title class="pa-0">
              <div class="d-flex align-center ga-2 mx-4">
                <v-icon size="18">
                  {{ mdiAirplaneTakeoff }}
                </v-icon>
                <span class="text-body-2 font-weight-medium">Aucun dossier de départ assigné</span>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-form @submit.prevent="onAssignDepartureDeal">
                <v-text-field
                  v-model="departureDealUrl"
                  label="URL du deal AC (dossier de depart)"
                  placeholder="https://odysway90522.activehosted.com/app/deals/123"
                  density="compact"
                  required
                />
                <v-btn
                  type="submit"
                  color="primary"
                  size="small"
                  :loading="assigningDepartureDeal"
                  :disabled="assigningDepartureDeal"
                >
                  Assigner
                </v-btn>
                <v-alert
                  v-if="assignDepartureDealSuccess"
                  type="success"
                  class="mt-2"
                  density="compact"
                >
                  Dossier assigne !
                </v-alert>
                <v-alert
                  v-if="assignDepartureDealError"
                  type="error"
                  class="mt-2"
                  density="compact"
                >
                  {{ assignDepartureDealError }}
                </v-alert>
              </v-form>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-alert>

      <!-- Main content -->
      <v-row>
        <!-- Left column -->
        <v-col
          cols="12"
          md="8"
        >
          <v-form @submit.prevent="onSave">
            <DateFormCard
              v-model="form"
              :status-options="statuses"
              :allow-individual="!isCustomTravel"
              title="Parametres de la date"
              subtitle="Informations publiques et operationnelles"
              :readonly-booked-seat="true"
            >
              <template #top-actions>
                <v-chip
                  v-if="form.is_indiv_travel"
                  color="info"
                  size="x-small"
                  label
                  variant="tonal"
                >
                  Individuel
                </v-chip>
              </template>
              <template #travel>
                <v-text-field
                  :model-value="form.travel_slug"
                  label="Slug du voyage"
                  readonly
                  density="compact"
                  class="flex-1"
                />
              </template>
              <template #actions>
                <v-btn
                  variant="text"
                  size="small"
                  @click="onCancel"
                >
                  Annuler
                </v-btn>
                <v-btn
                  color="primary"
                  type="submit"
                  size="small"
                  :loading="saving"
                >
                  Sauvegarder
                </v-btn>
              </template>
            </DateFormCard>
          </v-form>
        </v-col>

        <!-- Right column -->
        <v-col
          cols="12"
          md="4"
          class="d-flex flex-column ga-4"
        >
          <!-- Overview -->
          <v-card
            rounded="lg"
            class="pa-4 bo-card"
            elevation="0"
          >
            <div class="d-flex justify-space-between align-center mb-3">
              <span class="bo-section-title mb-0">Vue d'ensemble</span>
              <v-chip
                label
                size="x-small"
                variant="tonal"
                color="primary"
              >
                {{ form.booked_seat || 0 }} / {{ form.max_travelers || '?' }}
              </v-chip>
            </div>
            <v-row class="mb-2">
              <v-col cols="6">
                <div class="text-caption text-medium-emphasis">
                  Total payé
                </div>
                <div class="text-h5 font-weight-bold text-success">
                  {{ formatNumber(totalPaid) }} €
                </div>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-medium-emphasis">
                  Reste a encaisser
                </div>
                <div class="text-h5 font-weight-bold text-warning">
                  {{ formatNumber(totalRestToPay) }} €
                </div>
              </v-col>
            </v-row>
            <div
              class="text-caption text-medium-emphasis pa-2 rounded bg-surface-variant"
            >
              Valeur totale: <strong>{{ formatNumber(totalValue) }} €</strong>
            </div>
          </v-card>

          <!-- Travelers -->
          <v-card
            rounded="lg"
            class="bo-card"
            elevation="0"
          >
            <v-card-title class="pb-0 text-subtitle-2">
              Voyageurs
            </v-card-title>
            <v-card-text>
              <div
                v-for="(traveler, idx) in bookedTravelers"
                :key="traveler.id"
                class="py-2 d-flex flex-column"
                :class="idx % 2 === 0 ? 'bg-surface-variant rounded px-2' : 'px-2'"
              >
                <div class="d-flex align-center">
                  <v-avatar
                    size="24"
                    color="primary"
                    class="mr-2"
                  >
                    <span style="font-size: 10px; color: white; font-weight: 600;">
                      {{ (traveler.name?.trim() ? traveler.name : traveler.email || '?').slice(0, 1).toUpperCase() }}
                    </span>
                  </v-avatar>
                  <NuxtLink
                    :to="`https://odysway90522.activehosted.com/app/deals/${traveler.deal_id}`"
                    target="_blank"
                    class="text-body-2 font-weight-medium d-flex align-center ga-1"
                  >
                    <span
                      class="text-truncate"
                      style="max-width: 140px;"
                    >
                      {{ traveler.name?.trim() ? traveler.name : traveler.email }}
                    </span>
                    <v-badge
                      v-if="traveler.booked_places > 0"
                      :content="traveler.booked_places"
                      color="primary"
                      inline
                      size="small"
                    />
                    <v-icon size="12">
                      {{ mdiArrowRight }}
                    </v-icon>
                  </NuxtLink>
                  <v-spacer />
                  <v-btn
                    icon
                    size="x-small"
                    color="primary"
                    variant="text"
                    @click="openPaymentDialog(traveler)"
                  >
                    <v-icon size="14">
                      {{ mdiLinkEdit }}
                    </v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    size="x-small"
                    color="error"
                    variant="text"
                    @click="deleteTraveler(traveler.id)"
                  >
                    <v-icon size="14">
                      {{ mdiDelete }}
                    </v-icon>
                  </v-btn>
                </div>
                <div
                  v-if="traveler.is_option"
                  class="mt-1"
                >
                  <v-chip
                    color="error"
                    label
                    size="x-small"
                    variant="tonal"
                  >
                    Option jusqu'au {{ dayjs(traveler.expiracy_date).format('DD/MM/YYYY') }}
                  </v-chip>
                </div>
                <div class="text-caption text-medium-emphasis mt-1">
                  <span class="text-success">{{ formatNumber(traveler.alreadyPaid) }}€</span>
                  <span class="mx-1">·</span>
                  <span class="text-warning">{{ formatNumber(traveler.restToPay) }}€ reste</span>
                  <span class="mx-1">·</span>
                  <span>{{ formatNumber(traveler.price) }}€ total</span>
                </div>
              </div>

              <v-divider class="my-3" />

              <v-expansion-panels>
                <v-expansion-panel elevation="0">
                  <v-expansion-panel-title class="text-body-2">
                    Assigner un deal AC
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-form @submit.prevent="onAssignDeal">
                      <v-text-field
                        v-model="dealUrl"
                        label="URL du deal AC"
                        required
                        density="compact"
                      />
                      <v-switch
                        v-model="assignWithOption"
                        label="Poser une option"
                        density="compact"
                        hide-details
                        class="mb-2"
                      />
                      <v-btn
                        type="submit"
                        color="primary"
                        size="small"
                        :loading="assigningDeal"
                        :disabled="assigningDeal"
                      >
                        Assigner
                      </v-btn>
                      <v-alert
                        v-if="assignDealSuccess"
                        type="success"
                        class="mt-2"
                        density="compact"
                      >
                        Deal assigné !
                      </v-alert>
                      <v-alert
                        v-if="assignDealError"
                        type="error"
                        class="mt-2"
                        density="compact"
                      >
                        <div v-if="assignDealError.includes('/booking-management/')">
                          <NuxtLink
                            :to="assignDealError"
                          >
                            Deal déjà assigné à cette date
                            <v-icon size="14">
                              {{ mdiArrowRight }}
                            </v-icon>
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

          <!-- Prospects -->
          <v-card
            v-if="prospectTravelers.length"
            rounded="lg"
            class="bo-card"
            elevation="0"
          >
            <v-card-title class="pb-0 text-subtitle-2">
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
                  <span>{{ traveler.email || 'DEAL AC SUPPRIME' }}</span>
                  <v-badge
                    :icon="mdiInformationOutline"
                    inline
                    color="error"
                    text-color="white"
                    size="small"
                  />
                  <v-icon size="12">
                    {{ mdiArrowRight }}
                  </v-icon>
                </NuxtLink>
                <v-spacer />
                <v-btn
                  v-if="traveler.email"
                  icon
                  size="x-small"
                  color="warning"
                  variant="text"
                  :loading="placingOptionId === traveler.id"
                  @click="placeOptionOnProspect(traveler)"
                >
                  <v-icon size="14">
                    {{ mdiCalendarOutline }}
                  </v-icon>
                  <v-tooltip
                    activator="parent"
                    location="top"
                  >
                    <div class="text-primary">
                      Poser une option
                    </div>
                  </v-tooltip>
                </v-btn>
                <v-btn
                  v-if="traveler.email"
                  icon
                  size="x-small"
                  color="primary"
                  variant="text"
                  @click="openPaymentDialog(traveler)"
                >
                  <v-icon size="14">
                    {{ mdiLinkEdit }}
                  </v-icon>
                </v-btn>
                <v-btn
                  icon
                  size="x-small"
                  color="error"
                  variant="text"
                  @click="deleteTraveler(traveler.id)"
                >
                  <v-icon size="14">
                    {{ mdiDelete }}
                  </v-icon>
                </v-btn>
              </div>
            </v-card-text>
          </v-card>

          <!-- Notes -->
          <DateNotes
            :slug="slug"
            :date-id="dateId"
          />
        </v-col>
        <v-col>
          <!-- Funnel link -->
          <v-card
            class="mt-4 bo-card"
            rounded="lg"
            elevation="0"
          >
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="d-flex align-center ga-2">
                  <span class="bo-section-title mb-0">Funnel</span>
                  <v-select
                    v-model="funnelLinkType"
                    :items="funnelLinkTypes"
                    item-title="label"
                    item-value="value"
                    hide-details
                    density="compact"
                    style="max-width: 160px;"
                  />
                </div>
                <v-btn
                  size="x-small"
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
                density="compact"
                hide-details
              />
            </v-card-text>
          </v-card>

          <!-- Preview -->
          <v-card
            class="mt-4 bo-card"
            rounded="lg"
            elevation="0"
          >
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-3">
                <div>
                  <span class="bo-section-title mb-0">Previsualisation</span>
                  <div class="text-caption text-medium-emphasis">
                    Affichage site public
                  </div>
                </div>
                <v-chip
                  :color="form.published && !form.is_indiv_travel ? 'success' : 'warning'"
                  size="x-small"
                  label
                  variant="tonal"
                >
                  {{ form.is_indiv_travel ? 'Individuel' : form.published ? 'Publiee' : 'Non publiee' }}
                </v-chip>
              </div>
              <v-theme-provider theme="odysway">
                <DatesPricesItem :date="previewDate" />
              </v-theme-provider>
            </v-card-text>
          </v-card>

          <!-- Attachments -->
          <DateAttachments
            :slug="slug"
            :date-id="dateId"
            class="mt-4"
          />
        </v-col>
      </v-row>

      <!-- Payment Link Dialog -->
      <v-dialog
        v-model="paymentDialog"
        max-width="460"
      >
        <v-card
          rounded="lg"
          class="bo-card"
        >
          <v-card-title class="text-subtitle-1 font-weight-bold">
            Lien de paiement
          </v-card-title>
          <v-card-text>
            <div v-if="selectedTraveler">
              <div class="d-flex align-center ga-3 mb-4 pa-3 bg-surface-variant rounded">
                <v-avatar
                  size="36"
                  color="primary"
                >
                  <span style="font-size: 14px; color: white; font-weight: 600;">
                    {{ (selectedTraveler.name?.trim() ? selectedTraveler.name : selectedTraveler.email || '?').slice(0, 1).toUpperCase() }}
                  </span>
                </v-avatar>
                <div class="flex-grow-1 min-w-0">
                  <div class="text-body-2 font-weight-medium text-truncate text-primary">
                    {{ selectedTraveler.name?.trim() ? selectedTraveler.name : selectedTraveler.email }}
                  </div>
                  <div
                    v-if="selectedTraveler.name?.trim() && selectedTraveler.email"
                    class="text-caption text-medium-emphasis text-truncate"
                  >
                    {{ selectedTraveler.email }}
                  </div>
                </div>
              </div>

              <v-select
                v-model="paymentType"
                :items="paymentTypes"
                label="Type de paiement"
                item-title="label"
                item-value="value"
                density="compact"
                :hint="paymentTypeHints[paymentType]"
                persistent-hint
                class="mb-2"
              />
              <v-text-field
                v-if="paymentType === 'custom'"
                v-model="customAmount"
                label="Montant personnalise (€)"
                type="number"
                density="compact"
                autofocus
                class="mt-3"
              />

              <v-divider class="my-4" />

              <div class="bo-section-title mb-2">
                Lien à transmettre
              </div>
              <v-text-field
                :model-value="generatedLink"
                readonly
                density="compact"
                hide-details
                :placeholder="paymentType === 'custom' && !customAmount ? 'Saisissez un montant pour générer le lien' : ''"
                :disabled="!generatedLink"
                class="mb-3"
              />
              <v-btn
                color="primary"
                variant="tonal"
                size="small"
                block
                :prepend-icon="mdiContentCopy"
                :disabled="!generatedLink"
                @click="copyLink"
              >
                Copier le lien
              </v-btn>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              variant="text"
              size="small"
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
import { mdiArrowRight, mdiDelete, mdiLinkEdit, mdiInformationOutline, mdiAirplaneTakeoff, mdiCalendarOutline, mdiContentCopy } from '@mdi/js'
import dayjs from 'dayjs'
import DateFormCard from '~/components/booking/DateFormCard.vue'
import DateAttachments from '~/components/booking/DateAttachments.vue'
import DateNotes from '~/components/booking/DateNotes.vue'
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
const assignWithOption = ref(false)
const placingOptionId = ref(null)

const departureDealUrl = ref('')
const assigningDepartureDeal = ref(false)
const assignDepartureDealError = ref('')
const assignDepartureDealSuccess = ref(false)
const removingDepartureDeal = ref(false)

const paymentDialog = ref(false)
const selectedTraveler = ref(null)
const paymentType = ref('full')
const customAmount = ref('')
const paymentTypes = [
  { value: 'full', label: 'Faire payer entièrement' },
  { value: 'deposit', label: 'Paiement de l\'acompte' },
  { value: 'custom', label: 'Paiement custom' },
  { value: 'balance', label: 'Paiement du solde' },
]
const paymentTypeHints = {
  full: 'Le voyageur paiera l\'intégralité du voyage.',
  deposit: 'Paiement de l\'acompte (30% + assurance).',
  balance: 'Paiement du solde restant dû.',
  custom: 'Vous définissez un montant libre à payer.',
}
const generatedLink = computed(() => {
  if (!selectedTraveler.value) return ''
  if (paymentType.value === 'custom' && !customAmount.value) return ''
  const amountParam = paymentType.value === 'custom' ? `&amount=${customAmount.value}` : ''
  return `${config.public.siteURL}/checkout?booked_id=${selectedTraveler.value.id}&type=${paymentType.value}${amountParam}`
})

const funnelLinkType = ref('deposit')
const funnelLinkTypes = [
  { value: 'deposit', label: 'Acompte' },
  { value: 'full', label: 'Total' },
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
    const payload = { dealId }
    if (assignWithOption.value) {
      payload.is_option = true
      payload.expiracy_date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }
    await bookingApi.assignDeal(slug, dateId, payload)
    assignDealSuccess.value = true
    dealUrl.value = ''
    assignWithOption.value = false
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

const onRemoveDepartureDeal = async () => {
  if (!confirm('Retirer le dossier de départ de cette date ?')) return
  removingDepartureDeal.value = true
  try {
    await bookingApi.removeDepartureDeal(slug, dateId)
    await fetchDetails()
  }
  catch (err) {
    saveError.value = getApiErrorMessage(err, 'Erreur lors de la suppression du dossier de départ.')
  }
  finally {
    removingDepartureDeal.value = false
  }
}

const onAssignDepartureDeal = async () => {
  assignDepartureDealError.value = ''
  assignDepartureDealSuccess.value = false
  assigningDepartureDeal.value = true
  try {
    const match = departureDealUrl.value.match(/deals\/(\d+)$/)
    if (!match) {
      assignDepartureDealError.value = 'URL invalide.'
      assigningDepartureDeal.value = false
      return
    }
    const dealId = match[1]
    await bookingApi.assignDepartureDeal(slug, dateId, { dealId })
    assignDepartureDealSuccess.value = true
    departureDealUrl.value = ''
    await fetchDetails()
  }
  catch (err) {
    assignDepartureDealError.value = getApiErrorMessage(err, 'Erreur lors de l\'assignation du dossier de départ.')
  }
  finally {
    assigningDepartureDeal.value = false
  }
}

const deleteTraveler = async (id) => {
  if (!confirm('Supprimer ce voyageur ?')) return
  await bookingApi.deleteBooked(slug, dateId, id)
  await fetchDetails()
}

const placeOptionOnProspect = async (traveler) => {
  if (!confirm(`Poser une option pour ${traveler.name || traveler.email} ?`)) return
  placingOptionId.value = traveler.id
  try {
    await bookingApi.placeOption({ id: traveler.id, booked_places: +traveler.nbTravelers || 1 })
    await $fetch(`/api/v1/ac/deals/update-with-bms?bookedId=${traveler.id}`, {
      method: 'POST',
      body: { stage: '27', currentStep: 'A posé une option' },
    })
    await fetchDetails()
  }
  catch (err) {
    saveError.value = getApiErrorMessage(err, 'Erreur lors de la pose d\'option.')
  }
  finally {
    placingOptionId.value = null
  }
}

function openPaymentDialog(traveler) {
  selectedTraveler.value = traveler
  paymentType.value = 'full'
  customAmount.value = ''
  paymentDialog.value = true
}
function closePaymentDialog() {
  paymentDialog.value = false
  selectedTraveler.value = null
}
function copyLink() {
  if (generatedLink.value) {
    navigator.clipboard.writeText(generatedLink.value)
    snackbar.value = true
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
