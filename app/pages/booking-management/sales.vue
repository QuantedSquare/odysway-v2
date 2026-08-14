<template>
  <div>
    <BoPageHeader
      title="Sales — pilotage des départs"
      :subtitle="subtitle"
      :crumbs="[{ title: 'Backoffice', to: '/booking-management' }, { title: 'Sales' }]"
    >
      <template #actions>
        <v-btn
          :prepend-icon="mdiRefresh"
          :loading="loading"
          @click="fetchRows"
        >
          Actualiser
        </v-btn>
      </template>
    </BoPageHeader>

    <div class="bo-well">
      <!-- Le chiffre qui justifie l'écran : la marge qui dort dans les sièges
           vides des départs encore à venir. -->
      <section class="bo-hero">
        <div class="bo-hero__n">
          {{ formatEur(dormant.total) }}
        </div>
        <div class="bo-hero__l">
          de marge quasi-pure dorment dans les sièges vides ·
          <b>GIR propres {{ formatEur(dormant.gir) }}</b> ·
          co-remplissage {{ formatEur(dormant.co) }} ·
          pousser au prochain siège pair d'abord
        </div>
      </section>

      <p class="bo-note">
        <b>Règle du siège pair</b> — la marge marginale des sièges pairs (2/4/6/8) vaut
        environ le double de celle des impairs (effet chambre double). Le « prochain
        palier rentable » tombe donc presque toujours sur un siège pair :
        <b>c'est là qu'il faut pousser en priorité</b>. Les repères épais sur les barres
        de remplissage marquent ces sièges. Priorité aux départs
        <span class="bo-motor bo-motor--gir">GIR</span> (marge Odysway) sur les
        <span class="bo-motor bo-motor--co">co-remp</span> (marge partenaire fixe).
      </p>

      <!-- Plage de dates : rechargée côté serveur, ce n'est pas un filtre local. -->
      <form
        class="bo-daterange"
        @submit.prevent="applyRange"
      >
        <div class="bo-datefield">
          <label for="pilotage-from">Depuis</label>
          <input
            id="pilotage-from"
            v-model="draftFrom"
            type="date"
          >
        </div>
        <div class="bo-datefield">
          <label for="pilotage-to">Jusqu'au</label>
          <input
            id="pilotage-to"
            v-model="draftTo"
            type="date"
          >
        </div>
        <v-btn
          type="submit"
          :loading="loading"
        >
          Appliquer
        </v-btn>
      </form>

      <div
        v-if="loading"
        class="d-flex justify-center py-12"
      >
        <v-progress-circular
          indeterminate
          color="primary"
          size="40"
        />
      </div>

      <div
        v-else-if="error"
        class="bo-notice bo-notice--crit"
      >
        <v-icon
          size="18"
          :icon="mdiAlertCircleOutline"
        />
        <div class="bo-notice__body">
          <div class="bo-notice__title">
            Chargement impossible
          </div>
          <div class="bo-notice__meta">
            {{ error }}
          </div>
        </div>
        <div class="bo-notice__actions">
          <v-btn @click="fetchRows">
            Réessayer
          </v-btn>
        </div>
      </div>

      <template v-else>
        <!-- Ordre imposé : sécuriser, puis optimiser, puis arbitrer, puis tout
             voir. L'onglet actif porte la couleur pleine de sa catégorie. -->
        <div
          class="bo-tabs"
          role="tablist"
          aria-label="Catégories de départs"
        >
          <button
            v-for="t in TABS"
            :key="t.id"
            type="button"
            role="tab"
            class="bo-tabs__t"
            :class="`bo-tabs__t--${t.tone}`"
            :aria-selected="tab === t.id"
            @click="tab = t.id"
          >
            {{ t.label }}
            <span class="bo-tabs__n">{{ counts[t.id] }}</span>
          </button>
        </div>

        <section class="bo-stats">
          <div class="bo-stat bo-stat--ok">
            <div class="bo-stat__k">
              Départs à garantir
            </div>
            <div class="bo-stat__v">
              {{ counts.sauver }}
            </div>
            <div class="bo-stat__n">
              une vente suffit à confirmer le départ
            </div>
          </div>
          <div class="bo-stat bo-stat--accent">
            <div class="bo-stat__k">
              Marge additionnelle
            </div>
            <div class="bo-stat__v">
              {{ formatEur(kpis.remaining) }}
            </div>
            <div class="bo-stat__n">
              sur les départs déjà garantis
            </div>
          </div>
          <div class="bo-stat bo-stat--warn">
            <div class="bo-stat__k">
              Potentiel +1 vente
            </div>
            <div class="bo-stat__v">
              {{ formatEur(kpis.nextSale) }}
            </div>
            <div class="bo-stat__n">
              une vente de plus sur chaque départ actionnable
            </div>
          </div>
          <div class="bo-stat bo-stat--info">
            <div class="bo-stat__k">
              Décisions à prendre
            </div>
            <div class="bo-stat__v">
              {{ counts.decider }}
            </div>
            <div class="bo-stat__n">
              échéance J‑{{ DECISION_LEAD_DAYS }} atteinte ou proche
            </div>
          </div>
        </section>

        <!-- À garantir / À décider : mêmes colonnes, mêmes gestes. -->
        <section
          v-if="tab === 'sauver' || tab === 'decider'"
          class="bo-card"
        >
          <div class="bo-card__head">
            <div class="bo-blkhead">
              <h2>{{ activeTab.label }}</h2>
              <span class="bo-blkhead__c">{{ visibleRows.length }} départ{{ visibleRows.length > 1 ? 's' : '' }}</span>
            </div>
          </div>

          <v-table class="bo-table">
            <thead>
              <tr>
                <th>Voyage</th>
                <th>Départ</th>
                <th>Échéance</th>
                <th>Remplissage</th>
                <th>Objectif</th>
                <th class="text-right">
                  Prochaine vente
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in shownRows"
                :key="row.travel_date_id"
                class="bo-tr"
                :class="`bo-tr--seg-${activeTab.tone}`"
                @click="openDeparture(row)"
              >
                <td>
                  <BoVoyageLabel v-bind="metaFor(row.slug)" />
                </td>
                <td class="bo-num bo-muted">
                  {{ formatDay(row.date) }} · J‑{{ row.days_to_departure }}
                </td>
                <td>
                  <span
                    class="bo-tag"
                    :class="deadline(row).cls"
                  >{{ deadline(row).text }}</span>
                </td>
                <td>
                  <BoSeatBar v-bind="seatProps(row)" />
                </td>
                <td>
                  manque <b>{{ row.missing }}</b> pax
                </td>
                <td class="text-right bo-eur">
                  <span v-if="row.next_sale_gain > 0">+{{ formatEur(row.next_sale_gain) }}</span>
                  <span
                    v-else
                    class="bo-muted"
                  >—</span>
                </td>
                <td class="text-right">
                  <BoDepartureActions
                    :query="metaFor(row.slug).title"
                    @open="openDeparture(row)"
                  />
                </td>
              </tr>
              <tr v-if="!shownRows.length">
                <td colspan="7">
                  <div class="bo-empty">
                    Aucun départ dans cette catégorie sur la plage choisie.
                  </div>
                </td>
              </tr>
            </tbody>
          </v-table>

          <div
            v-if="hasMore"
            class="pa-3"
          >
            <button
              type="button"
              class="bo-chip bo-chip--accent"
              @click="showAll = true"
            >
              Voir les {{ visibleRows.length }} départs →
            </button>
          </div>
        </section>

        <!-- À maximiser : le départ est acquis, la question est combien il rapporte. -->
        <section
          v-else-if="tab === 'maximiser'"
          class="bo-card"
        >
          <div class="bo-card__head">
            <div class="bo-blkhead">
              <h2>{{ activeTab.label }}</h2>
              <span class="bo-blkhead__c">{{ visibleRows.length }} départ{{ visibleRows.length > 1 ? 's' : '' }}</span>
            </div>
          </div>

          <v-table class="bo-table">
            <thead>
              <tr>
                <th>Voyage</th>
                <th>Départ</th>
                <th>Remplissage</th>
                <th class="text-right">
                  Prochaine vente
                </th>
                <th>Prochain palier rentable</th>
                <th class="text-right">
                  Potentiel restant
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in shownRows"
                :key="row.travel_date_id"
                class="bo-tr bo-tr--seg-accent"
                @click="openDeparture(row)"
              >
                <td>
                  <BoVoyageLabel v-bind="metaFor(row.slug)" />
                </td>
                <td class="bo-num bo-muted">
                  {{ formatDay(row.date) }}
                </td>
                <td>
                  <BoSeatBar v-bind="seatProps(row)" />
                </td>
                <td class="text-right bo-eur">
                  <span v-if="row.next_sale_gain > 0">+{{ formatEur(row.next_sale_gain) }}</span>
                  <span
                    v-else
                    class="bo-muted"
                  >—</span>
                </td>
                <td>
                  <span
                    v-if="row.step"
                    class="bo-step"
                  >
                    <b>{{ row.step }} pax</b> · {{ row.step_sales }} vente{{ row.step_sales > 1 ? 's' : '' }} ·
                    +{{ formatEur(row.step_gain) }}
                  </span>
                  <span
                    v-else
                    class="bo-muted"
                  >—</span>
                </td>
                <td class="text-right bo-eur">
                  <span v-if="row.remaining_potential > 0">{{ formatEur(row.remaining_potential) }}</span>
                  <span
                    v-else
                    class="bo-muted"
                  >—</span>
                </td>
                <td class="text-right">
                  <BoDepartureActions
                    :query="metaFor(row.slug).title"
                    @open="openDeparture(row)"
                  />
                </td>
              </tr>
              <tr v-if="!shownRows.length">
                <td colspan="7">
                  <div class="bo-empty">
                    Aucun départ garanti avec du potentiel restant sur cette plage.
                  </div>
                </td>
              </tr>
            </tbody>
          </v-table>

          <div
            v-if="hasMore"
            class="pa-3"
          >
            <button
              type="button"
              class="bo-chip bo-chip--accent"
              @click="showAll = true"
            >
              Voir les {{ visibleRows.length }} départs →
            </button>
          </div>
        </section>

        <!-- Tous les départs : le tableau exhaustif, y compris ce qui n'entre
             dans aucun onglet d'action (co-remplissage, sans traction, non suivi). -->
        <section
          v-else
          class="bo-card"
        >
          <div class="bo-card__head">
            <div class="bo-blkhead">
              <h2>Tous les départs</h2>
              <span class="bo-blkhead__c">{{ visibleRows.length }} sur {{ rows.length }}</span>
            </div>
          </div>

          <div class="bo-card__body pb-0">
            <div class="bo-chips">
              <button
                v-for="f in SEGMENT_FILTERS"
                :key="f.id"
                type="button"
                class="bo-chip"
                :aria-pressed="segmentFilter === f.id"
                @click="segmentFilter = f.id"
              >
                {{ f.label }}
              </button>
              <span class="flex-grow-1" />
              <button
                v-for="m in MOTOR_FILTERS"
                :key="m.id"
                type="button"
                class="bo-chip bo-chip--accent"
                :aria-pressed="motorFilter === m.id"
                @click="motorFilter = m.id"
              >
                {{ m.label }}
              </button>
            </div>
          </div>

          <v-table class="bo-table bo-table--wide">
            <thead>
              <tr>
                <th>Départ</th>
                <th>Voyage</th>
                <th>J‑ départ</th>
                <th>Statut</th>
                <th>Ody / Total / Max</th>
                <th class="text-right">
                  Prochaine vente
                </th>
                <th>Palier</th>
                <th class="text-right">
                  Potentiel restant
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in shownRows"
                :key="row.travel_date_id"
                class="bo-tr"
                @click="openDeparture(row)"
              >
                <td class="bo-num bo-muted">
                  {{ formatDay(row.date) }}
                </td>
                <td>
                  <BoVoyageLabel
                    v-bind="metaFor(row.slug)"
                    :inline="true"
                  />
                </td>
                <td class="bo-muted">
                  J‑{{ row.days_to_departure }}
                </td>
                <td>
                  <span
                    class="bo-tag"
                    :class="status(row).cls"
                  >{{ status(row).text }}</span>
                  <span
                    class="bo-motor ml-2"
                    :class="row.co_filling ? 'bo-motor--co' : 'bo-motor--gir'"
                  >{{ row.co_filling ? 'co-remp' : 'GIR' }}</span>
                </td>
                <td class="bo-num bo-muted">
                  {{ row.real_pax }} / {{ row.booked }} / {{ row.max }}
                </td>
                <td class="text-right bo-eur">
                  <span v-if="row.next_sale_gain > 0">+{{ formatEur(row.next_sale_gain) }}</span>
                  <span
                    v-else
                    class="bo-muted"
                  >—</span>
                </td>
                <td class="bo-step">
                  <span v-if="row.step">{{ row.step }} pax (+{{ formatEur(row.step_gain) }})</span>
                  <span
                    v-else
                    class="bo-muted"
                  >—</span>
                </td>
                <td class="text-right bo-eur">
                  <span v-if="row.remaining_potential > 0">{{ formatEur(row.remaining_potential) }}</span>
                  <span
                    v-else
                    class="bo-muted"
                  >—</span>
                </td>
                <td class="text-right">
                  <BoDepartureActions
                    :query="metaFor(row.slug).title"
                    @open="openDeparture(row)"
                  />
                </td>
              </tr>
              <tr v-if="!shownRows.length">
                <td colspan="9">
                  <div class="bo-empty">
                    Aucun départ ne correspond à ces filtres.
                  </div>
                </td>
              </tr>
            </tbody>
          </v-table>

          <div
            v-if="hasMore"
            class="pa-3"
          >
            <button
              type="button"
              class="bo-chip bo-chip--accent"
              @click="showAll = true"
            >
              Voir les {{ visibleRows.length }} départs →
            </button>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { stegaClean } from '@sanity/client/stega'
