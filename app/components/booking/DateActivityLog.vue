<template>
  <!--
    `inline` : résumé d'une ligne, posé dans la barre de commande.
    `panel`  : liste complète en `.bo-log`, sans chrome — la carte qui l'entoure
               est fournie par la page (colonne latérale de la fiche date).
  -->
  <span
    v-if="variant === 'inline'"
    class="bo-activity-inline"
  >
    <template v-if="latestEntry">
      {{ actionLabel(latestEntry.action) }} le
      {{ dayjs(latestEntry.created_at).format('DD/MM/YYYY à HH:mm') }}
      par {{ latestEntry.editor_name || latestEntry.editor_email }}
    </template>
    <template v-else-if="!loading && fallbackUpdatedAt">
      Dernière mise à jour le {{ dayjs(fallbackUpdatedAt).format('DD/MM/YYYY à HH:mm') }}
      <span v-if="fallbackLastEditor"> par {{ fallbackLastEditor }}</span>
    </template>
  </span>

  <div
    v-else
    class="bo-log"
  >
    <div
      v-if="loading"
      class="d-flex justify-center py-4"
    >
      <v-progress-circular
        indeterminate
        size="20"
        color="primary"
      />
    </div>

    <div
      v-for="entry in entries"
      :key="entry.id"
      class="bo-log__i"
    >
      <div class="bo-log__t">
        {{ dayjs(entry.created_at).format('DD/MM HH:mm') }}
      </div>
      <div class="bo-log__b">
        <b>{{ entry.editor_name || entry.editor_email || 'Système' }}</b>
        <span class="bo-log__d"> — {{ actionLabel(entry.action) }}</span>

        <div
          v-if="entry.action === 'updated' && entry.changes"
          class="d-flex flex-wrap ga-1 mt-1"
        >
          <span
            v-for="field in Object.keys(entry.changes)"
            :key="field"
            class="bo-tag"
          >
            {{ fieldLabel(field) }}
          </span>
        </div>
        <div
          v-if="entry.action === 'deal_assigned' && entry.changes?.deal_id"
          class="bo-log__d"
        >
          Deal #{{ entry.changes.deal_id }}
          <span v-if="entry.changes.booked_places"> — {{ entry.changes.booked_places }} place(s)</span>
        </div>
      </div>
    </div>

    <div
      v-if="!loading && !entries.length"
      class="bo-empty"
    >
      Aucun historique disponible.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { bookingApi } from '~/utils/bookingApi'

const props = defineProps({
  slug: { type: String, required: true },
  dateId: { type: String, required: true },
  fallbackUpdatedAt: { type: String, default: null },
  fallbackLastEditor: { type: String, default: null },
  variant: { type: String, default: 'inline' },
})

const entries = ref([])
const loading = ref(true)

const latestEntry = computed(() => entries.value[0] || null)

const ACTION_LABELS = {
  created: 'Création',
  updated: 'Modification',
  deal_assigned: 'Deal assigné',
  deal_removed: 'Deal supprimé',
  duplicated: 'Duplication',
  departure_assigned: 'Départ assigné',
  departure_removed: 'Départ supprimé',
}

const FIELD_LABELS = {
  published: 'Publication',
  departure_date: 'Date de départ',
  return_date: 'Date de retour',
  min_travelers: 'Min voyageurs',
  max_travelers: 'Max voyageurs',
  starting_price: 'Prix',
  include_flight: 'Vol inclus',
  flight_price: 'Prix du vol',
  badges: 'Badges',
  early_bird: 'Early bird',
  last_minute: 'Last minute',
  is_indiv_travel: 'Voyage individuel',
  displayed_status: 'Statut affiché',
  displayed_booked_seat: 'Places affichées',
  co_filling: 'Co-remplissage',
}

function actionLabel(action) {
  return ACTION_LABELS[action] || action
}

function fieldLabel(field) {
  return FIELD_LABELS[field] || field
}

async function fetchActivity() {
  try {
    entries.value = await bookingApi.getActivity(props.slug, props.dateId)
  }
  catch (err) {
    console.error('Error fetching activity log:', err)
  }
  finally {
    loading.value = false
  }
}

onMounted(fetchActivity)
</script>

<style scoped>
.bo-activity-inline {
  color: var(--bo-ink-3);
}
</style>
