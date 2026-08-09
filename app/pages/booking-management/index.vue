<template>
  <div>
    <BoPageHeader
      title="Voyages"
      subtitle="Catalogue groupe et sur-mesure, accès direct aux dates de départ."
      :crumbs="[{ title: 'Backoffice', to: '/booking-management' }, { title: 'Voyages' }]"
    >
      <template #actions>
        <v-btn
          :prepend-icon="mdiPlus"
          color="primary"
          variant="flat"
          @click="goToAddDate"
        >
          Ajouter une date
        </v-btn>
      </template>
    </BoPageHeader>

    <div class="bo-well">
      <section class="bo-stats">
        <div class="bo-stat">
          <div class="bo-stat__k">
            Voyages
          </div>
          <div class="bo-stat__v">
            {{ stats.travels }}
          </div>
          <div class="bo-stat__n">
            {{ stats.group }} groupe · {{ stats.custom }} sur-mesure
          </div>
        </div>
        <div class="bo-stat">
          <div class="bo-stat__k">
            Dates à venir
          </div>
          <div class="bo-stat__v">
            {{ stats.upcomingDates }}
          </div>
          <div class="bo-stat__n">
            sur {{ stats.allDates }} dates au total
          </div>
        </div>
        <div class="bo-stat">
          <div class="bo-stat__k">
            Places réservées
          </div>
          <div class="bo-stat__v">
            {{ formatCount(stats.upcomingBooked) }}
          </div>
          <div class="bo-stat__n">
            sur les départs à venir
          </div>
        </div>
        <div class="bo-stat">
          <div class="bo-stat__k">
            Remplissage moyen
          </div>
          <div class="bo-stat__v">
            {{ stats.fillRate }}<span class="bo-stat__unit"> %</span>
          </div>
          <div class="bo-stat__n">
            <span
              v-if="stats.ongoing"
              class="bo-tag bo-tag--accent"
            >
              <span class="bo-dot bo-dot--live" />
              {{ stats.ongoing }} départ{{ stats.ongoing > 1 ? 's' : '' }} en cours
            </span>
            <span v-else>Aucun départ en cours</span>
          </div>
        </div>
      </section>

      <section class="bo-card">
        <div class="bo-card__head">
          <v-btn-toggle
            v-model="tab"
            mandatory
            class="bo-seg"
            density="compact"
          >
            <v-btn value="catalogue">
              Groupe <span class="bo-seg__n">{{ stats.group }}</span>
            </v-btn>
            <v-btn value="custom">
              Sur-mesure <span class="bo-seg__n">{{ stats.custom }}</span>
            </v-btn>
          </v-btn-toggle>

          <v-text-field
            v-model="search"
            :prepend-inner-icon="mdiMagnify"
            placeholder="Rechercher un titre ou un slug…"
            aria-label="Rechercher un voyage"
            clearable
            style="max-width: 320px;"
          />

          <v-spacer />

          <v-select
            v-model="sortBy"
            :items="sortOptions"
            item-title="label"
            item-value="value"
            aria-label="Trier les voyages"
            style="max-width: 200px;"
          />
        </div>

        <v-data-table
          :headers="headers"
          :items="displayedTravels"
          :loading="loading"
          :items-per-page="50"
          class="bo-table"
        >
          <template #item="{ item }">
            <tr
              class="bo-tr"
              :class="needsAttention(item) ? 'bo-tr--warn' : ''"
              @click="goToTravel(item.travel_slug)"
            >
              <td>
                <div class="bo-cell">
                  <!--
                    `item.image` est déjà une URL complète du CDN Sanity
                    (image.asset.url) : la passer au provider `sanity` de
                    NuxtImg, qui attend une référence d'asset, ne renvoyait
                    aucune image. On sert l'URL telle quelle.
                  -->
                  <div class="bo-cell__thumb">
                    <img
                      v-if="item.image"
                      :src="`${item.image}?w=64&h=64&fit=crop&auto=format`"
                      alt=""
                      loading="lazy"
                      width="32"
                      height="32"
                    >
                    <v-icon
                      v-else
                      size="16"
                      :icon="mdiImageOff"
                    />
                  </div>
                  <div>
                    <div class="bo-cell__title">
                      {{ item.title || item.travel_slug }}
                    </div>
                    <div class="bo-cell__slug">
                      {{ item.travel_slug }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="text-right bo-num">
                {{ item.upcoming_dates || 0 }}
              </td>
              <td>
                <span
                  v-if="item.ongoing_dates"
                  class="bo-tag bo-tag--accent"
                >
                  <span class="bo-dot bo-dot--live" />
                  {{ item.ongoing_dates }} en cours
                </span>
                <span
                  v-else
                  class="bo-hint"
                >—</span>
              </td>
              <td>
                <BoFillBar
                  :booked="item.upcoming_booked || 0"
                  :total="item.upcoming_capacity || 0"
                />
              </td>
              <td class="text-right bo-num bo-muted">
                {{ item.next_departure ? dayjs(item.next_departure).format('DD MMM YYYY') : '—' }}
              </td>
              <td class="text-right">
                <v-btn
                  variant="text"
                  class="bo-row-action"
                  @click.stop="goToTravel(item.travel_slug)"
                >
                  Ouvrir →
                </v-btn>
              </td>
            </tr>
          </template>

          <template #no-data>
            <div class="bo-empty">
              <p class="mb-3">
                Aucun voyage ne correspond à cette recherche.
              </p>
              <v-btn @click="goToAddDate">
                Ajouter une date
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { mdiMagnify, mdiImageOff, mdiPlus } from '@mdi/js'
import BoPageHeader from '~/components/booking/BoPageHeader.vue'
import BoFillBar from '~/components/booking/BoFillBar.vue'
import { bookingApi, getApiErrorMessage } from '~/utils/bookingApi'

definePageMeta({
  layout: 'booking',
  middleware: 'booking-management',
})

useSeoMeta({
  htmlAttrs: { lang: 'fr' },
  robots: 'noindex, follow',
  canonical: 'https://www.odysway.com/',
})

const search = ref('')
const loading = ref(false)
const tab = ref('catalogue')
const sortBy = ref('dates_desc')
const travels = ref([])
const router = useRouter()
const sanity = useSanity()

const sortOptions = [
  { label: 'Plus de dates', value: 'dates_desc' },
  { label: 'Départ le plus proche', value: 'next_asc' },
  { label: 'Places réservées', value: 'booked_desc' },
  { label: 'Ordre alphabétique', value: 'title_asc' },
]

// Le type est déjà porté par l'onglet actif (Groupe / Sur-mesure) : une colonne
// qui répète la même valeur sur toutes les lignes n'apprend rien et mange la
// largeur du titre.
const headers = [
  { title: 'Voyage', key: 'title', sortable: false, width: '38%' },
  { title: 'Dates à venir', key: 'upcoming_dates', sortable: false, align: 'end', width: 110 },
  { title: 'En cours', key: 'ongoing_dates', sortable: false, width: 110 },
  { title: 'Remplissage', key: 'fill', sortable: false, width: 190 },
  { title: 'Prochain départ', key: 'next_departure', sortable: false, align: 'end', width: 140 },
  { title: '', key: 'actions', sortable: false, width: 90 },
]

const travelsListQuery = groq`*[_type == "voyage"]{
  "slug": slug.current,
  title,
  availabilityTypes,
  image {
    asset -> {
      url
    }
  }
}`
const { data: travelsList } = await useAsyncData('travelsList', () =>
  sanity.fetch(travelsListQuery),
)

const fetchTravels = async () => {
  loading.value = true
  try {
    travels.value = await bookingApi.getTravels()
  }
  catch (err) {
    console.error(getApiErrorMessage(err, 'Erreur chargement voyages'))
    travels.value = []
  }
  finally {
    loading.value = false
  }
}

const mergedTravels = computed(() => {
  return travelsList.value?.map((travel) => {
    const bookingData = travels.value.find(t => t.travel_slug === travel.slug)
    const isCustom = travel.availabilityTypes?.includes('custom') || bookingData?.is_custom_travel
    return {
      ...bookingData,
      travel_slug: travel.slug,
      image: travel.image?.asset?.url,
      title: travel.title,
      nb_dates: bookingData?.nb_dates || 0,
      ongoing_dates: bookingData?.ongoing_dates || 0,
      booked_seats: bookingData?.booked_seats || 0,
      upcoming_dates: bookingData?.upcoming_dates || 0,
      upcoming_booked: bookingData?.upcoming_booked || 0,
      upcoming_capacity: bookingData?.upcoming_capacity || 0,
      next_departure: bookingData?.next_departure || null,
      is_custom_travel: isCustom,
    }
  }) || []
})

const filteredTravels = computed(() => {
  const query = search.value?.toLowerCase() || ''
  return mergedTravels.value.filter((travel) => {
    const matchesTab = tab.value === 'custom' ? travel.is_custom_travel : !travel.is_custom_travel
    const matchesQuery = query
      ? travel.travel_slug?.toLowerCase().includes(query) || travel.title?.toLowerCase().includes(query)
      : true
    return matchesTab && matchesQuery
  })
})

const displayedTravels = computed(() => {
  const sorted = [...filteredTravels.value]
  if (sortBy.value === 'dates_desc') {
    sorted.sort((a, b) => b.upcoming_dates - a.upcoming_dates)
  }
  else if (sortBy.value === 'next_asc') {
    sorted.sort((a, b) => {
      if (!a.next_departure) return 1
      if (!b.next_departure) return -1
      return dayjs(a.next_departure).valueOf() - dayjs(b.next_departure).valueOf()
    })
  }
  else if (sortBy.value === 'booked_desc') {
    sorted.sort((a, b) => b.upcoming_booked - a.upcoming_booked)
  }
  else if (sortBy.value === 'title_asc') {
    sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
  }
  return sorted
})

const stats = computed(() => {
  const all = mergedTravels.value
  const withDates = all.filter(t => t.nb_dates > 0)
  const upcomingBooked = all.reduce((sum, t) => sum + t.upcoming_booked, 0)
  const upcomingCapacity = all.reduce((sum, t) => sum + t.upcoming_capacity, 0)
  return {
    travels: withDates.length,
    group: all.filter(t => !t.is_custom_travel).length,
    custom: all.filter(t => t.is_custom_travel).length,
    allDates: all.reduce((sum, t) => sum + t.nb_dates, 0),
    upcomingDates: all.reduce((sum, t) => sum + t.upcoming_dates, 0),
    upcomingBooked,
    ongoing: all.reduce((sum, t) => sum + t.ongoing_dates, 0),
    fillRate: upcomingCapacity ? Math.round((upcomingBooked / upcomingCapacity) * 100) : 0,
  }
})

// La bande de gauche ne doit signaler que ce qui demande une action *maintenant* :
// un départ proche et sous-rempli. Un simple « peu rempli » concerne presque tout
// le catalogue et transformerait la colonne en décoration.
const needsAttention = (travel) => {
  if (!travel.next_departure || !travel.upcoming_capacity) return false
  const daysToGo = dayjs(travel.next_departure).diff(dayjs(), 'day')
  if (daysToGo > 45) return false
  return travel.upcoming_booked / travel.upcoming_capacity < 0.5
}

// Nombre de places, pas un montant : surtout ne pas masquer l'auto-import
// `formatNumber` de ~/utils/formatNumber, qui lui divise par 100.
const formatCount = value => new Intl.NumberFormat('fr-FR').format(value || 0)

const goToTravel = (slug) => {
  router.push(`/booking-management/${slug}`)
}

const goToAddDate = () => {
  router.push('/booking-management/add-date')
}

onMounted(fetchTravels)
</script>
