<template>
  <div>
    <BoPageHeader
      title="Corbeille"
      subtitle="Rien n'est supprimé définitivement. Retrouvez ici les dates, réservations et deals masqués, avec la raison et l'auteur, et remettez-les en service."
      :crumbs="[{ title: 'Backoffice', to: '/booking-management' }, { title: 'Corbeille' }]"
    >
      <template #actions>
        <v-btn
          :loading="loading"
          @click="fetchTrash"
        >
          Rafraîchir
        </v-btn>
      </template>
    </BoPageHeader>

    <div class="bo-well">
      <div
        v-if="errorMessage"
        class="bo-notice bo-notice--crit"
      >
        <div class="bo-notice__body">
          {{ errorMessage }}
        </div>
        <div class="bo-notice__actions">
          <v-btn
            variant="text"
            @click="errorMessage = ''"
          >
            Fermer
          </v-btn>
        </div>
      </div>

      <div
        v-if="noticeMessage"
        class="bo-notice bo-notice--info"
      >
        <div class="bo-notice__body">
          <span style="white-space: pre-line;">{{ noticeMessage }}</span>
        </div>
        <div class="bo-notice__actions">
          <v-btn
            variant="text"
            @click="noticeMessage = ''"
          >
            Fermer
          </v-btn>
        </div>
      </div>

      <v-tabs
        v-model="tab"
        class="align-self-start"
      >
        <v-tab value="travel_dates">
          Dates <span class="bo-seg__n">{{ counts.travel_dates }}</span>
        </v-tab>
        <v-tab value="booked_dates">
          Réservations <span class="bo-seg__n">{{ counts.booked_dates }}</span>
        </v-tab>
        <v-tab value="deals">
          Deals <span class="bo-seg__n">{{ counts.deals }}</span>
        </v-tab>
      </v-tabs>

      <section class="bo-card">
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
              class="bo-empty"
            >
              Aucune date supprimée.
            </div>
            <v-table
              v-else
              class="bo-table"
            >
              <thead>
                <tr>
                  <th>Voyage</th>
                  <th>Départ</th>
                  <th>Places</th>
                  <th>Supprimée</th>
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
                  <td>
                    {{ item.travel_slug }}
                  </td>
                  <td>
                    {{ formatDate(item.departure_date) }}
                  </td>
                  <td>
                    {{ item.booked_seat }} / {{ item.max_travelers || '-' }}
                  </td>
                  <td class="bo-hint">
                    {{ formatWhen(item) }}
                  </td>
                  <td>
                    <span
                      class="bo-tag"
                      :class="reasonTone(item.deleted_reason)"
                    >
                      {{ reasonLabel(item.deleted_reason) }}
                    </span>
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
              class="bo-empty"
            >
              Aucune réservation supprimée.
            </div>
            <v-table
              v-else
              class="bo-table"
            >
              <thead>
                <tr>
                  <th>Deal</th>
                  <th>Voyage / départ</th>
                  <th>Places</th>
                  <th>Supprimée</th>
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
                  <td>
                    <div class="font-weight-medium">
                      {{ item.deal_title || `Deal ${item.deal_id}` }}
                    </div>
                    <div class="bo-cell__slug">
                      #{{ item.deal_id }}
                      <span v-if="item.deal_status"> — {{ item.deal_status }}</span>
                    </div>
                  </td>
                  <td>
                    {{ item.travel_slug || '—' }}
                    <div class="bo-cell__slug">
                      {{ formatDate(item.departure_date) }}
                    </div>
                  </td>
                  <td>
                    {{ item.booked_places }}
                  </td>
                  <td class="bo-hint">
                    {{ formatWhen(item) }}
                  </td>
                  <td>
                    <span
                      class="bo-tag"
                      :class="reasonTone(item.deleted_reason)"
                    >
                      {{ reasonLabel(item.deleted_reason) }}
                    </span>
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
                            Date supprimée
                          </v-btn>
                        </span>
                      </template>
                      Restaurez d'abord la date de départ, dans l'onglet Dates.
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
              class="bo-empty"
            >
              Aucun deal supprimé.
            </div>
            <v-table
              v-else
              class="bo-table"
            >
              <thead>
                <tr>
                  <th>Deal</th>
                  <th>Pipeline</th>
                  <th>Vendeur</th>
                  <th>Valeur</th>
                  <th>Supprimé</th>
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
                  <td>
                    <div class="font-weight-medium">
                      {{ item.title || `Deal ${item.id}` }}
                    </div>
                    <div class="bo-cell__slug">
                      #{{ item.id }}
                      <span v-if="item.slug"> — {{ item.slug }}</span>
                    </div>
                  </td>
                  <td>
                    {{ item.pipeline_title || '—' }}
                  </td>
                  <td>
                    {{ item.seller || '—' }}
                  </td>
                  <td>
                    {{ item.total_value != null ? formatEur(item.total_value) : '—' }}
                  </td>
                  <td class="bo-hint">
                    {{ formatWhen(item) }}
                  </td>
                  <td>
                    <span
                      class="bo-tag"
                      :class="reasonTone(item.deleted_reason)"
                    >
                      {{ reasonLabel(item.deleted_reason) }}
                    </span>
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
      </section>

      <p class="bo-hint">
        Les notes, pièces jointes et factures supprimées se restaurent depuis la fiche de leur
        date, via le filtre « Supprimées » de chaque bloc.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { mdiRestore } from '@mdi/js'
import BoPageHeader from '~/components/booking/BoPageHeader.vue'
import { bookingApi, getApiErrorMessage } from '~/utils/bookingApi'
import { formatEur } from '~/utils/formatNumber'

definePageMeta({
  layout: 'booking',
  middleware: 'booking-management',
})

const { confirmAction } = useBoDialogs()

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
// `tone` = état réel de la suppression : subie côté AC (crit), conséquence
// d'une autre action (info), ou décidée par un humain (neutre).
const REASONS = {
  manual: { label: 'Manuelle', tone: '' },
  cascade_travel_date: { label: 'Cascade de la date', tone: 'bo-tag--info' },
  ac_deal_deleted: { label: 'Deal supprimé (AC)', tone: 'bo-tag--crit' },
  ac_deal_trashed: { label: 'Deal en corbeille (AC)', tone: 'bo-tag--crit' },
  ac_deal_lost: { label: 'Deal perdu (AC)', tone: 'bo-tag--warn' },
  ac_contact_deleted: { label: 'Contact supprimé (AC)', tone: 'bo-tag--crit' },
  purge: { label: 'Purge', tone: 'bo-tag--crit' },
}

const reasonLabel = r => REASONS[r]?.label || r || 'Inconnue'
const reasonTone = r => REASONS[r]?.tone || ''

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
  const ok = await confirmAction({
    title: 'Restaurer cette date ?',
    message: `Départ du ${formatDate(item.departure_date)} — ${item.travel_slug}.`,
    detail: 'Les éléments supprimés en même temps qu\'elle seront restaurés aussi.',
    confirmLabel: 'Restaurer',
  })
  if (!ok) return

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
  const ok = await confirmAction({
    title: 'Restaurer cette réservation ?',
    message: `Deal #${item.deal_id}.`,
    confirmLabel: 'Restaurer',
  })
  if (!ok) return

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
  const ok = await confirmAction({
    title: 'Restaurer ce deal dans les rapports ?',
    message: `${item.title || `Deal ${item.id}`}.`,
    confirmLabel: 'Restaurer',
  })
  if (!ok) return

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
