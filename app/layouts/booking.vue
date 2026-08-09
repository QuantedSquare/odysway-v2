<template>
  <v-app
    :theme="vuetifyTheme"
    class="bo"
  >
    <!-- Rail de navigation -->
    <v-navigation-drawer
      v-model="drawer"
      :permanent="mdAndUp"
      :temporary="!mdAndUp"
      width="216"
      :rail="mdAndUp && railMode"
      :rail-width="60"
      class="bo-rail"
    >
      <div
        class="bo-rail__brand"
        :class="railMode ? 'justify-center' : ''"
      >
        <NuxtLink
          to="/booking-management"
          class="d-flex align-center ga-3 text-decoration-none"
        >
          <span class="bo-rail__mark">O</span>
          <span v-if="!railMode">
            <span class="bo-rail__name d-block">Backoffice</span>
            <span class="bo-rail__env">{{ envLabel }}</span>
          </span>
        </NuxtLink>
        <v-spacer v-if="!railMode" />
        <v-btn
          v-if="mdAndUp"
          :icon="railMode ? mdiChevronRight : mdiChevronLeft"
          size="x-small"
          variant="text"
          density="comfortable"
          :aria-label="railMode ? 'Déplier la navigation' : 'Replier la navigation'"
          style="color: var(--bo-rail-ink-2);"
          @click="railMode = !railMode"
        />
      </div>

      <template
        v-for="group in navGroups"
        :key="group.label"
      >
        <div
          v-if="!railMode"
          class="bo-rail__label"
        >
          {{ group.label }}
        </div>
        <v-list
          nav
          class="bo-rail__nav"
        >
          <v-list-item
            v-for="nav in group.items"
            :key="nav.to"
            :to="nav.to"
            :prepend-icon="nav.icon"
            :title="nav.title"
            :exact="nav.exact"
          />
        </v-list>
      </template>

      <template #append>
        <button
          type="button"
          class="bo-rail__theme"
          :class="railMode ? 'bo-rail__theme--rail' : ''"
          :aria-pressed="isDark"
          :title="railMode ? (isDark ? 'Passer en clair' : 'Passer en sombre') : undefined"
          @click="toggleTheme"
        >
          <v-icon
            size="15"
            :icon="isDark ? mdiWeatherNight : mdiWeatherSunny"
          />
          <template v-if="!railMode">
            <span>{{ isDark ? 'Thème sombre' : 'Thème clair' }}</span>
            <span
              class="bo-rail__switch"
              :class="isDark ? 'bo-rail__switch--on' : ''"
            />
          </template>
        </button>

        <div
          v-if="bookingUser"
          class="bo-rail__user"
          :class="railMode ? 'justify-center' : ''"
        >
          <v-avatar
            size="24"
            class="bo-rail__avatar"
          >
            <v-img
              v-if="bookingUser.picture"
              :src="bookingUser.picture"
              alt=""
            />
            <span
              v-else
              class="bo-rail__mail"
            >
              {{ (bookingUser.email || '?').slice(0, 1).toUpperCase() }}
            </span>
          </v-avatar>
          <span
            v-if="!railMode"
            class="bo-rail__mail flex-grow-1"
          >
            {{ bookingUser.email }}
          </span>
          <v-btn
            v-if="!railMode"
            :icon="mdiLogout"
            size="x-small"
            variant="text"
            density="comfortable"
            aria-label="Se déconnecter"
            style="color: var(--bo-rail-ink-2);"
            @click="logout"
          />
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Barre mobile -->
    <v-app-bar
      v-if="!mdAndUp"
      :elevation="0"
      height="48"
      class="bo-mobile-bar"
    >
      <v-btn
        :icon="mdiMenu"
        variant="text"
        aria-label="Ouvrir la navigation"
        @click="drawer = !drawer"
      />
      <span class="bo-rail__name text-truncate">Backoffice</span>
    </v-app-bar>

    <!--
      Les defaults globaux de app/plugins/vuetify.js sont taillés pour le site
      vitrine (cartes `rounded="xl"` ombrées, champs `solo` sur fond gris,
      chips à padding vertical). Ils s'arrêtent ici : tout le backoffice est
      rendu avec les defaults ci-dessous, sans qu'une seule ligne du site
      public ne change.
    -->
    <v-defaults-provider :defaults="boDefaults">
      <v-main>
        <slot />
      </v-main>
      <BoDialogHost />
    </v-defaults-provider>
  </v-app>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useDisplay, useTheme } from 'vuetify'
import {
  mdiLogout,
  mdiViewDashboardOutline,
  mdiAirplaneTakeoff,
  mdiCompassOutline,
  mdiMenu,
  mdiChevronLeft,
  mdiChevronRight,
  mdiCurrencyEur,
  mdiCardSearchOutline,
  mdiDeleteRestore,
  mdiWeatherNight,
  mdiWeatherSunny,
} from '@mdi/js'
import BoDialogHost from '~/components/booking/BoDialogHost.vue'
import '@/assets/scss/backoffice.scss'

const router = useRouter()
const { mdAndUp } = useDisplay()
const config = useRuntimeConfig()

