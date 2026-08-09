<template>
  <div>
    <BoPageHeader
      title="Deal ActiveCampaign"
      subtitle="Collez l'URL d'un deal ActiveCampaign (ou son identifiant) pour lire tous ses champs."
      :crumbs="[{ title: 'Backoffice', to: '/booking-management' }, { title: 'Deal AC' }]"
    />

    <div class="bo-well">
      <!-- Recherche -->
      <section class="bo-card">
        <div class="bo-card__body">
          <div class="bo-row">
            <v-text-field
              v-model="input"
              label="URL du deal ou identifiant"
              placeholder="https://odysway90522.activehosted.com/app/deals/16447"
              :prepend-inner-icon="mdiMagnify"
              clearable
              :error-messages="inputError"
              class="flex-grow-1"
              style="min-width: 260px;"
              @keyup.enter="loadDeal()"
            />
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
              :prepend-icon="mdiRefresh"
              :loading="loading"
              @click="loadDeal(data.dealId)"
            >
              Rafraîchir
            </v-btn>
          </div>
        </div>
      </section>

      <div
        v-if="errorMessage"
        class="bo-notice bo-notice--crit"
      >
        <v-icon :icon="mdiAlertCircleOutline" />
        <div class="bo-notice__body">
          {{ errorMessage }}
        </div>
      </div>

      <v-skeleton-loader
        v-if="loading && !data"
        type="card, table"
      />

      <template v-if="data">
        <!-- Résumé -->
        <section class="bo-card">
          <div class="bo-card__head">
            <h2 class="bo-card__title">
              {{ data.deal.title || 'Deal sans titre' }}
            </h2>
            <span class="bo-tag bo-num">#{{ data.dealId }}</span>
            <span
              class="bo-tag"
              :class="statusTone"
            >{{ statusLabel }}</span>
            <v-spacer />
            <v-btn
              :href="data.acUrl"
              target="_blank"
              rel="noopener"
              variant="text"
              :append-icon="mdiOpenInNew"
            >
              Ouvrir dans ActiveCampaign
            </v-btn>
          </div>
          <div class="bo-card__body">
            <div class="bo-summary">
              <div
                v-for="item in summaryItems"
                :key="item.label"
              >
                <div class="bo-stat__k">
                  {{ item.label }}
                </div>
                <div class="bo-summary__v">
                  {{ item.value ?? '—' }}
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Champs -->
        <section class="bo-card">
          <div class="bo-card__head">
            <v-text-field
              v-model="fieldSearch"
              :prepend-inner-icon="mdiMagnify"
              placeholder="Filtrer les champs…"
              aria-label="Filtrer les champs"
              clearable
              style="max-width: 280px;"
            />
            <v-switch
              v-model="hideEmpty"
              label="Masquer les champs vides"
              hide-details
            />
            <v-spacer />
            <v-btn
              :prepend-icon="mdiContentCopy"
              @click="copyJson"
            >
              {{ copied ? 'Copié !' : 'Copier le JSON' }}
            </v-btn>
          </div>

          <v-tabs
            v-model="tab"
            class="px-3"
          >
            <v-tab value="custom">
              Champs personnalisés <span class="bo-seg__n">{{ filteredCustomFields.length }}</span>
            </v-tab>
            <v-tab value="native">
              Champs natifs <span class="bo-seg__n">{{ filteredNativeFields.length }}</span>
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
                class="bo-table"
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
                  <div class="bo-empty">
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
                class="bo-table"
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
                  <div class="bo-empty">
                    Aucun champ ne correspond au filtre.
                  </div>
                </template>
              </v-data-table>
            </v-window-item>

            <v-window-item value="json">
              <pre class="bo-json">{{ prettyJson }}</pre>
            </v-window-item>
          </v-window>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mdiMagnify, mdiOpenInNew, mdiContentCopy, mdiRefresh, mdiAlertCircleOutline } from '@mdi/js'
import BoPageHeader from '~/components/booking/BoPageHeader.vue'
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
const statusTones = {
  0: 'bo-tag--info',
  1: 'bo-tag--ok',
  2: 'bo-tag--crit',
  3: '',
}
const statusLabel = computed(() => statusLabels[Number(data.value?.deal?.status)] || 'Inconnu')
const statusTone = computed(() => statusTones[Number(data.value?.deal?.status)] ?? '')

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
.bo-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 14px;
}

.bo-summary__v {
  margin-top: 2px;
  font-size: 12.5px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bo-code {
  font-family: var(--bo-ff-data);
  font-size: 11px;
  background: var(--bo-surface-2);
  box-shadow: inset 0 0 0 1px var(--bo-line-soft);
  padding: 1px 5px;
  border-radius: var(--bo-radius-s);
}

.bo-value {
  word-break: break-word;
}

.bo-json {
  margin: 0;
  padding: 16px;
  max-height: 70vh;
  overflow: auto;
  font-family: var(--bo-ff-data);
  font-size: 11.5px;
  line-height: 1.6;
  background: var(--bo-surface-2);
}
</style>
