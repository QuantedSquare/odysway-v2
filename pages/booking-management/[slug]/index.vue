<template>
  <v-container>
    <v-row>
      <v-col cols="8">
        <NuxtLink
          :to="`/voyages/${slug}`"
          class="text-primary"
        >
          <h2 v-if="voyage">{{ voyage.title }}<v-icon size="x-small">{{ mdiArrowRight }}</v-icon></h2>

        </NuxtLink>
      </v-col>
      <v-col
        cols="4"
        class="d-flex justify-end align-center"
      >
        <v-btn @click="goToAddDate">
          + Ajouter une date
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="dates"
          :loading="loading"
          hover
          :sort-by="[{ key: 'departure_date', order: 'asc' }]"
          class="elevation-1"
          item-key="id"
          :items-per-page="10"
          :item-class="(item) => getRowClass(item)"
        >
          <template #item="{ item }">
            <tr
              :class="getRowClass(item)"
              class="cursor-pointer"
              @click="goToDate(item.id)"
            >
              <td>
                <v-chip
                  v-if="!item.is_indiv_travel"
                  :color="item.published ? 'green-light' : item.is_indiv_travel ? 'blue' : 'red'"
                  class="pb-1"
                >
                  {{ item.published ? 'Publiée' : item.is_indiv_travel ? 'Voyage Individuel' : 'Non publiée' }}
                </v-chip>
                <v-chip
                  v-else-if="item.is_indiv_travel"
                  color="blue"
                  class="pb-1"
                >
                  Voyage Individuel
                </v-chip>
              </td>
              <td>{{ dayjs(item.departure_date).format('DD/MM/YYYY') }}</td>
              <td>{{ dayjs(item.return_date).format('DD/MM/YYYY') }}</td>
              <td>
                <span>
                  {{getDateStatus(item).text}}
                  <v-badge
                    v-if="isOngoing(item)"
                    color="green"
                    class="ml-2"
                    content="En cours"
                    inline
                  />
                </span>
              </td>
              <td>{{ item.booked_seat || 0 }} / {{ item.max_travelers || '?' }}</td>
              <td>
                <div class="text-right">
                  <v-menu>
                    <template #activator="{ props }">
                      <v-btn
                        :icon="mdiDotsVertical"
                        size="x-small"
                        v-bind="props"
                      />
                    </template>
                    <v-list>
                      <v-list-item @click="goToDate(item.id)">
                        <v-icon>{{ mdiEye }}</v-icon>
                        Modifier
                      </v-list-item>
                      <v-list-item @click="duplicateDate(item)">
                        <v-icon>{{ mdiContentCopy }}</v-icon>
                        Dupliquer
                      </v-list-item>
                      <v-list-item @click="deleteDate(item)">
                        <v-icon>{{ mdiDelete }}</v-icon>
                        Supprimer
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
              </td>
            </tr>
          </template>

          <template #no-data>
            <div class="text-center py-4">
              Aucune date trouvée
            </div>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { mdiContentCopy, mdiDotsVertical, mdiDelete, mdiEye, mdiArrowRight } from '@mdi/js'

const loading = ref(false)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

definePageMeta({ layout: 'booking', middleware: 'booking-management' })

const route = useRoute()
const router = useRouter()
const slug = route.params.slug
const dates = ref([])
const voyage = ref(null)

const headers = [
  { title: 'Statut publication', key: 'published', sortable: true },
  { title: 'Date de départ', key: 'departure_date', sortable: true },
  { title: 'Date de retour', key: 'return_date', sortable: true },
  { title: 'Statut Affiché', key: 'displayed_status', sortable: true },
  { title: 'Voyageurs', key: 'travelers', sortable: false },
  { title: '', key: 'actions', sortable: false },
]

const fetchDates = async () => {
  loading.value = true
  const res = await fetch(`/api/v1/booking/${slug}/dates`)
  voyage.value = await queryCollection('voyages').where('slug', '=', slug).select('title').first()
  const data = await res.json()
  dates.value = data
  loading.value = false
}

const statuses = ref([
  { value: 'soon_confirmed', label: 'Bientôt confirmé' },
  { value: 'confirmed', label: 'Confirmé' },
  { value: 'guaranteed', label: 'Garanti (Complet)' },
])

const goToDate = (id) => {
  router.push(`/booking-management/${slug}/${id}`)
}

const goToAddDate = () => {
  router.push(`/booking-management/add-date?slug=${encodeURIComponent(slug)}`)
}

const duplicateDate = async (date) => {
  if (!confirm('Dupliquer cette date ?')) return
  const res = await fetch(`/api/v1/booking/${slug}/date/${date.id}/duplicate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  if (res.ok) {
    await fetchDates()
  }
  else {
    alert('Erreur lors de la duplication')
  }
}

const deleteDate = async (date) => {
  if (!confirm('Supprimer cette date ? Attention, toutes les réservations associées à cette date seront également supprimées.')) return
  const res = await fetch(`/api/v1/booking/${slug}/date/${date.id}`, {
    method: 'DELETE',
  })
  console.log('======res after delete date=======', res)
  if (res.ok) {
    await fetchDates()
  }
  else {
    alert('Erreur lors de la suppression')
  }
}

// Logic for row styling
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

const getRowClass = (item) => {
  if (isOngoing(item)) return 'ongoing-row'
  if (isPast(item)) return 'past-row'
  return ''
}

onMounted(fetchDates)
</script>

<style scoped>
.ongoing-row {
  background-color: rgba(var(--v-theme-green-light), 0.3) !important; /* light green */
}
.past-row {
  background-color: rgba(var(--v-theme-grey-light-3)) !important; /* light grey */
  color: #aaa !important;
}
</style>