import { mdiRefresh, mdiAlertCircleOutline } from '@mdi/js'
import BoPageHeader from '~/components/booking/BoPageHeader.vue'
import BoSeatBar from '~/components/booking/BoSeatBar.vue'
import BoVoyageLabel from '~/components/booking/BoVoyageLabel.vue'
import BoDepartureActions from '~/components/booking/BoDepartureActions.vue'
import { bookingApi, getApiErrorMessage } from '~/utils/bookingApi'
import { formatEur } from '~/utils/formatNumber'

definePageMeta({
  layout: 'booking',
  middleware: 'booking-management'
})

useSeoMeta({
  htmlAttrs: { lang: 'fr' },
  robots: 'noindex, follow'
})

// Doit rester aligné sur DECISION_LEAD_DAYS de l'endpoint : c'est le même
// arbitrage métier, calculé là-bas et seulement affiché ici.
const DECISION_LEAD_DAYS = 30

// Au-delà, la table cesse d'être un plan de travail et devient un export. Le
// bouton « voir tout » reste là pour ceux qui veulent balayer.
const PAGE_SIZE = 25

const TABS = [
  { id: 'sauver', label: 'À garantir', tone: 'ok' },
  { id: 'maximiser', label: 'À maximiser', tone: 'accent' },
  { id: 'decider', label: 'À décider', tone: 'info' },
  { id: 'tous', label: 'Tous les départs', tone: 'neutral' }
]

