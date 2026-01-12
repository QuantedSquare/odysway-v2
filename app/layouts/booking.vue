<template>
  <v-app>
    <v-app-bar
      elevation="0"
      class="px-4"
      :class="mdAndUp ? '' : 'app-bar-shadow mt-2'"
      rounded="lg"
      :height="mdAndUp ? '90' : '52'"
    >
      <NuxtLink
        to="/"
      >
        <v-img
          :min-width="mdAndUp ? '150px' : '100px'"
          height="38"
          :src="img(header.logo.desktop, { format: 'webp', quality: 100, width: 320 })"
        />
      </NuxtLink>
      <v-breadcrumbs
        :items="items.map(item => ({
          title: item.label,
          to: item.to,
        }))"
      >
        <template #prepend>
          <v-icon
            :icon="mdiHome"
            size="small"
          />
        </template>
      </v-breadcrumbs>

      <v-spacer />

      <v-btn
        v-if="bookingUser"
        variant="text"
        class="text-none"
        :title="bookingUser.email"
      >
        <v-avatar
          size="28"
          class="mr-2"
        >
          <v-img
            v-if="bookingUser.picture"
            :src="bookingUser.picture"
            alt="Avatar"
          />
          <span
            v-else
            class="text-caption"
          >
            {{ (bookingUser.email || '?').slice(0, 1).toUpperCase() }}
          </span>
        </v-avatar>
        <span v-if="mdAndUp">{{ bookingUser.email }}</span>
      </v-btn>

      <v-btn
        variant="text"
        :prepend-icon="mdiLogout"
        @click="logout"
      >
        Se déconnecter
      </v-btn>
    </v-app-bar>
    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useDisplay } from 'vuetify'
import { mdiHome, mdiLogout } from '@mdi/js'
import { useImage } from '#imports'

const items = useBreadcrumbItems() // uses the current route
const { header } = useAppConfig()
const { mdAndUp } = useDisplay()
const img = useImage()
const router = useRouter()

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
