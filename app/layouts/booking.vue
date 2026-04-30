<template>
  <v-app theme="backoffice">
    <!-- Sidebar -->
    <v-navigation-drawer
      v-model="drawer"
      :permanent="mdAndUp"
      :temporary="!mdAndUp"
      width="260"
      color="#0F172A"
      :rail="mdAndUp && railMode"
      :rail-width="64"
    >
      <div
        class="d-flex align-center pa-4 mb-2"
        :class="railMode ? 'justify-center' : ''"
      >
        <NuxtLink
          to="/booking-management"
          class="d-flex align-center text-white text-decoration-none"
        >
          <v-avatar
            size="32"
            color="primary"
            class="font-weight-bold"
          >
            O
          </v-avatar>
          <span
            v-if="!railMode"
            class="text-subtitle-1 font-weight-bold ml-3"
          >
            Backoffice
          </span>

        </NuxtLink>
        <v-spacer />
        <!-- Rail toggle (desktop only) -->
        <div
          v-if="mdAndUp"
          class="d-flex justify-end"
        >
          <v-btn
            icon
            size="x-small"
            variant="text"
            style="color: rgba(255,255,255,0.4);"
            @click="railMode = !railMode"
          >
            <v-icon size="18">
              {{ railMode ? mdiChevronRight : mdiChevronLeft }}
            </v-icon>
          </v-btn>
        </div>
      </div>

      <v-divider
        class="mb-2"
        style="border-color: rgba(255,255,255,0.08);"
      />

      <v-list
        density="compact"
        nav
        class="px-2 bg-primary"
      >
        <v-list-item
          v-for="nav in navItems"
          :key="nav.to"
          :to="nav.to"
          :prepend-icon="nav.icon"
          :title="nav.title"
          :exact="nav.exact"
          rounded="lg"
          class="mb-1"
        />
      </v-list>

      <template #append>
        <v-divider style="border-color: rgba(255,255,255,0.08);" />
        <div
          v-if="bookingUser"
          class="pa-3"
        >
          <div
            class="d-flex align-center"
            :class="railMode ? 'justify-center' : ''"
          >
            <v-avatar
              size="32"
              color="rgba(255,255,255,0.1)"
            >
              <v-img
                v-if="bookingUser.picture"
                :src="bookingUser.picture"
                alt="Avatar"
                sizes="(max-width: 600px) 70px, 100px"
                rounded="circle"
              />
              <span
                v-else
                class="text-caption text-white"
              >
                {{ (bookingUser.email || '?').slice(0, 1).toUpperCase() }}
              </span>
            </v-avatar>
            <div
              v-if="!railMode"
              class="ml-3 flex-grow-1"
              style="min-width: 0;"
            >
              <div class="text-caption text-white text-truncate">
                {{ bookingUser.email }}
              </div>
            </div>
            <v-btn
              v-if="!railMode"
              icon
              size="x-small"
              variant="text"
              style="color: rgba(255,255,255,0.5);"
              @click="logout"
            >
              <v-icon size="16">
                {{ mdiLogout }}
              </v-icon>
            </v-btn>
          </div>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Mobile top bar -->
    <v-app-bar
      v-if="!mdAndUp"
      elevation="0"
      height="48"
      color="surface"
      style="border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);"
    >
      <v-btn
        icon
        variant="text"
        @click="drawer = !drawer"
      >
        <v-icon>{{ mdiMenu }}</v-icon>
      </v-btn>

      <v-breadcrumbs
        :items="items.map(item => ({
          title: item.label,
          to: item.to,
        }))"
        density="compact"
        class="text-caption"
      >
        <template #prepend>
          <v-icon
            :icon="mdiHome"
            size="small"
          />
        </template>
      </v-breadcrumbs>
    </v-app-bar>

    <v-main>
      <!-- Desktop breadcrumbs -->
      <div
        v-if="mdAndUp"
        class="px-6 pt-4 pb-0"
      >
        <v-breadcrumbs
          :items="items.map(item => ({
            title: item.label,
            to: item.to,
          }))"
          density="compact"
          class="pa-0 text-caption"
        >
          <template #prepend>
            <v-icon
              :icon="mdiHome"
              size="small"
              class="mr-1"
            />
          </template>
        </v-breadcrumbs>
      </div>
      <slot />
    </v-main>
  </v-app>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useDisplay, useTheme } from 'vuetify'
import { mdiHome, mdiLogout, mdiViewDashboardOutline, mdiAirplaneTakeoff, mdiCompassOutline, mdiMenu, mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import { useImage } from '#imports'

// Register the `backoffice` theme on demand. Keeping it out of the global
// Vuetify config means the public bundle ships ~15-25 KiB less CSS.
const theme = useTheme()
if (!theme.themes.value.backoffice) {
  theme.themes.value.backoffice = {
    dark: false,
    colors: {
      'primary': 'rgba(43, 76, 82, 1)',
      'primary-darken-1': '#2563EB',
      'secondary': '#64748B',
      'background': '#F8FAFC',
      'surface': '#FFFFFF',
      'surface-variant': '#F1F5F9',
      'on-background': '#0F172A',
      'on-surface': '#1E293B',
      'success': '#10B981',
      'warning': '#F59E0B',
      'error': '#EF4444',
      'info': '#6366F1',
      'grey': '#94A3B8',
      'grey-light': '#F1F5F9',
    },
    variables: {
      'medium-emphasis-opacity': 0.6,
      'border-color': '#E2E8F0',
      'border-opacity': 1,
    },
  }
}

const items = useBreadcrumbItems() // uses the current route
const { header: _header } = useAppConfig()
const { mdAndUp } = useDisplay()
const _img = useImage()
const router = useRouter()

const drawer = ref(true)
const railMode = ref(false)

const navItems = [
  { title: 'Voyages', icon: mdiViewDashboardOutline, to: '/booking-management', exact: true },
  { title: 'Gestion départs', icon: mdiAirplaneTakeoff, to: '/booking-management/departures', exact: false },
  { title: 'Sur-mesure', icon: mdiCompassOutline, to: '/booking-management/custom-travels', exact: false },
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
  // Then redirect to login or home page
  router.push('/booking-login')
}
</script>