const SEGMENT_FILTERS = [
  { id: 'all', label: 'Tous' },
  { id: 'sauver', label: 'À garantir' },
  { id: 'maximiser', label: 'À maximiser' },
  { id: 'decider', label: 'À décider' },
  { id: 'non_garanti', label: 'Non garanti' },
  { id: 'sans_traction', label: 'Sans traction' },
  { id: 'non_suivi', label: 'Non suivi' }
]

const MOTOR_FILTERS = [
  { id: 'all', label: 'Tous moteurs' },
  { id: 'gir', label: 'GIR propres' },
  { id: 'coremp', label: 'Co-remp' }
]

const router = useRouter()
const sanity = useSanity()

const loading = ref(true)
const error = ref('')
const rows = ref([])
const tab = ref('sauver')
const segmentFilter = ref('all')
const motorFilter = ref('all')
const showAll = ref(false)

// La plage part d'aujourd'hui : le pilotage ne regarde que devant. Le passé se
// lit dans le dashboard des marges, qui est un outil de bilan.
const from = ref(dayjs().format('YYYY-MM-DD'))
const to = ref(dayjs().add(6, 'month').format('YYYY-MM-DD'))
const draftFrom = ref(from.value)
const draftTo = ref(to.value)

// --- Métadonnées voyage (Sanity) -------------------------------------------
const voyageMetaQuery = groq`*[_type == "voyage" && defined(slug.current)]{
  "slug": slug.current,
  title,
  bmsReference,
  "country": destinations[0]->title
}`
const { data: voyageMetaList } = await useAsyncData('salesVoyageMeta', () => sanity.fetch(voyageMetaQuery))

