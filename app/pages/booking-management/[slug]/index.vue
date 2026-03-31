<template>
  <v-container
    fluid
    class="py-6"
  >
    <v-row class="align-center mb-4">
      <v-col
        cols="12"
        md="8"
      >
        <div class="d-flex align-center ga-2 mb-1">
          <h1 class="text-h5 font-weight-bold">
            {{ voyage?.title || slug }}
          </h1>
          <NuxtLink
            :to="`/voyages/${slug}`"
            target="_blank"
            class="text-medium-emphasis"
          >
            <v-icon size="16">
              {{ mdiArrowRight }}
            </v-icon>
          </NuxtLink>
        </div>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Gerer les departs, dupliquer, supprimer et acceder aux reservations.
        </p>
      </v-col>
      <v-col
        cols="12"
        md="4"
        class="d-flex justify-end ga-2"
      >
        <v-btn
          variant="tonal"
          size="small"
          :loading="loading"
          @click="fetchDates"
        >
          Rafraichir
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          size="small"
          :prepend-icon="mdiPlus"
          @click="goToAddDate"
        >
          Ajouter une date
        </v-btn>
      </v-col>
    </v-row>

    <!-- Filters bar -->
    <div class="d-flex align-center ga-3 mb-4 flex-wrap">
      <v-chip-group
        v-model="timeframe"
        selected-class="bg-primary text-white"
      >
        <v-chip
          value="upcoming"
          label
          size="small"
        >
          A venir
        </v-chip>
        <v-chip
          value="ongoing"
          label
          size="small"
          :class="hasOngoingDates ? 'ongoing-pulse' : ''"
        >
          En cours
        </v-chip>
        <v-chip
          value="past"
          label
          size="small"
        >
          Passees
        </v-chip>
        <v-chip
          value="all"
          label
          size="small"
        >
          Toutes
        </v-chip>
      </v-chip-group>
      <v-spacer />
      <v-select
        v-model="publicationFilter"
        :items="publicationOptions"
        item-title="label"
        item-value="value"
        label="Publication"
        density="compact"
        hide-details
        style="max-width: 180px;"
      />
      <v-select
        v-model="sortBy"
        :items="sortOptions"
        item-title="label"
        item-value="value"
        label="Trier"
        density="compact"
        hide-details
        style="max-width: 180px;"
      />
    </div>

    <v-card
      rounded="lg"
      class="bo-card"
      elevation="0"
    >
      <v-data-table
        :headers="headers"
        :items="filteredDates"
        :loading="loading"
        item-key="id"
        hover
        :items-per-page="12"
        class="elevation-0"
        density="compact"
      >
        <template #item="{ item }">
          <tr
            class="cursor-pointer"
            @click="goToDate(item.id)"
          >
            <td>
              <v-chip
                :color="item.is_indiv_travel ? 'info' : item.published ? 'success' : 'warning'"
                label
                size="x-small"
                variant="tonal"
              >
                {{ item.is_indiv_travel ? 'Individuel' : item.published ? 'Publiee' : 'Brouillon' }}
              </v-chip>
            </td>
            <td class="text-body-2">
              {{ dayjs(item.departure_date).format('DD/MM/YYYY') }}
            </td>
            <td class="text-body-2">
              {{ dayjs(item.return_date).format('DD/MM/YYYY') }}
            </td>
            <td>
              <span class="font-weight-medium text-body-2">
                {{ getDateStatus(item)?.text || '-' }}
              </span>
              <v-chip
                v-if="isOngoing(item)"
                color="success"
                size="x-small"
                label
                variant="tonal"
                class="ml-2 ongoing-pulse"
              >
                En cours
              </v-chip>
            </td>
            <td class="text-body-2">
              {{ item.booked_seat || 0 }} / {{ item.max_travelers || '?' }}
            </td>
            <td class="text-right">
              <v-menu>
                <template #activator="{ props }">
                  <v-btn
                    :icon="mdiDotsVertical"
                    size="x-small"
                    variant="text"
                    v-bind="props"
                    @click.stop
                  />
                </template>
                <v-list density="compact">
                  <v-list-item
                    :prepend-icon="mdiEye"
                    @click="goToDate(item.id)"
                  >
                    Modifier
                  </v-list-item>
                  <v-list-item
                    :prepend-icon="mdiContentCopy"
                    @click="duplicateDate(item)"
                  >
                    Dupliquer
                  </v-list-item>
                  <v-list-item
                    :prepend-icon="mdiDelete"
                    class="text-error"
                    @click="deleteDate(item)"
                  >
                    Supprimer
                  </v-list-item>
                </v-list>
              </v-menu>
            </td>
          </tr>
        </template>
        <template #no-data>
          <div class="text-center py-8 text-medium-emphasis">
            Aucune date pour le moment.
          </div>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { mdiContentCopy, mdiDotsVertical, mdiDelete, mdiEye, mdiArrowRight, mdiPlus } from '@mdi/js'
