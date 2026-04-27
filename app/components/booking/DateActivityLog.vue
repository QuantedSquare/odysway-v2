<template>
  <div>
    <!-- Collapsed: show latest entry only -->
    <div
      v-if="!expanded && latestEntry"
      class="d-flex align-center ga-2"
    >
      <v-avatar
        size="20"
        color="primary"
        class="text-white"
      >
        <v-img
          v-if="latestEntry.editor_picture"
          :src="latestEntry.editor_picture"
          alt="Avatar"
        />
        <span
          v-else
          style="font-size: 9px; font-weight: 600;"
        >
          {{ (latestEntry.editor_name || latestEntry.editor_email || '?').slice(0, 1).toUpperCase() }}
        </span>
      </v-avatar>
      <span class="text-caption text-medium-emphasis">
        {{ actionLabel(latestEntry.action) }} — {{ dayjs(latestEntry.created_at).format('DD/MM/YYYY HH:mm') }}
        — {{ latestEntry.editor_name || latestEntry.editor_email }}
      </span>
      <v-btn
        size="x-small"
        variant="text"
        color="primary"
        @click="expanded = true"
      >
        Voir l'historique
      </v-btn>
    </div>

    <!-- Fallback: no activity entries, use form data -->
    <p
      v-if="!loading && !entries.length && fallbackUpdatedAt"
      class="text-caption text-medium-emphasis mb-0"
    >
      Dernière mise à jour : {{ dayjs(fallbackUpdatedAt).format('DD/MM/YYYY HH:mm') }}
      <span v-if="fallbackLastEditor"> — {{ fallbackLastEditor }}</span>
    </p>

    <!-- Expanded: full history -->
    <v-card
      v-if="expanded"
      variant="outlined"
      rounded="lg"
      class="bo-card mt-2"
      elevation="0"
    >
      <v-card-title class="pb-0 d-flex align-center justify-space-between">
        <div class="d-flex align-center ga-2">
          <v-icon
            size="18"
            color="secondary"
          >
            {{ mdiHistory }}
          </v-icon>
          Historique des modifications
        </div>
        <v-btn
          icon
          size="x-small"
          variant="text"
          @click="expanded = false"
        >
          <v-icon>{{ mdiClose }}</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <div
          v-if="loading"
          class="d-flex justify-center py-4"
        >
          <v-progress-circular
            indeterminate
            size="24"
            color="primary"
          />
        </div>

        <div
          v-for="entry in entries"
          :key="entry.id"
          class="d-flex align-start ga-3 py-2"
        >
          <v-avatar
            size="28"
            color="primary"
            class="text-white mt-1"
          >
            <v-img
              v-if="entry.editor_picture"
              :src="entry.editor_picture"
              alt="Avatar"
            />
            <span
              v-else
              style="font-size: 11px; font-weight: 600;"
            >
              {{ (entry.editor_name || entry.editor_email || '?').slice(0, 1).toUpperCase() }}
            </span>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="d-flex align-center justify-space-between">
              <span class="text-body-2 font-weight-medium">
                {{ entry.editor_name || entry.editor_email }}
              </span>
              <span class="text-caption text-medium-emphasis">
                {{ dayjs(entry.created_at).format('DD/MM/YYYY HH:mm') }}
              </span>
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ actionLabel(entry.action) }}
            </div>
            <div
              v-if="entry.action === 'updated' && entry.changes"
              class="d-flex flex-wrap ga-1 mt-1"
            >
              <v-chip
                v-for="field in Object.keys(entry.changes)"
                :key="field"
                size="x-small"
                variant="tonal"
                color="primary"
              >
                {{ fieldLabel(field) }}
              </v-chip>
            </div>
            <div
              v-if="entry.action === 'deal_assigned' && entry.changes?.deal_id"
              class="text-caption mt-1"
            >
              Deal #{{ entry.changes.deal_id }}
              <span v-if="entry.changes.booked_places"> — {{ entry.changes.booked_places }} place(s)</span>
            </div>
          </div>
        </div>

        <div
          v-if="!loading && !entries.length"
          class="text-body-2 text-medium-emphasis py-2"
        >
          Aucun historique disponible.
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { mdiHistory, mdiClose } from '@mdi/js'
import dayjs from 'dayjs'
import { bookingApi } from '~/utils/bookingApi'

const props = defineProps({
  slug: { type: String, required: true },
  dateId: { type: String, required: true },
  fallbackUpdatedAt: { type: String, default: null },
  fallbackLastEditor: { type: String, default: null },
})

const entries = ref([])
const loading = ref(true)
const expanded = ref(false)

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