const metaBySlug = computed(() => {
  const map = new Map()
  for (const v of voyageMetaList.value || []) {
    // Hors production, chaque chaîne Sanity transporte des caractères de
    // largeur nulle (stega) qui casseraient la concaténation du code.
    const slug = stegaClean(v.slug)
    if (!slug) continue
    const reference = stegaClean(v.bmsReference) || ''
    const country = stegaClean(v.country) || ''
    map.set(slug, {
      title: stegaClean(v.title) || slug,
      code: reference ? [country, reference].filter(Boolean).join(' - ') : ''
    })
  }
  return map
})

const metaFor = slug => metaBySlug.value.get(slug) || { title: slug, code: '' }

// --- Données ---------------------------------------------------------------
const fetchRows = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await bookingApi.getMarginsPilotage({ from: from.value, to: to.value })
    rows.value = data.rows || []
  }
  catch (err) {
    error.value = getApiErrorMessage(err, 'Erreur chargement du poste de pilotage.')
    rows.value = []
  }
  finally {
    loading.value = false
  }
}

const applyRange = () => {
  // Deux dates inversées sont une faute de frappe, pas une plage vide.
  const [start, end] = draftFrom.value > draftTo.value
    ? [draftTo.value, draftFrom.value]
    : [draftFrom.value, draftTo.value]
  draftFrom.value = start
  draftTo.value = end
  from.value = start
  to.value = end
  fetchRows()
}

