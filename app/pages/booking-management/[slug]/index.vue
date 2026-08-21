<template>
  <div>
    <BoPageHeader
      :title="voyage?.title || slug"
      :crumbs="[
        { title: 'Backoffice', to: '/booking-management' },
        { title: 'Voyages', to: '/booking-management' },
        { title: voyage?.title || slug },
      ]"
    >
      <template #meta>
        <span class="bo-num">{{ slug }}</span>
        <span>·</span>
        <span>{{ counts.upcoming }} date{{ counts.upcoming > 1 ? 's' : '' }} à venir</span>
        <span
          v-if="counts.draft"
          class="bo-tag bo-tag--warn"
        >
          {{ counts.draft }} non publiée{{ counts.draft > 1 ? 's' : '' }}
        </span>
      </template>

      <template #actions>
        <v-btn
          :href="`/voyages/${slug}`"
          target="_blank"
          variant="text"
        >
          Voir sur le site ↗
        </v-btn>
        <v-btn
          :loading="loading"
          @click="fetchDates"
        >
          Rafraîchir
        </v-btn>
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
      <div class="bo-row">
        <v-btn-toggle
          v-model="timeframe"
          mandatory
          class="bo-seg"
          density="compact"
        >
          <v-btn value="upcoming">
            À venir <span class="bo-seg__n">{{ counts.upcoming }}</span>
          </v-btn>
          <v-btn value="ongoing">
            <span
              v-if="counts.ongoing"
              class="bo-dot bo-dot--live mr-2"
              style="color: var(--bo-accent);"
            />
            En cours <span class="bo-seg__n">{{ counts.ongoing }}</span>
          </v-btn>
          <v-btn value="past">
            Passées <span class="bo-seg__n">{{ counts.past }}</span>
          </v-btn>
          <v-btn value="all">
            Toutes
          </v-btn>
        </v-btn-toggle>

        <v-select
          v-model="publicationFilter"
          :items="publicationOptions"
          item-title="label"
          item-value="value"
          aria-label="Filtrer par publication"
          style="max-width: 200px;"
        />

        <v-spacer />

        <v-switch
          v-model="showDeleted"
          label="Afficher les dates supprimées"
          class="flex-grow-0"
          @update:model-value="fetchDates"
        />
      </div>

      <section class="bo-card">
        <v-data-table
          :headers="headers"
          :items="filteredDates"
          :loading="loading"
          :items-per-page="25"
          item-key="id"
          class="bo-table"
        >
          <template #item="{ item }">
            <tr
              class="bo-tr"
              :class="rowState(item)"
              @click="goToDate(item.id)"
            >
              <td class="bo-num font-weight-bold">
                {{ dayjs(item.departure_date).format('DD/MM/YYYY') }}
              </td>
              <td class="bo-num bo-muted">
                {{ dayjs(item.return_date).format('DD/MM/YYYY') }}
              </td>
              <td>
                <span
                  v-if="isOngoing(item)"
                  class="bo-tag bo-tag--accent"
                >
                  <span class="bo-dot bo-dot--live" />
                  En cours
                </span>
                <span v-else>{{ statusLabel(item) }}</span>
              </td>
              <td>
                <BoFillBar
                  :booked="item.booked_seat || 0"
                  :total="item.max_travelers || 0"
                />
              </td>
              <td class="text-right bo-num">
                {{ formatEur(item.starting_price) }}
              </td>
              <td>
                <v-tooltip
                  v-if="item.deleted"
                  location="top"
                  :text="deletedTooltip(item)"
                >
                  <template #activator="{ props: tipProps }">
                    <span
                      v-bind="tipProps"
                      class="bo-tag bo-tag--crit"
                    >Supprimée</span>
                  </template>
                </v-tooltip>
                <span
                  v-else-if="item.is_indiv_travel"
                  class="bo-tag bo-tag--info"
                >Individuel</span>
                <span
                  v-else-if="item.published"
                  class="bo-tag bo-tag--ok"
                >
                  <span class="bo-dot" />Publiée
                </span>
                <span
                  v-else
                  class="bo-tag bo-tag--warn"
                >
                  <span class="bo-dot" />Brouillon
                </span>
              </td>
              <td class="text-right">
                <v-menu>
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      :icon="mdiDotsVertical"
                      variant="text"
                      density="comfortable"
                      aria-label="Actions sur cette date"
                      @click.stop
                    />
                  </template>
                  <v-list>
                    <v-list-item
                      :prepend-icon="mdiEye"
                      title="Modifier"
                      @click="goToDate(item.id)"
                    />
                    <v-list-item
                      :prepend-icon="mdiContentCopy"
                      title="Dupliquer"
                      @click="duplicateDate(item)"
                    />
                    <v-list-item
                      v-if="item.deleted"
                      :prepend-icon="mdiRestore"
                      title="Restaurer"
                      @click="restoreDate(item)"
                    />
                    <v-list-item
                      v-else
                      :prepend-icon="mdiDelete"
                      title="Supprimer"
                      class="text-error"
                      @click="deleteDate(item)"
                    />
                  </v-list>
                </v-menu>
              </td>
            </tr>
          </template>

          <template #no-data>
            <div class="bo-empty">
              Aucune date sur cette période.
            </div>
          </template>
        </v-data-table>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { mdiContentCopy, mdiDotsVertical, mdiDelete, mdiEye, mdiPlus, mdiRestore } from '@mdi/js'
