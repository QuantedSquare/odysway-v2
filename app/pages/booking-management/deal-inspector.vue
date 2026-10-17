<template>
  <v-container
    fluid
    class="py-6"
  >
    <v-row class="align-center mb-2">
      <v-col cols="12">
        <h1 class="text-h5 font-weight-bold mb-1">
          Deal ActiveCampaign
        </h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Collez l'URL d'un deal ActiveCampaign (ou son identifiant) pour lire tous ses champs.
        </p>
      </v-col>
    </v-row>

    <!-- Recherche -->
    <v-card
      rounded="lg"
      class="mb-4 bo-card"
      elevation="0"
    >
      <v-card-text class="pa-3">
        <v-row align="start">
          <v-col
            cols="12"
            md="8"
          >
            <v-text-field
              v-model="input"
              label="URL du deal ou identifiant"
              placeholder="https://odysway90522.activehosted.com/app/deals/16447"
              :prepend-inner-icon="mdiMagnify"
              density="compact"
              clearable
              hide-details="auto"
              :error-messages="inputError"
              @keyup.enter="loadDeal()"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
            class="d-flex ga-2"
          >
            <v-btn
              color="primary"
              variant="flat"
              :loading="loading"
              :disabled="!input"
              @click="loadDeal()"
            >
              Analyser
            </v-btn>
            <v-btn
              v-if="data"
              variant="outlined"
              :prepend-icon="mdiRefresh"
              :loading="loading"
              @click="loadDeal(data.dealId)"
            >
              Rafraîchir
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      density="compact"
      class="mb-4"
      :icon="mdiAlertCircleOutline"
    >
      {{ errorMessage }}
    </v-alert>

    <v-skeleton-loader
      v-if="loading && !data"
      type="card, table"
    />

    <template v-if="data">
      <!-- Résumé -->
      <v-card
        rounded="lg"
        class="mb-4 bo-card"
        elevation="0"
      >
        <v-card-text class="pa-4">
          <div class="d-flex align-center flex-wrap ga-2 mb-3">
            <h2 class="text-h6 font-weight-bold mb-0 mr-2">
              {{ data.deal.title || 'Deal sans titre' }}
            </h2>
            <v-chip
              size="small"
              variant="tonal"
            >
              #{{ data.dealId }}
            </v-chip>
            <v-chip
              size="small"
              :color="statusColor"
              variant="tonal"
            >
              {{ statusLabel }}
            </v-chip>
            <v-spacer />
            <v-btn
              :href="data.acUrl"
              target="_blank"
              rel="noopener"
              size="small"
              variant="text"
              :append-icon="mdiOpenInNew"
            >
              Ouvrir dans ActiveCampaign
            </v-btn>
          </div>

          <v-row dense>
            <v-col
              v-for="item in summaryItems"
              :key="item.label"
              cols="6"
              md="3"
            >
              <div class="text-caption text-medium-emphasis">
                {{ item.label }}
              </div>
              <div class="text-body-2 font-weight-medium text-truncate">
                {{ item.value ?? '—' }}
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Champs -->
      <v-card
        rounded="lg"
        class="bo-card"
        elevation="0"
      >
        <v-card-text class="pa-3">
          <v-row align="center">
            <v-col
              cols="12"
              md="5"
            >
              <v-text-field
                v-model="fieldSearch"
                label="Filtrer les champs"
                :prepend-inner-icon="mdiMagnify"
                density="compact"
                clearable
                hide-details
              />
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <v-switch
                v-model="hideEmpty"
                label="Masquer les champs vides"
                color="primary"
                density="compact"
                hide-details
              />
            </v-col>
            <v-spacer />
            <v-col
              cols="12"
              md="3"
              class="d-flex justify-end"
            >
              <v-btn
                size="small"
                variant="outlined"
                :prepend-icon="mdiContentCopy"
                @click="copyJson"
              >
                {{ copied ? 'Copié !' : 'Copier le JSON' }}
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>

        <v-tabs
          v-model="tab"
          color="primary"
          class="px-3"
        >
          <v-tab value="custom">
            Champs personnalisés ({{ filteredCustomFields.length }})
          </v-tab>
          <v-tab value="native">
            Champs natifs ({{ filteredNativeFields.length }})
          </v-tab>
          <v-tab value="json">
            JSON brut
          </v-tab>
        </v-tabs>
        <v-divider />

        <v-window v-model="tab">
          <v-window-item value="custom">
            <v-data-table
              :headers="customHeaders"
              :items="filteredCustomFields"
              :items-per-page="-1"
              density="compact"
              hide-default-footer
            >
              <template #[`item.label`]="{ item }">
                <span class="font-weight-medium">{{ item.label }}</span>
              </template>
              <template #[`item.internalKey`]="{ item }">
                <code
                  v-if="item.internalKey"
                  class="bo-code"
                >{{ item.internalKey }}</code>
                <span
                  v-else
                  class="text-disabled"
                >—</span>
              </template>
              <template #[`item.value`]="{ item }">
                <span
                  v-if="item.isEmpty"
                  class="text-disabled"
                >vide</span>
                <span
                  v-else
                  class="bo-value"
                >{{ item.value }}</span>
              </template>
              <template #no-data>
                <div class="pa-6 text-center text-medium-emphasis">
                  Aucun champ ne correspond au filtre.
                </div>
              </template>
            </v-data-table>
          </v-window-item>

          <v-window-item value="native">
            <v-data-table
              :headers="nativeHeaders"
              :items="filteredNativeFields"
              :items-per-page="-1"
              density="compact"
              hide-default-footer
            >
              <template #[`item.key`]="{ item }">
                <code class="bo-code">{{ item.key }}</code>
              </template>
              <template #[`item.value`]="{ item }">
                <span
                  v-if="item.isEmpty"
                  class="text-disabled"
                >vide</span>
                <span
                  v-else
                  class="bo-value"
                >{{ item.value }}</span>
              </template>
              <template #no-data>
                <div class="pa-6 text-center text-medium-emphasis">
                  Aucun champ ne correspond au filtre.
                </div>
              </template>
            </v-data-table>
          </v-window-item>

          <v-window-item value="json">
            <pre class="bo-json">{{ prettyJson }}</pre>
          </v-window-item>
        </v-window>
      </v-card>
    </template>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mdiMagnify, mdiOpenInNew, mdiContentCopy, mdiRefresh, mdiAlertCircleOutline } from '@mdi/js'