// --- Dérivés ---------------------------------------------------------------
const counts = computed(() => ({
  sauver: rows.value.filter(r => r.segment === 'sauver').length,
  maximiser: rows.value.filter(r => r.segment === 'maximiser').length,
  decider: rows.value.filter(r => r.segment === 'decider').length,
  tous: rows.value.length
}))

const kpis = computed(() => {
  const sum = (list, key) => list.reduce((acc, r) => acc + (r[key] || 0), 0)
  const actionable = rows.value.filter(r => ['sauver', 'maximiser', 'decider'].includes(r.segment))
  return {
    remaining: sum(rows.value.filter(r => r.segment === 'maximiser'), 'remaining_potential'),
    nextSale: sum(actionable, 'next_sale_gain')
  }
})

// Marge dormante : ce que rapporterait le remplissage des départs encore à
// venir. Séparée par moteur, parce qu'un euro GIR est une marge Odysway alors
// qu'un euro co-remplissage est une commission partenaire fixe.
const dormant = computed(() => {
  const future = rows.value.filter(r => r.days_to_departure > 0 && r.remaining_potential > 0)
  const gir = future.filter(r => !r.co_filling).reduce((acc, r) => acc + r.remaining_potential, 0)
  const co = future.filter(r => r.co_filling).reduce((acc, r) => acc + r.remaining_potential, 0)
  return { gir, co, total: gir + co }
})