import BoPageHeader from '~/components/booking/BoPageHeader.vue'
import BoFillBar from '~/components/booking/BoFillBar.vue'
import { bookingApi, getApiErrorMessage } from '~/utils/bookingApi'
// `travel_dates.starting_price` est déjà en euros (contrairement aux montants
// des deals AC, qui sont en centimes et passent par `formatNumber`).
import { formatEur } from '~/utils/formatNumber'

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

definePageMeta({ layout: 'booking', middleware: 'booking-management' })

const route = useRoute()
const router = useRouter()
const { confirmAction, toast } = useBoDialogs()

const slug = route.params.slug
const loading = ref(false)
const dates = ref([])
const voyage = ref(null)
const timeframe = ref('upcoming')
const publicationFilter = ref('all')
const showDeleted = ref(false)

const headers = [
  { title: 'Départ', key: 'departure_date', sortable: false },
  { title: 'Retour', key: 'return_date', sortable: false },
  { title: 'Statut', key: 'displayed_status', sortable: false },
  { title: 'Remplissage', key: 'travelers', sortable: false },
  { title: 'Prix', key: 'starting_price', sortable: false, align: 'end' },
  { title: 'Publication', key: 'published', sortable: false },
  { title: '', key: 'actions', sortable: false },
]

const publicationOptions = [
  { label: 'Publication : toutes', value: 'all' },
  { label: 'Publiées', value: 'published' },
  { label: 'Brouillons', value: 'draft' },
  { label: 'Individuelles', value: 'indiv' },
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
    dates.value = await bookingApi.getDatesBySlug(slug, showDeleted.value ? { includeDeleted: true } : {})
  }
  catch (err) {
    console.error(getApiErrorMessage(err, 'Erreur chargement dates'))
    toast(getApiErrorMessage(err, 'Erreur lors du chargement des dates'), 'crit')
    dates.value = []
  }
  finally {
    loading.value = false
  }
}

const isOngoing = (item) => {
  const today = dayjs().startOf('day')
  return today.isSameOrAfter(dayjs(item.departure_date)) && today.isSameOrBefore(dayjs(item.return_date))
}

const isPast = item => dayjs(item.return_date).isBefore(dayjs().startOf('day'))

const counts = computed(() => ({
  upcoming: dates.value.filter(d => dayjs(d.departure_date).isAfter(dayjs().startOf('day'))).length,
  ongoing: dates.value.filter(isOngoing).length,
  past: dates.value.filter(isPast).length,
  draft: dates.value.filter(d => !d.published && !d.deleted).length,
}))

const filteredDates = computed(() => {
  const today = dayjs().startOf('day')
  const base = dates.value.filter((item) => {
    if (publicationFilter.value === 'published' && !item.published) return false
    if (publicationFilter.value === 'draft' && item.published) return false
    if (publicationFilter.value === 'indiv' && !item.is_indiv_travel) return false

    if (timeframe.value === 'upcoming') return dayjs(item.departure_date).isAfter(today)
    if (timeframe.value === 'ongoing') return isOngoing(item)
    if (timeframe.value === 'past') return isPast(item)
    return true
  })

  return [...base].sort((a, b) => dayjs(a.departure_date).valueOf() - dayjs(b.departure_date).valueOf())
})

// La bande de gauche ne signale que ce qui demande une action : une date
// supprimée, un départ en cours, ou un départ proche sous son minimum.
const rowState = (item) => {
  if (item.deleted) return 'bo-tr--crit bo-tr--deleted'
  if (isOngoing(item)) return 'bo-tr--live'
  const daysToGo = dayjs(item.departure_date).diff(dayjs(), 'day')
  if (daysToGo >= 0 && daysToGo < 60 && (item.booked_seat || 0) < (item.min_travelers || 0)) {
    return 'bo-tr--warn'
  }
  return ''
}