import { bookingApi, getApiErrorMessage } from '~/utils/bookingApi'

definePageMeta({
  layout: 'booking',
  middleware: 'booking-management',
})

useSeoMeta({
  title: 'Deal ActiveCampaign — Backoffice',
  robots: 'noindex, nofollow',
})

const route = useRoute()
const router = useRouter()

const input = ref('')
const inputError = ref('')
const errorMessage = ref('')
const loading = ref(false)
const data = ref(null)
const tab = ref('custom')
const fieldSearch = ref('')
const hideEmpty = ref(true)
const copied = ref(false)

// Accepts a full AC deal URL (https://<account>.activehosted.com/app/deals/16447,
// with or without a trailing segment) or a bare deal id.
const extractDealId = (value) => {
  const raw = (value || '').trim()
  if (!raw) return null
  if (/^\d+$/.test(raw)) return Number(raw)
  const match = raw.match(/\/deals?\/(\d+)/)
  return match ? Number(match[1]) : null
}

const loadDeal = async (forcedId = null) => {
  const dealId = forcedId ?? extractDealId(input.value)
  inputError.value = ''
  errorMessage.value = ''

  if (!dealId) {
    inputError.value = 'URL ou identifiant de deal non reconnu.'
    return
  }

  loading.value = true
  try {
    data.value = await bookingApi.inspectDeal(dealId)
    input.value = String(dealId)
    if (String(route.query.deal || '') !== String(dealId)) {
      router.replace({ query: { ...route.query, deal: String(dealId) } })
    }
  }
  catch (err) {
    data.value = null
    errorMessage.value = getApiErrorMessage(err, 'Impossible de charger ce deal.')
  }
  finally {
    loading.value = false
  }
}

