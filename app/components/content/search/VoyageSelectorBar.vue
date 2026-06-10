<template>
  <div class="selector ">
    <!-- ============ DESKTOP ============ -->
    <template v-if="mdAndUp">
      <div class="bar text-primary">
        <button
          v-for="seg in segments"
          :key="seg.key"
          class="seg"
          :class="{ on: openSegment === seg.key }"
          type="button"
          @click="toggleSegment(seg.key)"
        >
          <v-icon
            :icon="seg.icon"
            class="lead-i"
          />
          <span class="seg-txt">
            <span class="c">{{ seg.cap }}</span>
            <span class="v">{{ seg.label }}</span>
          </span>
          <v-icon
            :icon="openSegment === seg.key ? mdiChevronUp : mdiChevronDown"
            class="chev"
          />
        </button>
      </div>

      <Transition name="panel">
        <div
          v-if="openSegment"
          class="panel"
        >
          <div class="panel-body">
          <!-- Destination -->
        <template v-if="openSegment === 'dest'">
          <div class="quick">
            <button
              v-for="q in scopeButtons"
              :key="q"
              class="qbtn"
              :class="{ on: scope === q }"
              type="button"
              @click="scope = q"
            >
              {{ q }}
            </button>
          </div>
          <p class="affine">
            Affinez par destination :
          </p>
          <template
            v-for="grp in destinationsByRegion"
            :key="grp.nom"
          >
            <p class="reg">
              {{ clean(grp.nom) === 'France' ? 'France · régions' : grp.nom }}
            </p>
            <div class="grid">
              <button
                v-for="d in grp.destinations"
                :key="d.slug"
                class="thumb"
                :class="{ on: selDest.includes(d.slug) }"
                type="button"
                @click="toggleDest(d.slug)"
              >
                <span
                  class="ph"
                  :style="thumbBg(d)"
                >
                  <v-icon
                    v-if="!d.image?.asset?._ref"
                    :icon="mdiMapMarker"
                  />
                </span>
                <span class="scrim" />
                <span class="badge">{{ d.count }} voyage{{ d.count > 1 ? 's' : '' }}</span>
                <span
                  v-if="selDest.includes(d.slug)"
                  class="chk"
                >
                  <v-icon
                    :icon="mdiCheck"
                    size="14"
                    color="white"
                  />
                </span>
                <span class="name">{{ d.title }}</span>
              </button>
            </div>
          </template>
        </template>

        <!-- Type de voyage -->
        <template v-else-if="openSegment === 'type'">
          <div class="quick">
            <button
              class="qbtn"
              :class="{ on: !selType }"
              type="button"
              @click="setType('')"
            >
              Tous
            </button>
            <button
              class="qbtn"
              :class="{ on: selType === travelTypes.group }"
              type="button"
              @click="setType(travelTypes.group)"
            >
              Petit groupe
            </button>
            <button
              class="qbtn"
              :class="{ on: selType === travelTypes.individual }"
              type="button"
              @click="setType(travelTypes.individual)"
            >
              Privatisable
            </button>
          </div>
          <p class="affine">
            Affinez par activité :
          </p>
          <div class="cgrid">
            <button
              v-for="c in categories"
              :key="c.slug"
              class="citem"
              :class="{ on: selActivities.includes(c.slug) }"
              type="button"
              @click="toggleActivity(c.slug)"
            >
              {{ c.title.trim() }}
            </button>
          </div>
        </template>

        <!-- Période -->
        <template v-else>
          <div class="quick">
            <button
              class="qbtn"
              :class="{ on: selMonths.length === 0 }"
              type="button"
              @click="clearSeason()"
            >
              Toute l'année
            </button>
            <button
              v-for="(_months, name) in SEASONS"
              :key="name"
              class="qbtn"
              :class="{ on: isSeasonOn(name) }"
              type="button"
              @click="setSeason(name)"
            >
              {{ name }}
            </button>
          </div>
          <p class="affine">
            Mois précis :
          </p>
          <div class="cgrid months">
            <button
              v-for="(m, i) in MONTHS"
              :key="i"
              class="citem center"
              :class="{ on: selMonths.includes(i + 1) }"
              type="button"
              @click="toggleMonth(i + 1)"
            >
              {{ m }}
            </button>
          </div>
        </template>

          </div>

          <div class="foot">
            <button
              class="clear"
              type="button"
              @click="clearPanel(openSegment)"
            >
            Tout effacer
          </button>
          <button
            class="go"
            type="button"
            @click="openSegment = null"
          >
            Voir les {{ liveCount }} voyage{{ liveCount > 1 ? 's' : '' }}
          </button>
        </div>
        </div>
      </Transition>
    </template>

    <!-- ============ MOBILE ============ -->
    <template v-else>
      <button
        v-for="seg in segments"
        :key="seg.key"
        class="prow "
        type="button"
        @click="sheet = seg.key"
      >
        <v-icon
          :icon="seg.icon"
          class="lead-i"
        />
        <span class="seg-txt">
          <span class="c">{{ seg.cap }}</span>
          <span class="v">{{ seg.label }}</span>
        </span>
        <v-icon
          :icon="mdiChevronRight"
          class="chev"
        />
      </button>

      <v-bottom-sheet v-model="sheetOpen">
        <div class="sheet">
          <div class="handle" />
          <h5>{{ sheetTitle }}</h5>
          <div class="schips">
            <!-- Destination -->
            <template v-if="sheet === 'dest'">
              <button
                v-for="q in scopeButtons"
                :key="q"
                class="schip"
                :class="{ scope: scope === q }"
                type="button"
                @click="scope = q"
              >
                {{ q }}
              </button>
              <div class="sdiv" />
              <button
                v-for="d in mobileDests"
                :key="d.slug"
                class="schip"
                :class="{ on: selDest.includes(d.slug) }"
                type="button"
                @click="toggleDest(d.slug)"
              >
                <span
                  class="dot"
                  :style="{ background: regionColor(d.regionNom) }"
                />
                {{ d.title }}
              </button>
            </template>

            <!-- Type -->
            <template v-else-if="sheet === 'type'">
              <button
                class="schip"
                :class="{ on: selType === travelTypes.group }"
                type="button"
                @click="setType(travelTypes.group)"
              >
                Petit groupe
              </button>
              <button
                class="schip"
                :class="{ on: selType === travelTypes.individual }"
                type="button"
                @click="setType(travelTypes.individual)"
              >
                Privatisable
              </button>
              <div class="sdiv" />
              <button
                v-for="c in categories"
                :key="c.slug"
                class="schip"
                :class="{ on: selActivities.includes(c.slug) }"
                type="button"
                @click="toggleActivity(c.slug)"
              >
                {{ c.title.trim() }}
              </button>
            </template>

            <!-- Période -->
            <template v-else>
              <button
                v-for="(_months, name) in SEASONS"
                :key="name"
                class="schip"
                :class="{ on: isSeasonOn(name) }"
                type="button"
                @click="setSeason(name)"
              >
                {{ name }}
              </button>
              <div class="sdiv" />
              <button
                v-for="(m, i) in MONTHS"
                :key="i"
                class="schip"
                :class="{ on: selMonths.includes(i + 1) }"
                type="button"
                @click="toggleMonth(i + 1)"
              >
                {{ m }}
              </button>
            </template>
          </div>
          <button
            class="go"
            type="button"
            @click="sheet = null"
          >
            Voir les {{ liveCount }} voyage{{ liveCount > 1 ? 's' : '' }}
          </button>
        </div>
      </v-bottom-sheet>
    </template>
  </div>