const activeTab = computed(() => TABS.find(t => t.id === tab.value) || TABS[0])

const visibleRows = computed(() => {
  if (tab.value === 'tous') {
    return rows.value.filter((r) => {
      if (segmentFilter.value !== 'all' && r.segment !== segmentFilter.value) return false
      if (motorFilter.value === 'gir' && r.co_filling) return false
      if (motorFilter.value === 'coremp' && !r.co_filling) return false
      return true
    })
  }

  // Chaque onglet a son propre ordre de lecture : le plus gros potentiel pour
  // « à maximiser », l'échéance la plus serrée pour « à décider », le départ le
  // plus proche pour « à garantir ».
  const list = rows.value.filter(r => r.segment === tab.value)
  if (tab.value === 'maximiser') {
    return [...list].sort((a, b) => (b.remaining_potential - a.remaining_potential) || (a.date < b.date ? -1 : 1))
  }
  if (tab.value === 'decider') {
    return [...list].sort((a, b) => a.days_to_decision - b.days_to_decision)
  }
  return [...list].sort((a, b) => a.days_to_departure - b.days_to_departure)
})

const shownRows = computed(() => (showAll.value ? visibleRows.value : visibleRows.value.slice(0, PAGE_SIZE)))
const hasMore = computed(() => !showAll.value && visibleRows.value.length > PAGE_SIZE)

// Changer d'onglet ou de filtre replie la liste : sinon on hérite du « voir
// tout » d'une catégorie de 12 lignes sur une catégorie de 600.
watch([tab, segmentFilter, motorFilter], () => {
  showAll.value = false
})

const subtitle = computed(() => {
  if (loading.value) return 'Chargement…'
  const n = rows.value.length
  return `${n} départ${n > 1 ? 's' : ''} · du ${formatFR(from.value)} au ${formatFR(to.value)}`
})

// --- Rendu -----------------------------------------------------------------
const formatDay = value => dayjs(value).format('D MMM')
const formatFR = value => dayjs(value).format('DD/MM/YYYY')

const seatProps = row => ({
  booked: row.booked,
  realPax: row.real_pax,
  partners: row.partners,
  max: row.max,
  guaranteed: row.guaranteed
})

// Le rouge est réservé à l'alerte réelle : l'échéance est dépassée ou tombe
// aujourd'hui. « Dans 5 jours » est une urgence, pas une alerte — ambre.
const deadline = (row) => {
  const days = row.days_to_decision
  if (days < 0) return { cls: 'bo-tag--crit', text: `dépassée +${-days}j` }
  if (days === 0) return { cls: 'bo-tag--crit', text: 'aujourd\'hui' }
  if (days <= 7) return { cls: 'bo-tag--warn', text: `dans ${days}j` }
  return { cls: '', text: `dans ${days}j` }
}

const status = (row) => {
  if (!row.configured) return { cls: '', text: 'Non suivi' }
  if (row.guaranteed) {
    return row.co_filling
      ? { cls: 'bo-tag--part', text: 'Garanti par partenaires' }
      : { cls: 'bo-tag--ok', text: 'Garanti' }
  }
  if (row.segment === 'decider' || row.segment === 'sauver') {
    return { cls: 'bo-tag--warn', text: `Manque ${row.missing}` }
  }
  if (row.segment === 'sans_traction') return { cls: '', text: 'Sans traction' }
  return { cls: 'bo-tag--info', text: 'Non garanti' }
}

const openDeparture = (row) => {
  router.push(`/booking-management/${row.slug}/${row.travel_date_id}`)
}

onMounted(fetchRows)
</script>