const statusLabel = (item) => {
  const labelMap = {
    soon_confirmed: 'Inscriptions ouvertes',
    confirmed: 'Confirmé',
    guaranteed: 'Garanti (complet)',
  }
  return labelMap[item.displayed_status || item.status] || '—'
}

const goToDate = (id) => {
  router.push(`/booking-management/${slug}/${id}`)
}

const goToAddDate = () => {
  router.push(`/booking-management/add-date?slug=${encodeURIComponent(slug)}`)
}

const duplicateDate = async (date) => {
  const ok = await confirmAction({
    title: 'Dupliquer cette date ?',
    message: `Une nouvelle date sera créée à partir du départ du ${dayjs(date.departure_date).format('DD/MM/YYYY')}.`,
    detail: 'Les réservations ne sont pas copiées.',
    confirmLabel: 'Dupliquer',
  })
  if (!ok) return

  try {
    await bookingApi.duplicateDate(slug, date.id)
    toast('Date dupliquée.', 'ok')
    await fetchDates()
  }
  catch (err) {
    toast(getApiErrorMessage(err, 'Erreur lors de la duplication'), 'crit')
  }
}

const deleteDate = async (date) => {
  const ok = await confirmAction({
    title: 'Supprimer cette date ?',
    message: `Départ du ${dayjs(date.departure_date).format('DD/MM/YYYY')}. Les réservations, notes et factures associées seront masquées elles aussi.`,
    detail: 'Tout reste restaurable depuis « Afficher les dates supprimées ».',
    confirmLabel: 'Supprimer',
    tone: 'danger',
  })
  if (!ok) return

  try {
    const res = await bookingApi.deleteDate(slug, date.id)
    const c = res?.softDeleted || {}
    const parts = [
      c.booked_dates ? `${c.booked_dates} réservation(s)` : null,
      c.date_notes ? `${c.date_notes} note(s)` : null,
      c.date_invoices ? `${c.date_invoices} facture(s)` : null,
      c.date_attachments ? `${c.date_attachments} pièce(s) jointe(s)` : null,
    ].filter(Boolean)

    toast(
      parts.length
        ? `Date masquée — ${parts.join(', ')}. Restaurable via « Afficher les dates supprimées ».`
        : 'Date masquée. Restaurable via « Afficher les dates supprimées ».',
      'ok',
    )
    await fetchDates()
  }
  catch (err) {
    toast(getApiErrorMessage(err, 'Erreur lors de la suppression'), 'crit')
  }
}

const restoreDate = async (date) => {
  const ok = await confirmAction({
    title: 'Restaurer cette date ?',
    message: `Départ du ${dayjs(date.departure_date).format('DD/MM/YYYY')}. Les éléments supprimés en même temps qu'elle seront restaurés aussi.`,
    confirmLabel: 'Restaurer',
  })
  if (!ok) return

  try {
    const res = await bookingApi.restoreDate(slug, date.id)
    const messages = []
    for (const c of res?.conflicts || []) {
      if (c.type === 'booking_reassigned') {
        messages.push(`Le deal ${c.deal_id} a été ré-assigné à une autre date depuis : il n'a pas été restauré ici.`)
      }
      if (c.type === 'duplicate_active_date') {
        messages.push('Une date active existe déjà pour ce voyage au même départ — vérifiez les doublons.')
      }
    }
    if (res?.departureDealNeedsRecreation) {
      messages.push('Le dossier de départ avait été supprimé dans ActiveCampaign et n\'est pas récupérable : recréez-le depuis la fiche de la date.')
    }

    toast(messages.length ? messages.join('\n\n') : 'Date restaurée.', messages.length ? 'warn' : 'ok', messages.length ? 12000 : 5000)
    await fetchDates()
  }
  catch (err) {
    toast(getApiErrorMessage(err, 'Erreur lors de la restauration'), 'crit')
  }
}

const deletedTooltip = (item) => {
  const when = item.deleted_at ? dayjs(item.deleted_at).format('DD/MM/YYYY HH:mm') : 'date inconnue'
  const who = item.deleted_by || 'auteur inconnu'
  return `Supprimée le ${when} par ${who} (${item.deleted_reason || 'raison inconnue'})`
}

onMounted(fetchDates)
</script>