// Les thèmes `backoffice` sont enregistrés à la demande : les garder hors de la
// config Vuetify globale évite ~15-25 Kio de CSS dans le bundle public.
// Les couleurs sont celles de backoffice.scss — une seule source de vérité.
const theme = useTheme()
if (!theme.themes.value.backoffice) {
  theme.themes.value.backoffice = {
    dark: false,
    colors: {
      'primary': '#2B4C52',
      'secondary': '#5B7075',
      'background': '#F1F4F4',
      'surface': '#FFFFFF',
      'surface-variant': '#F7F9F9',
      'on-background': '#16262B',
      'on-surface': '#16262B',
      'success': '#0B7A4B',
      'warning': '#C2410C',
      'error': '#C0261F',
      'info': '#0B6BCB',
    },
    variables: {
      'medium-emphasis-opacity': 0.75,
      'border-color': '#DDE4E4',
      'border-opacity': 1,
    },
  }
}
if (!theme.themes.value['backoffice-dark']) {
  theme.themes.value['backoffice-dark'] = {
    dark: true,
    colors: {
      'primary': '#78ADB3',
      'secondary': '#94AAAF',
      'background': '#0D171B',
      'surface': '#142329',
      'surface-variant': '#1A2C33',
      'on-background': '#E2EAEA',
      'on-surface': '#E2EAEA',
      'success': '#34D399',
      'warning': '#FFA726',
      'error': '#F87171',
      'info': '#60A5FA',
    },
    variables: {
      'medium-emphasis-opacity': 0.75,
      'border-color': '#24393F',
      'border-opacity': 1,
    },
  }
}

// Préférence stockée en cookie plutôt qu'en localStorage : elle est lue côté
// serveur, donc la page est rendue directement dans le bon thème — pas de
// flash clair avant l'hydratation.
const boTheme = useCookie('bo-theme', {
  default: () => 'light',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 365,
})
const isDark = computed(() => boTheme.value === 'dark')
const vuetifyTheme = computed(() => (isDark.value ? 'backoffice-dark' : 'backoffice'))

// Les tokens --bo-* vivent sur <html> : les overlays Vuetify (menus, dialogues,
// tooltips) sont téléportés hors du <v-app> et doivent en hériter.
useHead({
  htmlAttrs: { 'data-bo-theme': () => boTheme.value },
})

const toggleTheme = () => {
  boTheme.value = isDark.value ? 'light' : 'dark'
}

// Aucune propriété héritée du thème vitrine : cartes plates et carrées,
// champs outlined compacts, chips carrés, table dense.
const boDefaults = {
  global: { rounded: 'sm' },
  VCard: { rounded: 'sm', elevation: 0, flat: true, class: 'bo-card' },
  VSheet: { rounded: 'sm', elevation: 0 },
  VTextField: {
    variant: 'outlined',
    density: 'compact',
    hideDetails: 'auto',
    bgColor: undefined,
    color: 'primary',
    flat: false,
    class: '',
  },
  VTextarea: { variant: 'outlined', density: 'compact', hideDetails: 'auto', color: 'primary' },
  VSelect: {
    variant: 'outlined',
    density: 'compact',
    hideDetails: 'auto',
    bgColor: undefined,
    color: 'primary',
    flat: false,
  },
  VAutocomplete: {
    variant: 'outlined',
    density: 'compact',
    hideDetails: 'auto',
    bgColor: undefined,
    color: 'primary',
    flat: false,
  },
  VCombobox: { variant: 'outlined', density: 'compact', hideDetails: 'auto', color: 'primary' },
  VCheckbox: { density: 'compact', hideDetails: 'auto', color: 'primary' },
  VSwitch: { color: 'primary', baseColor: undefined, density: 'compact', hideDetails: true, inset: true },
  VBtn: { rounded: 'sm', elevation: 0, size: 'small', variant: 'outlined', color: undefined },
  VChip: { rounded: 'sm', size: 'x-small', variant: 'tonal', label: true, class: '' },
  VDataTable: { density: 'compact', hover: true },
  VList: { density: 'compact' },
  VTabs: { density: 'compact', color: 'primary' },
  VExpansionPanel: { elevation: 0, class: '' },
  VFieldLabel: { class: '' },
  VAlert: { variant: 'tonal', density: 'compact', rounded: 'sm' },
}

const envLabels = { production: 'production', preview: 'préproduction', development: 'local' }
const envLabel = envLabels[config.public.environment] || config.public.environment

const drawer = ref(true)
const railMode = ref(false)

const navGroups = [
  {
    label: 'Exploitation',
    items: [
      { title: 'Voyages', icon: mdiViewDashboardOutline, to: '/booking-management', exact: true },
      { title: 'Gestion départs', icon: mdiAirplaneTakeoff, to: '/booking-management/departures', exact: false },
      { title: 'Marges', icon: mdiCurrencyEur, to: '/booking-management/margins', exact: false },
      { title: 'Sur-mesure', icon: mdiCompassOutline, to: '/booking-management/custom-travels', exact: false },
    ],
  },
  {
    label: 'Outils',
    items: [
      { title: 'Deal ActiveCampaign', icon: mdiCardSearchOutline, to: '/booking-management/deal-inspector', exact: false },
      { title: 'Corbeille', icon: mdiDeleteRestore, to: '/booking-management/trash', exact: false },
    ],
  },
]

const bookingUser = useState('bookingUser', () => null)
const loadingUser = ref(false)

const loadBookingUser = async () => {
  if (!import.meta.client) return
  if (bookingUser.value || loadingUser.value) return

  loadingUser.value = true
  try {
    const res = await fetch('/api/v1/auth/check', { credentials: 'include' })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data?.success && data?.user?.email) {
      bookingUser.value = data.user
    }
  }
  finally {
    loadingUser.value = false
  }
}

onMounted(loadBookingUser)

const logout = async () => {
  await fetch('/api/v1/auth/logout', {
    method: 'POST',
    credentials: 'include', // important to include cookies
  })
  router.push('/booking-login')
}
</script>

<style scoped>
.bo-mobile-bar {
  background: var(--bo-surface) !important;
  border-bottom: 1px solid var(--bo-line);
}

.bo-mobile-bar .bo-rail__name {
  color: var(--bo-ink);
}
</style>