</template>

<script setup>
import {
  mdiMapSearchOutline, mdiBagPersonalOutline, mdiCalendarMonthOutline,
  mdiChevronDown, mdiChevronUp, mdiChevronRight, mdiCheck, mdiMapMarker,
} from '@mdi/js'
import { useDisplay } from 'vuetify'
import { useVoyageFilters } from '~/composables/useVoyageFilters'
import { getImageUrl } from '~/utils/getImageUrl'

const props = defineProps({
  destinations: { type: Array, default: () => [] },
  regions: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
  travelTypes: { type: Object, default: () => ({}) },
  allVoyages: { type: Array, default: () => [] },
})

const route = useRoute()
const router = useRouter()
const { mdAndUp } = useDisplay()
const { countMatching } = useVoyageFilters()

const REGION_ORDER = ['France', 'Europe', 'Asie', 'Afrique', 'Amérique du Nord', 'Amérique Centrale', 'Amérique du Sud', 'Moyen-Orient']
const REGION_COLOR = {
  'France': '#2B4C52',
  'Europe': '#378ADD',
  'Asie': '#D85A30',
  'Afrique': '#BA7517',
  'Amérique du Nord': '#1D9E75',
  'Amérique Centrale': '#1D9E75',
  'Amérique du Sud': '#1D9E75',
  'Moyen-Orient': '#8a6a2a',
}
const SEASONS = {
  'Printemps': [3, 4, 5],
  'Été': [6, 7, 8],
  'Automne': [9, 10, 11],
  'Hiver': [12, 1, 2],
}
const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