// AC deal status codes.
const statusLabels = {
  0: 'Ouvert',
  1: 'Gagné',
  2: 'Perdu',
  3: 'Supprimé',
}
const statusColors = {
  0: 'info',
  1: 'success',
  2: 'error',
  3: 'grey',
}
const statusLabel = computed(() => statusLabels[Number(data.value?.deal?.status)] || 'Inconnu')
const statusColor = computed(() => statusColors[Number(data.value?.deal?.status)] || 'grey')

// AC stores deal values in cents.
const formatCents = (cents) => {
  const amount = Number(cents)
  if (!Number.isFinite(amount)) return null
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount / 100)
}

const formatDate = (value) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('fr-FR')
}

const summaryItems = computed(() => {
  if (!data.value) return []
  const { deal, resolved, contact } = data.value
  return [
    { label: 'Pipeline', value: resolved.pipelineTitle ? `${resolved.pipelineTitle} (${resolved.pipelineId})` : resolved.pipelineId },
    { label: 'Étape', value: resolved.stageTitle || resolved.stageId },
    { label: 'Commercial', value: resolved.ownerName || resolved.ownerId },
    { label: 'Valeur', value: formatCents(deal.value) },
    { label: 'Contact', value: contact ? `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email : null },
    { label: 'Email', value: contact?.email },
    { label: 'Téléphone', value: contact?.phone },
    { label: 'Créé le', value: formatDate(deal.cdate) },
  ]
})

const matchesSearch = (haystacks) => {
  const query = fieldSearch.value?.toLowerCase().trim()
  if (!query) return true
  return haystacks.some(entry => String(entry ?? '').toLowerCase().includes(query))
}

const customHeaders = [
  { title: 'Libellé', key: 'label', sortable: true },
  { title: 'Clé interne', key: 'internalKey', sortable: true },
  { title: 'ID', key: 'customFieldId', sortable: true, width: 80 },
  { title: 'Type', key: 'type', sortable: true, width: 120 },
  { title: 'Valeur', key: 'value', sortable: false },
]

const nativeHeaders = [
  { title: 'Champ', key: 'key', sortable: true },
  { title: 'Valeur', key: 'value', sortable: false },
]

const filteredCustomFields = computed(() => {
  const fields = data.value?.customFields || []
  return fields.filter((field) => {
    if (hideEmpty.value && field.isEmpty) return false
    return matchesSearch([field.label, field.internalKey, field.customFieldId, field.value])
  })
})

const nativeFields = computed(() => {
  const deal = data.value?.deal
  if (!deal) return []
  return Object.entries(deal)
    .filter(([key]) => key !== 'links')
    .map(([key, rawValue]) => {
      const value = rawValue !== null && typeof rawValue === 'object'
        ? JSON.stringify(rawValue)
        : rawValue
      return {
        key,
        value: value === null || value === undefined ? '' : String(value),
        isEmpty: value === null || value === undefined || value === '',
      }
    })
    .sort((a, b) => a.key.localeCompare(b.key))
})

const filteredNativeFields = computed(() =>
  nativeFields.value.filter((field) => {
    if (hideEmpty.value && field.isEmpty) return false
    return matchesSearch([field.key, field.value])
  }),
)

const prettyJson = computed(() => (data.value ? JSON.stringify(data.value, null, 2) : ''))

const copyJson = async () => {
  try {
    await navigator.clipboard.writeText(prettyJson.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
  catch {
    errorMessage.value = 'Copie impossible : autorisez le presse-papiers dans le navigateur.'
  }
}

onMounted(() => {
  const fromQuery = extractDealId(route.query.deal)
  if (fromQuery) {
    input.value = String(fromQuery)
    loadDeal(fromQuery)
  }
})
</script>

<style scoped>
.bo-code {
  font-size: 0.78rem;
  background: rgba(var(--v-theme-on-surface), 0.06);
  padding: 1px 6px;
  border-radius: 4px;
}

.bo-value {
  word-break: break-word;
}

.bo-json {
  margin: 0;
  padding: 16px;
  max-height: 70vh;
  overflow: auto;
  font-size: 0.78rem;
  line-height: 1.5;
  background: rgba(var(--v-theme-on-surface), 0.04);
}
</style>