import { bookingApi, getApiErrorMessage } from '~/utils/bookingApi'

const loading = ref(false)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

definePageMeta({ layout: 'booking', middleware: 'booking-management' })

const route = useRoute()
const router = useRouter()
const slug = route.params.slug
const dates = ref([])
const voyage = ref(null)
const timeframe = ref('upcoming')
const publicationFilter = ref('all')
const sortBy = ref('departure_asc')

const headers = [
  { title: 'Publication', key: 'published', sortable: true },
  { title: 'Date de départ', key: 'departure_date', sortable: true },
  { title: 'Date de retour', key: 'return_date', sortable: true },
  { title: 'Statut affiché', key: 'displayed_status', sortable: true },
  { title: 'Voyageurs', key: 'travelers', sortable: false },
  { title: '', key: 'actions', sortable: false },
]
const publicationOptions = [
  { label: 'Tous', value: 'all' },
  { label: 'Publiés', value: 'published' },
  { label: 'Non publiés', value: 'draft' },
  { label: 'Individuels', value: 'indiv' },
]
const sortOptions = [
  { label: 'Départ (croissant)', value: 'departure_asc' },
  { label: 'Départ (décroissant)', value: 'departure_desc' },
  { label: 'Places réservées', value: 'booked_desc' },
]

const sanity = useSanity()
const voyageQuery = groq`*[_type == "voyage" && slug.current == $slug][0]{
    title
  }`
const { data: voyageSanity } = await useAsyncData('voyage', () =>
  sanity.fetch(voyageQuery, { slug }),
)
const fetchDates = async () => {
  loading.value = true
  try {
    voyage.value = voyageSanity.value
    dates.value = await bookingApi.getDatesBySlug(slug)
  }
  catch (err) {
    console.error(getApiErrorMessage(err, 'Erreur chargement dates'))
    dates.value = []
  }
  finally {
    loading.value = false
  }
}

const filteredDates = computed(() => {
  const today = dayjs().startOf('day')
  console.log('dates', dates.value)
  const base = dates.value.filter((item) => {
    if (publicationFilter.value === 'published' && !item.published) return false
    if (publicationFilter.value === 'draft' && item.published) return false
    if (publicationFilter.value === 'indiv' && !item.is_indiv_travel) return false

    if (timeframe.value === 'upcoming') {
      return dayjs(item.departure_date).isAfter(today)
    }
    if (timeframe.value === 'ongoing') {
      return isOngoing(item)
    }
    if (timeframe.value === 'past') {
      return isPast(item)
    }
    return true
  })

  if (sortBy.value === 'departure_desc') {
    return base.sort((a, b) => dayjs(b.departure_date).valueOf() - dayjs(a.departure_date).valueOf())
  }
  if (sortBy.value === 'booked_desc') {
    return base.sort((a, b) => (b.booked_seat || 0) - (a.booked_seat || 0))
  }
  return base.sort((a, b) => dayjs(a.departure_date).valueOf() - dayjs(b.departure_date).valueOf())
})

const goToDate = (id) => {
  router.push(`/booking-management/${slug}/${id}`)
}

const goToAddDate = () => {
  router.push(`/booking-management/add-date?slug=${encodeURIComponent(slug)}`)
}

const duplicateDate = async (date) => {
  if (!confirm('Dupliquer cette date ?')) return
  try {
    await bookingApi.duplicateDate(slug, date.id)
    await fetchDates()
  }
  catch (err) {
    alert(getApiErrorMessage(err, 'Erreur lors de la duplication'))
  }
}

const deleteDate = async (date) => {
  if (!confirm('Supprimer cette date ? Attention, toutes les réservations associées à cette date seront également supprimées.')) return
  try {
    await bookingApi.deleteDate(slug, date.id)
    await fetchDates()
  }
  catch (err) {
    alert(getApiErrorMessage(err, 'Erreur lors de la suppression'))
  }
}

const isOngoing = (item) => {
  const today = dayjs().startOf('day')
  const dep = dayjs(item.departure_date)
  const ret = dayjs(item.return_date)
  return today.isSameOrAfter(dep) && today.isSameOrBefore(ret)
}

const isPast = (item) => {
  const today = dayjs().startOf('day')
  const ret = dayjs(item.return_date)
  return ret.isBefore(today)
}

const hasOngoingDates = computed(() => dates.value.some(isOngoing))

const getDateStatus = (item) => {
  const labelMap = {
    soon_confirmed: 'Bientôt confirmé',
    confirmed: 'Confirmé',
    guaranteed: 'Garanti (Complet)',
  }
  const key = item.displayed_status || item.status
  return { text: labelMap[key] || '-' }
}

onMounted(fetchDates)
</script>

<style scoped>
@keyframes pulseGlow {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 128, 0, 0.35);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 128, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 128, 0, 0);
  }
}

.ongoing-pulse {
  animation: pulseGlow 1.8s ease-out infinite;
}
</style>