// UI-only state
const openSegment = ref(null) // desktop dropdown: 'dest' | 'type' | 'per'
const sheet = ref(null) // mobile bottom-sheet segment
const scope = ref('Toutes')

const sheetOpen = computed({
  get: () => !!sheet.value,
  set: (v) => { if (!v) sheet.value = null },
})

// --- selections derived from route.query (single source of truth) ---
const selDest = computed(() => (route.query.destination ? String(route.query.destination).split(',').filter(Boolean) : []))
const selType = computed(() => route.query.travelType || '')
const selActivities = computed(() => (route.query.activities ? String(route.query.activities).split(',').filter(Boolean) : []))
const selMonths = computed(() => (route.query.from ? String(route.query.from).split(',').map(Number).filter(n => n > 0 && n <= 12) : []))

const ctx = computed(() => ({
  destinations: props.destinations,
  regions: props.regions,
  travelTypes: props.travelTypes,
}))

const liveCount = computed(() => countMatching(props.allVoyages, {
  destinations: selDest.value,
  travelType: selType.value,
  from: route.query.from || '',
  activities: selActivities.value,
}, ctx.value))

const segments = computed(() => [
  { key: 'dest', icon: mdiMapSearchOutline, cap: 'Destination', label: destLabel.value },
  { key: 'type', icon: mdiBagPersonalOutline, cap: 'Type de voyage', label: typeLabel.value },
  { key: 'per', icon: mdiCalendarMonthOutline, cap: 'Période', label: perLabel.value },
])

const sheetTitle = computed(() => ({ dest: 'Destination', type: 'Type de voyage', per: 'Période' }[sheet.value] || ''))

// Sanity visual-editing (stega) injects invisible chars into string fields in
// dev — strip them when comparing a region name against a literal. No-op in prod.
const clean = s => (s || '').replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]|[\u{E0000}-\u{E007F}]/gu, '')

// --- region ordering / scope ---
const orderedRegions = computed(() => {
  return [...props.regions].sort((a, b) => {
    const ia = REGION_ORDER.indexOf(clean(a.nom))
    const ib = REGION_ORDER.indexOf(clean(b.nom))
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || clean(a.nom).localeCompare(clean(b.nom))
  })
})

const scopeButtons = computed(() => {
  const noms = orderedRegions.value.map(r => r.nom)
  const france = noms.find(n => clean(n) === 'France')
  const rest = noms.filter(n => clean(n) !== 'France')
  return ['Toutes', ...(france ? [france] : []), 'Hors France', ...rest]
})

function visibleRegionNoms() {
  const all = orderedRegions.value.map(r => r.nom)
  if (scope.value === 'Toutes') return all
  if (scope.value === 'Hors France') return all.filter(n => clean(n) !== 'France')
  return [scope.value]
}

const destinationsByRegion = computed(() =>
  visibleRegionNoms().map(nom => ({
    nom,
    destinations: props.destinations
      .filter(d => d.regions?.some(r => r.nom === nom))
      .sort((a, b) => a.title.localeCompare(b.title)),
  })).filter(g => g.destinations.length > 0),
)

const mobileDests = computed(() =>
  destinationsByRegion.value.flatMap(g => g.destinations.map(d => ({ ...d, regionNom: g.nom }))),
)

// --- segment labels ---
const destLabel = computed(() => {
  const n = selDest.value.length
  if (n === 0) return 'Toutes destinations'
  if (n === 1) return destSlugLabel(selDest.value[0])
  return `${n} destinations`
})
const typeLabel = computed(() => {
  const n = (selType.value ? 1 : 0) + selActivities.value.length
  return n === 0 ? 'Type de voyage' : `${n} critère${n > 1 ? 's' : ''}`
})
const perLabel = computed(() => {
  const n = selMonths.value.length
  if (n === 0) return 'Toute période'
  if (n === 12) return "Toute l'année"
  return `${n} mois`
})

function destSlugLabel(slug) {
  if (slug === 'top-destination') return 'Top destinations'
  const r = props.regions.find(x => x.slug === slug)
  if (r) return r.nom
  const d = props.destinations.find(x => x.slug === slug)
  return d ? d.title : slug
}

