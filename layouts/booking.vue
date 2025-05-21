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
      <!-- <div class="d-flex align-center px-4 py-2">
        <NuxtLink
          class="text-decoration-none"
          @click="router.back()"
        >
          <v-btn
            variant="text"
            prepend-icon="mdi-arrow-left"
          >
            Retour
          </v-btn>
        </NuxtLink>
      </div> -->
    </v-app-bar>
    <v-main>
      <slot />
    </v-main>
    <!-- <FooterOdysway /> -->
  </v-app>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { mdiHome } from '@mdi/js'
import { useImage } from '#imports'

const items = useBreadcrumbItems() // uses the current route
const { header } = useAppConfig()
const { mdAndUp } = useDisplay()
const img = useImage()
</script>
