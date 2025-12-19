<template>
  <v-container
    fluid
    class="py-6 glass-page"
  >
    <v-row class="align-center mb-6">
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
              Nouvelle date de voyage
            </h1>
            <p class="text-body-2 text-medium-emphasis">
              Sélectionnez un voyage, ajustez les informations et publiez quand c’est prêt.
            </p>
          </div>
          <v-chip
            v-if="selectedTravel?.availabilityTypes?.includes('custom')"
            color="purple"
            label
          >
            Voyage sur-mesure
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
          variant="flat"
          :disabled="!form.travel_slug || saving"
          :loading="saving"
          @click="onSave"
        >
          Enregistrer la date
        </v-btn>
      </v-col>
    </v-row>

    <v-row class="ga-4">
      <v-col cols="12">
        <v-form @submit.prevent="onSave">
          <DateFormCard
            v-model="form"
            :status-options="statuses"
            :allow-individual="!isCustomTravel"
            :show-custom-display="!isCustomTravel"
            readonly-booked-seat
            title="Date & affichage"
            subtitle="Données publiques et internes"
          >
            <template #travel>
              <v-autocomplete
                v-if="!route.query.slug"
                v-model="form.travel_slug"
                :items="travelesList"
                item-title="title"
                item-value="slug"
                label="Voyage"
                clearable
                hide-details
                density="comfortable"
                class="flex-1"
                @update:model-value="onTravelSelect"
              />
              <div
                v-else
                class="w-100"
              >
                <v-text-field
                  :model-value="travelesMap[form.travel_slug]?.title"
                  label="Voyage sélectionné"
                  readonly
                  density="comfortable"
                />
              </div>
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
                :disabled="!form.travel_slug || saving"
                :loading="saving"
              >
                Créer la date
              </v-btn>
            </template>
          </DateFormCard>
        </v-form>
      </v-col>

      <v-col
        cols="12"

        class="d-flex flex-column ga-4"
      >
        <v-card
          v-if="!isCustomTravel && form.travel_slug"
          rounded="lg"
          elevation="8"
          class="pa-4 glass-surface"
        >
          <div class="d-flex justify-space-between align-center mb-3">
            <div class="d-flex flex-column">
              <span class="text-subtitle-1 font-weight-bold">Prévisualisation</span>
              <span class="text-caption text-medium-emphasis">Affichage site</span>
            </div>
            <v-chip
              :color="form.published ? 'green-light' : 'warning'"
              size="small"
            >
              {{ form.published ? 'Publiée' : 'Non publiée' }}
            </v-chip>
          </div>
          <DatesPricesItem :date="previewDate" />
        </v-card>

        <v-alert
          v-if="saveSuccess"
          type="success"
          border="start"
          variant="tonal"
          class="mt-2 glass-subtle"
        >
          Date ajoutée, redirection en cours...
        </v-alert>
        <v-alert
          v-if="saveError"
          type="error"
          border="start"
          variant="tonal"
          class="mt-2"
        >
          {{ saveError }}
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import dayjs from 'dayjs'
import DateFormCard from '~/components/booking/DateFormCard.vue'
import { BOOKING_STATUSES, DEFAULT_STATUS } from '~/utils/bookingStatuses'

definePageMeta({
  layout: 'booking',
  middleware: 'booking-management',
})
const router = useRouter()
const route = useRoute()
const slugFromQuery = route.query.slug

const form = ref({
  index: 0,
  travel_slug: slugFromQuery || '',
  published: false,
  is_indiv_travel: false,
  status: DEFAULT_STATUS,
  displayed_status: DEFAULT_STATUS,
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
  displayed_booked_seat: null,
})

const statuses = BOOKING_STATUSES
const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)
const travelesList = ref([])
const travelesMap = ref({})
const isCustomTravel = ref(false)
const sanity = useSanity()
const travelesQuery = groq`*[_type == "voyage"]{
    slug,
    title,
    customAvailable,
    availabilityTypes,
    pricing
  }`
const { data: list } = await useAsyncData('travel', () =>
  sanity.fetch(travelesQuery),
)

const fetchTravels = () => {
  travelesList.value = list.value?.map(t => ({
    title: t.title,
    slug: t.slug.current,
    availabilityTypes: t.availabilityTypes,
    pricing: t.pricing,
  })) || []
  travelesMap.value = Object.fromEntries(travelesList.value.map(t => [t.slug, t]))
}

const selectedTravel = computed(() => travelesMap.value[form.value.travel_slug])

const onTravelSelect = (slug) => {
  const travel = travelesMap.value[slug]
  isCustomTravel.value = travel?.availabilityTypes?.includes('custom')
  if (travel) {
    form.value.min_travelers = travel.pricing?.minTravelersToConfirm || 2
    form.value.max_travelers = travel.pricing?.maxTravelers || 10
    form.value.starting_price = travel.pricing?.startingPrice || 0
  }
}

const previewDate = computed(() => ({
  ...form.value,
}))

const onSave = async () => {
  saveError.value = ''
  saveSuccess.value = false
  saving.value = true
  try {
    const payload = { ...form.value }
    delete payload.index
    if (isCustomTravel.value) {
      Object.assign(payload, { is_custom_travel: true })
    }
    if (!payload.displayed_status) {
      payload.displayed_status = payload.status
    }

    const res = await fetch('/api/v1/booking/add-date', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (res.ok && !data.error) {
      saveSuccess.value = true
      setTimeout(() => router.push(`/booking-management/${form.value.travel_slug}`), 600)
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

watch(
  form,
  (newVal) => {
    if (newVal.is_indiv_travel) {
      form.value.published = false
    }
  },
  { deep: true },
)

onMounted(() => {
  fetchTravels()
  if (slugFromQuery) onTravelSelect(slugFromQuery)
})
</script>
