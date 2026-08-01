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
        <h1 class="text-h5 font-weight-bold mb-1">
          Corbeille
        </h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Rien n'est supprime definitivement. Retrouvez ici les dates, reservations et deals
          masques, avec la raison et l'auteur de la suppression, et remettez-les en service.
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
          @click="fetchTrash"
        >
          Rafraichir
        </v-btn>
      </v-col>
    </v-row>

    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      class="mb-4"
      closable
      @click:close="errorMessage = ''"
    >
      {{ errorMessage }}
    </v-alert>

    <v-alert
      v-if="noticeMessage"
      type="info"
      variant="tonal"
      class="mb-4"
      closable
      @click:close="noticeMessage = ''"
    >
      <span style="white-space: pre-line;">{{ noticeMessage }}</span>
    </v-alert>

    <v-tabs
      v-model="tab"
      color="primary"
      class="mb-4"
    >
      <v-tab value="travel_dates">
        Dates
        <v-chip
          size="x-small"
          class="ml-2"
          variant="tonal"
        >
          {{ counts.travel_dates }}
        </v-chip>
      </v-tab>
      <v-tab value="booked_dates">
        Reservations
        <v-chip
          size="x-small"
          class="ml-2"
          variant="tonal"
        >
          {{ counts.booked_dates }}
        </v-chip>
      </v-tab>
      <v-tab value="deals">
        Deals
        <v-chip
          size="x-small"
          class="ml-2"
          variant="tonal"
        >
          {{ counts.deals }}
        </v-chip>
      </v-tab>
    </v-tabs>

    <v-card
      rounded="lg"
      class="bo-card"
      elevation="0"
    >
      <div
        v-if="loading"
        class="d-flex justify-center py-10"
      >
        <v-progress-circular
          indeterminate
          color="primary"
          size="40"
        />
      </div>

      <v-window
        v-else
        v-model="tab"
      >
        <!-- ================= DATES ================= -->
        <v-window-item value="travel_dates">
          <div
            v-if="!trash.travel_dates.length"
            class="text-center py-10 text-medium-emphasis"
          >
            Aucune date supprimee.
          </div>
          <v-table
            v-else
            density="compact"
          >
            <thead>
              <tr>
                <th>Voyage</th>
                <th>Depart</th>
                <th>Places</th>
                <th>Supprimee</th>
                <th>Raison</th>
                <th class="text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in trash.travel_dates"
                :key="item.id"
              >
                <td class="text-body-2">
                  {{ item.travel_slug }}
                </td>
                <td class="text-body-2">
                  {{ formatDate(item.departure_date) }}
                </td>
                <td class="text-body-2">
                  {{ item.booked_seat }} / {{ item.max_travelers || '-' }}
                </td>
                <td class="text-caption">
                  {{ formatWhen(item) }}
                </td>
                <td>
                  <v-chip
                    size="x-small"
                    variant="tonal"
                    :color="reasonColor(item.deleted_reason)"
                  >
                    {{ reasonLabel(item.deleted_reason) }}
                  </v-chip>
                </td>
                <td class="text-right">
                  <v-btn
                    size="x-small"
                    variant="tonal"
                    color="primary"
                    :prepend-icon="mdiRestore"
                    :loading="restoringId === item.id"
                    @click="onRestoreDate(item)"
                  >
                    Restaurer
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-window-item>

        <!-- ================= RESERVATIONS ================= -->
        <v-window-item value="booked_dates">
          <div
            v-if="!trash.booked_dates.length"
            class="text-center py-10 text-medium-emphasis"
          >
            Aucune reservation supprimee.
          </div>
          <v-table
            v-else
            density="compact"
          >
            <thead>
              <tr>
                <th>Deal</th>
                <th>Voyage / depart</th>
                <th>Places</th>
                <th>Supprimee</th>
                <th>Raison</th>
                <th class="text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in trash.booked_dates"
                :key="item.id"
              >
                <td class="text-body-2">
                  <div class="font-weight-medium">
                    {{ item.deal_title || `Deal ${item.deal_id}` }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    #{{ item.deal_id }}
                    <span v-if="item.deal_status"> — {{ item.deal_status }}</span>
                  </div>
                </td>
                <td class="text-body-2">
                  {{ item.travel_slug || '—' }}
                  <div class="text-caption text-medium-emphasis">
                    {{ formatDate(item.departure_date) }}
                  </div>
                </td>
                <td class="text-body-2">
                  {{ item.booked_places }}
                </td>
                <td class="text-caption">
                  {{ formatWhen(item) }}
                </td>
                <td>
                  <v-chip
                    size="x-small"
                    variant="tonal"
                    :color="reasonColor(item.deleted_reason)"
                  >
                    {{ reasonLabel(item.deleted_reason) }}
                  </v-chip>
                </td>
                <td class="text-right">
                  <!-- La date parente doit revenir en premier : restaurer une
                       reservation sous une date supprimee la laisserait invisible. -->
                  <v-tooltip
                    v-if="item.parent_deleted"
                    location="top"
                  >
                    <template #activator="{ props: tipProps }">
                      <span v-bind="tipProps">
                        <v-btn
                          size="x-small"
                          variant="tonal"
                          disabled
                        >
                          Date supprimee
                        </v-btn>
                      </span>
                    </template>
                    Restaurez d'abord la date de depart, dans l'onglet Dates.
                  </v-tooltip>
                  <v-btn
                    v-else
                    size="x-small"
                    variant="tonal"
                    color="primary"
                    :prepend-icon="mdiRestore"
                    :loading="restoringId === item.id"
                    @click="onRestoreBooked(item)"
                  >
                    Restaurer
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-window-item>

        <!-- ================= DEALS ================= -->
        <v-window-item value="deals">
          <div
            v-if="!trash.deals.length"
            class="text-center py-10 text-medium-emphasis"
          >
            Aucun deal supprime.
          </div>
          <v-table
            v-else
            density="compact"
          >
            <thead>
              <tr>
                <th>Deal</th>
                <th>Pipeline</th>
                <th>Vendeur</th>
                <th>Valeur</th>
                <th>Supprime</th>
                <th>Raison</th>
                <th class="text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in trash.deals"
                :key="item.id"
              >
                <td class="text-body-2">
                  <div class="font-weight-medium">
                    {{ item.title || `Deal ${item.id}` }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    #{{ item.id }}
                    <span v-if="item.slug"> — {{ item.slug }}</span>
                  </div>
                </td>
                <td class="text-body-2">
                  {{ item.pipeline_title || '—' }}
                </td>
                <td class="text-body-2">
                  {{ item.seller || '—' }}
                </td>
                <td class="text-body-2">
                  {{ item.total_value != null ? formatEur(item.total_value) : '—' }}
                </td>
                <td class="text-caption">
                  {{ formatWhen(item) }}
                </td>
                <td>
                  <v-chip
                    size="x-small"
                    variant="tonal"
                    :color="reasonColor(item.deleted_reason)"
                  >
                    {{ reasonLabel(item.deleted_reason) }}
                  </v-chip>
                </td>
                <td class="text-right">
                  <v-btn
                    size="x-small"
                    variant="tonal"
                    color="primary"
                    :prepend-icon="mdiRestore"
                    :loading="restoringId === item.id"
                    @click="onRestoreDeal(item)"
                  >
                    Restaurer
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-window-item>
      </v-window>
    </v-card>

    <p class="text-caption text-medium-emphasis mt-3">
      Les notes, pieces jointes et factures supprimees se restaurent depuis la fiche de leur
      date, via le filtre « Supprimees » de chaque bloc.
    </p>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { mdiRestore } from '@mdi/js'
import { bookingApi, getApiErrorMessage } from '~/utils/bookingApi'
import { formatEur } from '~/utils/formatNumber'

definePageMeta({
  layout: 'booking',
  middleware: 'booking-management',
})

const tab = ref('travel_dates')
const loading = ref(true)
const restoringId = ref(null)
const errorMessage = ref('')
const noticeMessage = ref('')
const trash = ref({ travel_dates: [], booked_dates: [], deals: [] })

const counts = computed(() => ({
  travel_dates: trash.value.travel_dates.length,
  booked_dates: trash.value.booked_dates.length,
  deals: trash.value.deals.length,
}))

// Les libelles suivent l'enum deleted_reason de la migration soft delete.
const REASONS = {
  manual: { label: 'Manuelle', color: 'grey' },
  cascade_travel_date: { label: 'Cascade de la date', color: 'blue-grey' },
  ac_deal_deleted: { label: 'Deal supprime (AC)', color: 'error' },
  ac_deal_trashed: { label: 'Deal en corbeille (AC)', color: 'error' },
  ac_deal_lost: { label: 'Deal perdu (AC)', color: 'warning' },
  ac_contact_deleted: { label: 'Contact supprime (AC)', color: 'error' },
  purge: { label: 'Purge', color: 'error' },
}

const reasonLabel = r => REASONS[r]?.label || r || 'Inconnue'
const reasonColor = r => REASONS[r]?.color || 'grey'

const formatDate = d => (d ? dayjs(d).format('DD/MM/YYYY') : '—')
const formatWhen = (item) => {
  const when = item.deleted_at ? dayjs(item.deleted_at).format('DD/MM/YYYY HH:mm') : '?'
  return `${when} — ${item.deleted_by || '?'}`
}

const fetchTrash = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const data = await bookingApi.getTrash()
    trash.value = {
      travel_dates: data.travel_dates || [],
      booked_dates: data.booked_dates || [],
      deals: data.deals || [],
    }
    if (data.truncated && Object.values(data.truncated).some(Boolean)) {
      noticeMessage.value = 'Liste tronquee a 200 elements par categorie — restaurez les plus recents d\'abord.'
    }
  }
  catch (err) {
    errorMessage.value = getApiErrorMessage(err, 'Erreur lors du chargement de la corbeille')
  }
  finally {
    loading.value = false
  }
}