function regionColor(nom) {
  return REGION_COLOR[clean(nom)] || '#2B4C52'
}

function thumbBg(d) {
  const assetRef = d.image?.asset?._ref
  if (assetRef) {
    const url = getImageUrl(assetRef, null, null, 400)
    if (url) return `background-image:url('${url}')`
  }
  return 'background:linear-gradient(135deg,#3d5f7a,#7aa0c0)'
}

// --- query mutation (route is the single source of truth) ---
function updateQuery(patch) {
  const q = { ...route.query }
  Object.entries(patch).forEach(([k, v]) => {
    const empty = v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)
    if (empty) delete q[k]
    else q[k] = Array.isArray(v) ? v.join(',') : v
  })
  router.replace({ path: route.path, query: Object.keys(q).length ? q : undefined })
}

function toggleDest(slug) {
  const arr = [...selDest.value]
  const i = arr.indexOf(slug)
  if (i === -1) arr.push(slug)
  else arr.splice(i, 1)
  updateQuery({ destination: arr })
}
function setType(val) {
  updateQuery({ travelType: selType.value === val ? '' : val })
}
function toggleActivity(slug) {
  const arr = [...selActivities.value]
  const i = arr.indexOf(slug)
  if (i === -1) arr.push(slug)
  else arr.splice(i, 1)
  updateQuery({ activities: arr })
}
function setSeason(name) {
  if (isSeasonOn(name)) updateQuery({ from: '' })
  else updateQuery({ from: (SEASONS[name] || []).map(String) })
}
function clearSeason() {
  updateQuery({ from: '' })
}
function toggleMonth(m) {
  const arr = [...selMonths.value]
  const i = arr.indexOf(m)
  if (i === -1) arr.push(m)
  else arr.splice(i, 1)
  updateQuery({ from: arr.map(String) })
}
function isSeasonOn(name) {
  const s = SEASONS[name]
  return s.length === selMonths.value.length && s.every(m => selMonths.value.includes(m))
}

function clearPanel(seg) {
  if (seg === 'dest') {
    updateQuery({ destination: [] })
    scope.value = 'Toutes'
  }
  else if (seg === 'type') updateQuery({ travelType: '', activities: [] })
  else updateQuery({ from: '' })
}

function toggleSegment(seg) {
  openSegment.value = openSegment.value === seg ? null : seg
}
</script>

<style scoped>
.selector {
  --teal: #2B4C52;
  --or: #DE5E2C;
  --gt: #E7EEED;
  --t1: var(--text-primary);
  --t2: #5d6566;
  --t3: #9aa0a1;
  --bd1: rgba(43, 76, 82, .12);
  --bd2: rgba(43, 76, 82, .24);
  --rmd: 9px;
  --rlg: 14px;
}

/* ---------- Desktop bar ---------- */
.bar {
  display: flex;
  background: #fff;
  border: 1px solid var(--bd2);
  border-radius: var(--rlg);
  overflow: hidden;
}
.seg {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 14px 16px;
  cursor: pointer;
  border: none;
  background: transparent;
  text-align: left;
  border-right: 1px solid var(--bd1);
}
.seg:last-child { border-right: none; }
.seg.on { background: var(--gt); }
.seg .lead-i { font-size: 19px; color: var(--teal); }
.seg-txt { display: flex; flex-direction: column; }
.c { font-size: 11px; color: var(--t3); display: block; margin-bottom: 1px; }
.v { font-weight: 600; font-size: 14px; color: var(--t1); }
.chev { margin-left: auto; font-size: 18px; color: var(--teal); }

.panel {
  background: #fff;
  border: 1px solid var(--bd2);
  border-top: none;
  border-radius: 0 0 var(--rlg) var(--rlg);
  padding: 18px;
  transform-origin: top center;
  display: flex;
  flex-direction: column;
  max-height: 70vh;
}
.panel-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  margin: -2px -8px 0;
  padding: 2px 8px 0;
}

/* Dropdown open/close animation */
.panel-enter-active,
.panel-leave-active {
  transition: opacity .22s ease, transform .22s ease;
  overflow: hidden;
}
.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(-8px) scaleY(.98);
}
@media (prefers-reduced-motion: reduce) {
  .panel-enter-active,
  .panel-leave-active {
    transition: none;
  }
}

