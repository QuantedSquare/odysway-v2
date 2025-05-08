<template>
  <v-container>
    <v-row>
      <v-col cols="8">
        <h2>Dates pour le voyage: {{ slug }}</h2>
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
      <v-col
        v-for="date in dates"
        :key="date.id"
        cols="12"
        md="6"
      >
        <v-card
          class="mb-4"
          hover
          @click="goToDate(date.id)"
        >
          <v-card-title class="d-flex justify-space-between align-center">
            <span
              style="cursor:pointer"
            >
              {{ dayjs(date.departure_date).format('DD/MM/YYYY') }} au {{ dayjs(date.return_date).format('DD/MM/YYYY') }}
            </span>
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  :icon="mdiDotsVertical"
                  variant="text"
                  v-bind="props"
                />
              </template>
              <v-list>
                <v-list-item
                  icon
                  @click.stop="duplicateDate(date)"
                >
                  Duppliquer
                  <v-icon>
                    {{ mdiContentCopy }}
                  </v-icon>
                </v-list-item>
                <v-list-item
                  icon
                  @click.stop="deleteDate(date)"
                >
                  Supprimer
                  <v-icon>
                    {{ mdiDelete }}
                  </v-icon>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-card-title>
          <v-card-text
            style="cursor:pointer"
            @click="goToDate(date.id)"
          >
            Status: {{ date.displayed_status || 'Statut inconnu' }}<br>
            Places réservées: {{ date.booked_seat || 0 }} / {{ date.max_travelers || '?' }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mdiContentCopy, mdiDotsVertical, mdiDelete } from '@mdi/js'
import dayjs from 'dayjs'

definePageMeta({ layout: 'booking', middleware: 'booking-management' })

const route = useRoute()
const router = useRouter()
const slug = route.params.slug
const dates = ref([])

const fetchDates = async () => {
  const res = await fetch(`/api/v1/booking/${slug}/dates`)
  const data = await res.json()
  dates.value = data
}

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
  if (!confirm('Supprimer cette date ?')) return
  const res = await fetch(`/api/v1/booking/${slug}/date/${date.id}`, {
    method: 'DELETE',
  })
  if (res.ok) {
    await fetchDates()
  }
  else {
    alert('Erreur lors de la suppression')
  }
}
onMounted(fetchDates)
</script>