const onRestoreDate = async (item) => {
  if (!confirm(`Restaurer la date du ${formatDate(item.departure_date)} (${item.travel_slug}) et les elements supprimes avec elle ?`)) return
  restoringId.value = item.id
  errorMessage.value = ''
  try {
    const res = await bookingApi.restoreDate(item.travel_slug, item.id)
    const lines = []
    const r = res?.restored || {}
    lines.push(`Date restauree — ${r.booked_dates || 0} reservation(s), ${r.date_notes || 0} note(s), ${r.date_invoices || 0} facture(s), ${r.date_attachments || 0} piece(s) jointe(s).`)
    for (const c of res?.conflicts || []) {
      if (c.type === 'booking_reassigned') {
        lines.push(`Le deal ${c.deal_id} a ete re-assigne a une autre date depuis : il n'a pas ete restaure ici.`)
      }
      if (c.type === 'duplicate_active_date') {
        lines.push('Une date active existe deja pour ce voyage au meme depart — verifiez les doublons.')
      }
    }
    if (res?.departureDealNeedsRecreation) {
      lines.push('Le dossier de depart avait ete supprime dans ActiveCampaign et n\'est pas recuperable : recreez-le depuis la fiche de la date.')
    }
    noticeMessage.value = lines.join('\n')
    await fetchTrash()
  }
  catch (err) {
    errorMessage.value = getApiErrorMessage(err, 'Erreur lors de la restauration de la date')
  }
  finally {
    restoringId.value = null
  }
}