.quick { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px; }
.qbtn {
  padding: 9px 15px;
  border: 1px solid var(--bd1);
  border-radius: 30px;
  background: #fff;
  font-size: 13px;
  font-weight: 600;
  color: var(--t1);
  cursor: pointer;
  font-family: inherit;
}
.qbtn.on { border-color: var(--teal); background: var(--teal); color: #fff; }

.affine { font-size: 13px; font-weight: 600; margin: 0 0 6px; color: var(--t1); }
.reg {
  font-size: 11px;
  color: var(--t3);
  margin: 14px 0 8px;
  text-transform: uppercase;
  letter-spacing: .04em;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
.thumb {
  position: relative;
  height: 118px;
  border-radius: var(--rlg);
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  padding: 0;
  background: none;
}
.thumb.on { border-color: var(--or); }
.ph {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
  background-position: center;
}
.ph .v-icon { font-size: 34px; color: rgba(255, 255, 255, .3); }
.scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(20, 30, 28, .74), rgba(20, 30, 28, .06) 60%);
}
.name {
  position: absolute;
  left: 11px;
  bottom: 9px;
  right: 11px;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  text-align: left;
  text-shadow: 0 1px 3px rgba(0, 0, 0, .45);
}
.badge {
  position: absolute;
  top: 9px;
  right: 9px;
  background: rgba(255, 255, 255, .96);
  color: var(--teal);
  font-size: 10px;
  font-weight: 600;
  padding: 4px 9px;
  border-radius: 20px;
}
.chk {
  position: absolute;
  top: 9px;
  left: 9px;
  width: 23px;
  height: 23px;
  border-radius: 50%;
  background: var(--or);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cgrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(128px, 1fr));
  gap: 8px;
}
.cgrid.months { grid-template-columns: repeat(auto-fit, minmax(76px, 1fr)); }
.citem {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border: 1px solid var(--bd1);
  border-radius: var(--rmd);
  background: #fff;
  font-size: 13px;
  color: var(--t1);
  cursor: pointer;
  font-family: inherit;
}
.citem.center { justify-content: center; }
.citem.on { border-color: var(--teal); background: var(--gt); color: var(--teal); }

.foot {
  display: flex;
  align-items: center;
  margin-top: 20px;
  padding-top: 14px;
  border-top: 1px solid var(--bd1);
}
.clear {
  background: none;
  border: none;
  font-size: 13px;
  color: var(--t2);
  cursor: pointer;
  text-decoration: underline;
  font-family: inherit;
}
.go {
  margin-left: auto;
  background: var(--or);
  color: #fff;
  border: none;
  padding: 12px 26px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
.go:hover { filter: brightness(.95); }

/* ---------- Mobile ---------- */
.prow {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--bd1);
  border-radius: var(--rmd);
  background: #fff;
  margin-bottom: 10px;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
}
.prow .lead-i { font-size: 20px; color: var(--teal); }
.prow .chev { margin-left: auto; color: var(--teal); }

.sheet {
  /* Vuetify teleports the bottom-sheet out of .selector, so the CSS vars
     must be re-declared here for borders / backgrounds to resolve. */
  --teal: #2B4C52;
  --or: #DE5E2C;
  --gt: #E7EEED;
  --t1: #222223;
  --t2: #5d6566;
  --t3: #9aa0a1;
  --bd1: rgba(43, 76, 82, .12);
  --bd2: rgba(43, 76, 82, .24);
  --rmd: 9px;
  --rlg: 14px;
  background: #fff;
  border-radius: 18px 18px 0 0;
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  overflow: hidden;
}
.handle {
  width: 38px;
  height: 4px;
  border-radius: 3px;
  background: var(--bd2);
  margin: 2px auto 12px;
}
.sheet h5 { font-size: 15px; font-weight: 600; margin: 0 0 12px; color: var(--t1); }
.schips {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 7px;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}
.sdiv { width: 100%; height: 1px; background: var(--bd1); margin: 4px 0; }
.schip {
  font-size: 13px;
  padding: 8px 12px;
  border-radius: 20px;
  border: 1px solid var(--bd1);
  background: #fff;
  color: var(--t1);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: inherit;
}
.schip.on { border-color: var(--teal); background: var(--gt); color: var(--teal); }
.schip.scope { border-color: var(--teal); background: var(--teal); color: #fff; }
.dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.sheet .go { margin: 16px 0 0; width: 100%; text-align: center; flex: 0 0 auto; }
</style>
