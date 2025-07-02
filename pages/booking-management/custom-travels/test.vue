<template>
  <v-container>
    <v-row>
      <v-col
        cols="12"
        class="d-flex justify-space-between align-center"
      >
        <h1>Voyages personnalisés</h1>
        <v-btn
          color="primary"
          class="mb-4"
          @click="goToAddCustomTravel"
        >
          + Créer un voyage personnalisé
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="travels"
          :loading="loading"
          class="elevation-1"
          hover
          item-key="id"
          :items-per-page="10"
          @click:row="rowClick"
        >
          <template #item.title="{ item }">
            <span>{{ item.booked_dates[0]?.deal?.title || '-' }}</span>
          </template>
          <template #item.user_email="{ item }">
            <span>{{ item.booked_dates[0]?.deal?.contact?.email || '-' }}</span>
          </template>
          <template #item.departure_date="{ item }">
            <span>{{ dayjs(item.departure_date).format('DD MMMM YYYY') }}</span>
          </template>
          <template #item.return_date="{ item }">
            <span>{{ dayjs(item.return_date).format('DD MMMM YYYY') }}</span>
          </template>
          <template #item.state="{ item }">
            <span>{{ item.booked_seat > 0 ? 'Confirmé' : 'En attente de paiement' }}</span>
          </template>
          <template #item.nb_travelers="{ item }">
            <span>{{ item.booked_dates.reduce((acc, date) => acc + +date.deal.nbTravelers, 0) || '-' }}</span>
          </template>
          <template #item.payment_status="{ item }">
            <span>{{ getPaymentStatus(item) }}</span>
          </template>
          <template #item.actions="{ item }">
            <div class="text-center ">
              <v-menu>
                <template #activator="{ props }">
                  <v-btn
                    :icon="mdiDotsVertical"
                    size="x-small"
                    v-bind="props"
                  />
                </template>
                <v-list>
                  <v-list-item @click="goToDate(item)">
                    <v-icon>{{ mdiEye }}</v-icon>
                    Modifier
                  </v-list-item>

                  <v-list-item @click="deleteDate(item)">
                    <v-icon>{{ mdiDelete }}</v-icon>
                    Supprimer
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </template>
          <template #no-data>
            <div class="text-center py-4">
              Aucun voyage personnalisé trouvé
            </div>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { mdiDotsVertical, mdiEye, mdiDelete } from '@mdi/js'

definePageMeta({ layout: 'booking', middleware: 'booking-management' })
const loading = ref(false)
const travels = ref([])
const router = useRouter()

const headers = [
  { title: 'Titre', key: 'title' },
  { title: 'Email', key: 'user_email' },
  { title: 'Date de départ', key: 'departure_date' },
  { title: 'Date de retour', key: 'return_date' },
  { title: 'Etat', key: 'state' },
  { title: 'Nb voyageurs', key: 'nb_travelers' },
  { title: 'Statut paiement', key: 'payment_status' },
  { title: 'Actions', key: 'actions' },
]
function rowClick(_, row) {
  goToDate(row.item)
}

const fetchCustomTravels = async () => {
  loading.value = true
  const res = await fetch('/api/v1/booking/custom-travel')
  const data = await res.json()
  travels.value = data
  console.log('===========travels in custom-travels.vue===========', travels.value)
  loading.value = false
}
function getPaymentStatus(item) {
  console.log('===========item in getPaymentStatus===========', item)
  if (item.booked_dates.length === 0) {
    return '-'
  }
  else {
    const total = item.booked_dates.reduce((acc, date) => acc + date.deal.value, 0)
    const alreadyPaid = item.booked_dates.reduce((acc, date) => acc + date.deal.alreadyPaid, 0)
    return formatNumber(alreadyPaid, 'currency', '€') + ' / ' + formatNumber(total, 'currency', '€')
  }
}
function goToAddCustomTravel() {
  router.push('/booking-management/add-custom-travel')
}
function goToDate(item) {
  router.push(`/booking-management/custom-travels/${item.id}`)
}

async function deleteDate(item) {
  if (!confirm('Supprimer ce voyage personnalisé ?')) return
  try {
    const res = await fetch(`/api/v1/booking/custom-travel/${item.id}`, { method: 'DELETE' })
    if (res.ok) {
      await fetchCustomTravels()
    }
  }
  catch (err) {
    console.error('Error deleting custom travel:', err)
  }
}

onMounted(fetchCustomTravels)
</script>
