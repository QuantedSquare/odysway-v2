<template>
  <div>
    <BoPageHeader
      title="Nouvelle date de voyage"
      subtitle="Sélectionnez un voyage, ajustez les informations et publiez quand c'est prêt."
      :crumbs="[
        { title: 'Backoffice', to: '/booking-management' },
        { title: 'Voyages', to: '/booking-management' },
        { title: 'Nouvelle date' },
      ]"
    >
      <template #meta>
        <span
          v-if="selectedTravel?.availabilityTypes?.includes('custom')"
          class="bo-tag bo-tag--info"
        >Sur-mesure</span>
      </template>

      <template #actions>
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
      </template>
    </BoPageHeader>

    <div class="bo-well">
      <div
        v-if="saveSuccess"
        class="bo-notice bo-notice--ok"
      >
        <div class="bo-notice__body">
          Date ajoutée, redirection en cours…
        </div>
      </div>
      <div
        v-if="saveError"
        class="bo-notice bo-notice--crit"
      >
        <div class="bo-notice__body">
          {{ saveError }}
        </div>
      </div>

      <div class="bo-split">
        <v-form @submit.prevent="onSave">
          <DateFormCard
            v-model="form"
            :status-options="statuses"
            :allow-individual="!isCustomTravel"
            :show-custom-display="!isCustomTravel"
            readonly-booked-seat
            title="Date & affichage"
            subtitle="Donnees publiques et internes"
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
                style="max-width: 360px;"
                @update:model-value="onTravelSelect"
              />
              <v-text-field
                v-else
                :model-value="travelesMap[form.travel_slug]?.title"
                label="Voyage sélectionné"
                readonly
                style="max-width: 360px;"
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
                variant="flat"
                type="submit"
                :disabled="!form.travel_slug || saving"
                :loading="saving"
              >
                Créer la date
              </v-btn>
            </template>
          </DateFormCard>
        </v-form>

        <!-- Prévisualisation -->
        <section
          v-if="!isCustomTravel && form.travel_slug"
          class="bo-card"
        >
          <div class="bo-card__head">
            <h2 class="bo-card__title">
              Prévisualisation
            </h2>
            <v-spacer />
            <span
              class="bo-tag"
              :class="form.published ? 'bo-tag--ok' : 'bo-tag--warn'"
            >
              {{ form.published ? 'Publiée' : 'Non publiée' }}
            </span>
          </div>
          <div class="bo-card__body">
            <p class="bo-hint mb-3">
              Rendu sur le site public, avec les valeurs affichées.
            </p>
            <v-theme-provider theme="odysway">
              <DatesPricesItem :date="previewDate" />
            </v-theme-provider>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import dayjs from 'dayjs'
import BoPageHeader from '~/components/booking/BoPageHeader.vue'
import DateFormCard from '~/components/booking/DateFormCard.vue'
import { BOOKING_STATUSES, DEFAULT_STATUS } from '~/utils/bookingStatuses'
import { bookingApi, getApiErrorMessage } from '~/utils/bookingApi'

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
  displayed_status: null,
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
  co_filling: 0,
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
    await bookingApi.addDate(payload)
    saveSuccess.value = true
    setTimeout(() => router.push(`/booking-management/${form.value.travel_slug}`), 600)
  }
  catch (err) {
    saveError.value = getApiErrorMessage(err, 'Erreur lors de l\'ajout.')
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