const onRestoreBooked = async (item) => {
  if (!confirm(`Restaurer la reservation du deal ${item.deal_id} ?`)) return
  restoringId.value = item.id
  errorMessage.value = ''
  try {
    const res = await bookingApi.restoreBooked(item.travel_slug, item.travel_date_id, item.id)
    const rec = res?.recomputed
    noticeMessage.value = rec
      ? `Reservation restauree — la date affiche desormais ${rec.booked_seat} place(s) reservee(s).`
      : 'Reservation restauree.'
    await fetchTrash()
  }
  catch (err) {
    errorMessage.value = getApiErrorMessage(err, 'Erreur lors de la restauration de la reservation')
  }
  finally {
    restoringId.value = null
  }
}

const onRestoreDeal = async (item) => {
  if (!confirm(`Restaurer le deal ${item.title || item.id} dans les rapports ?`)) return
  restoringId.value = item.id
  errorMessage.value = ''
  try {
    const res = await bookingApi.restoreDeal(item.id)
    noticeMessage.value = res?.bookedStillDeleted
      ? 'Deal restaure dans les rapports. Sa reservation reste supprimee — restaurez-la depuis l\'onglet Reservations si le voyageur doit reprendre sa place.'
      : 'Deal restaure dans les rapports.'
    await fetchTrash()
  }
  catch (err) {
    errorMessage.value = getApiErrorMessage(err, 'Erreur lors de la restauration du deal')
  }
  finally {
    restoringId.value = null
  }
}

onMounted(fetchTrash)
</script>
